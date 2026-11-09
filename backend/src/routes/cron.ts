import { Router, Request, Response } from 'express';
import { sql, isDbEnabled } from '../db.js';

const router = Router();

// GET /api/cron/keep-alive
router.get('/keep-alive', async (_req: Request, res: Response) => {
  try {
    if (!isDbEnabled()) {
      res.status(400).json({
        success: false,
        message: 'Database connection URL not set'
      });
      return;
    }

    const result = await sql`SELECT 1 as ping`;
    res.json({
      success: true,
      message: 'Database ping successful',
      timestamp: new Date().toISOString(),
      result: result[0]
    });
  } catch (error: any) {
    console.error('Keep-Alive database ping failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database ping failed',
      error: error.message || String(error)
    });
  }
});

export default router;
