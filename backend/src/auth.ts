import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Secreto criptográfico único para firmar sesiones
const AUTH_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  (process.env.ADMIN_PASSWORD || 'Mama2026') + '_shironeko_craft_salt_2026';

export interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Crea un token criptográfico HMAC-SHA256 con fecha de expiración
 */
export function createSessionToken(): string {
  const payload: SessionPayload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24, // 24 horas
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifica matemáticamente la firma del token y su tiempo de vida
 */
export function verifySessionToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadStr, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadStr)
    .digest('base64url');

  // Comparación de tiempo constante (timingSafeEqual) para evitar ataques de temporización
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return false;
    }
  } catch {
    return false;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf8')
    );

    if (payload.role !== 'admin') return false;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) {
      return false; // Expirado
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Middleware para rutas protegidas del panel de administración
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionCookie = req.cookies?.admin_session;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = sessionCookie || bearerToken;

  if (verifySessionToken(token)) {
    return next();
  }

  res.status(401).json({
    error: 'No autorizado. Debes iniciar sesión como administrador de Shiro Neko Lab.',
  });
};

// Rate limiter anti-fuerza bruta en memoria
interface RateLimitEntry {
  attempts: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function checkRateLimit(ip: string): { blocked: boolean; remainingMinutes?: number } {
  const entry = loginAttempts.get(ip);
  if (!entry) return { blocked: false };

  if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
    const remainingMs = entry.blockedUntil - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { blocked: true, remainingMinutes };
  }

  if (entry.blockedUntil && Date.now() >= entry.blockedUntil) {
    loginAttempts.delete(ip);
    return { blocked: false };
  }

  return { blocked: false };
}

export function recordFailedAttempt(ip: string): { attemptsLeft: number; isNowBlocked: boolean } {
  let entry = loginAttempts.get(ip);
  if (!entry) {
    entry = { attempts: 0 };
    loginAttempts.set(ip, entry);
  }

  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    return { attemptsLeft: 0, isNowBlocked: true };
  }

  return { attemptsLeft: MAX_ATTEMPTS - entry.attempts, isNowBlocked: false };
}

export function recordSuccessfulLogin(ip: string): void {
  loginAttempts.delete(ip);
}
