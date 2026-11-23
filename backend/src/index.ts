import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

import { ensureDbInitialized } from './db.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import adminRouter from './routes/admin.js';
import uploadRouter from './routes/upload.js';
import cronRouter from './routes/cron.js';
import settingsRouter from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración CORS dinámica y permisiva para Docker y entornos locales
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (como curl o server-to-server) o si coincide con allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // En Coolify a menudo se comparte proxy o dominios dinámicos
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos subidos (fotos de productos)
app.use('/uploads', express.static(uploadsDir));

// Healthcheck endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', uptime: process.uptime() });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', uptime: process.uptime() });
});

// Rutas de API
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/cron', cronRouter);
app.use('/api/settings', settingsRouter);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`[Backend] Servidor corriendo en el puerto ${PORT}`);
  try {
    await ensureDbInitialized();
  } catch (err) {
    console.warn('[Backend] Advertencia en inicialización de DB:', err);
  }
});
