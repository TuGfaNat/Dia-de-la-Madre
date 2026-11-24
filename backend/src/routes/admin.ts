import { Router, Request, Response } from 'express';
import { sql, isDbEnabled, getProducts, saveProducts, Product } from '../db.js';
import {
  createSessionToken,
  verifySessionToken,
  requireAuth,
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from '../auth.js';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /api/admin/login con Rate Limiting y tokens firmados
router.post('/login', (req: Request, res: Response) => {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip);

    if (limit.blocked) {
      res.status(429).json({
        error: `Demasiados intentos fallidos. Por seguridad, el acceso está bloqueado durante ${limit.remainingMinutes} minutos.`,
      });
      return;
    }

    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'Mama2026';

    if (password && password === adminPassword) {
      recordSuccessfulLogin(ip);
      const token = createSessionToken();

      res.cookie('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 1 día
        path: '/',
      });

      res.json({ success: true, message: 'Autenticación exitosa', token });
      return;
    }

    const attemptResult = recordFailedAttempt(ip);
    if (attemptResult.isNowBlocked) {
      res.status(429).json({
        error: 'Has superado el límite de 5 intentos permitidos. Panel bloqueado por 15 minutos.',
      });
      return;
    }

    res.status(401).json({
      error: `Contraseña incorrecta. Te quedan ${attemptResult.attemptsLeft} intentos antes del bloqueo temporal.`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor de autenticación' });
  }
});

// POST /api/admin/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('admin_session', { path: '/' });
  res.json({ success: true, message: 'Sesión cerrada con éxito' });
});

// GET /api/admin/check
router.get('/check', (req: Request, res: Response) => {
  const session = req.cookies?.admin_session;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (verifySessionToken(session || bearerToken)) {
    res.json({ authenticated: true });
    return;
  }
  res.status(401).json({ authenticated: false });
});

// GET /api/admin/db-status
router.get('/db-status', requireAuth, async (_req: Request, res: Response) => {
  try {
    const dbEnabled = isDbEnabled();
    let dbWorking = false;
    let dbError = null;
    let productsCount = 0;

    if (dbEnabled) {
      try {
        const result = await sql`SELECT COUNT(*)::int as count FROM products`;
        dbWorking = true;
        productsCount = result[0].count;
      } catch (err: any) {
        dbWorking = false;
        dbError = err.message || String(err);
      }
    }

    res.json({
      kvEnabled: dbEnabled,
      kvWorking: dbWorking,
      kvError: dbError,
      productsCount,
      env: {
        hasUrl: !!process.env.DATABASE_URL,
        hasToken: false,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sync
router.get('/sync', requireAuth, async (req: Request, res: Response) => {
  try {
    const forceStock = req.query.force_stock === 'true';
    const reset = req.query.reset === 'true';

    const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
    const dbFilePath = path.join(dataDir, 'products.json');

    let localProducts: Product[] = [];
    try {
      if (fs.existsSync(dbFilePath)) {
        const data = fs.readFileSync(dbFilePath, 'utf8');
        localProducts = JSON.parse(data);
      }
    } catch (e: any) {
      res.status(500).json({ error: `Error leyendo productos locales: ${e.message}` });
      return;
    }

    if (reset) {
      await saveProducts(localProducts);
      res.json({
        message: 'Reseteo completo completado con éxito',
        action: 'reset',
        count: localProducts.length,
        products: localProducts
      });
      return;
    }

    const currentProducts = await getProducts();
    const mergedProducts: Product[] = [];
    const productsMap = new Map<string, Product>();

    currentProducts.forEach(p => {
      productsMap.set(p.id, p);
      productsMap.set(p.name.toLowerCase().trim(), p);
    });

    localProducts.forEach(localP => {
      const keyById = localP.id;
      const keyByName = localP.name.toLowerCase().trim();
      const existing = productsMap.get(keyById) || productsMap.get(keyByName);

      if (existing) {
        const merged: Product = {
          ...existing,
          name: localP.name,
          description: localP.description,
          price: localP.price,
          category: localP.category,
          image: localP.image,
          images: localP.images && localP.images.length > 0 ? localP.images : [localP.image],
          stock: forceStock ? localP.stock : existing.stock
        };
        mergedProducts.push(merged);
        productsMap.delete(existing.id);
        productsMap.delete(existing.name.toLowerCase().trim());
      } else {
        mergedProducts.push({
          ...localP,
          images: localP.images && localP.images.length > 0 ? localP.images : [localP.image]
        });
      }
    });

    const addedIds = new Set<string>();
    productsMap.forEach(p => {
      if (!addedIds.has(p.id)) {
        mergedProducts.push(p);
        addedIds.add(p.id);
      }
    });

    await saveProducts(mergedProducts);

    res.json({
      message: 'Sincronización completada con éxito',
      action: 'merge',
      totalProducts: mergedProducts.length,
      products: mergedProducts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error en la sincronización' });
  }
});

export default router;
