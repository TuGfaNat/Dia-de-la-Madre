import { Router, Request, Response } from 'express';
import { getSettings, saveSettings, StoreSettings } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// GET /api/settings (Público)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las configuraciones' });
  }
});

// PUT /api/settings (Protegido)
router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const newSettings: StoreSettings = req.body;
    if (!newSettings || !newSettings.storeName) {
      res.status(400).json({ error: 'Configuraciones inválidas' });
      return;
    }

    await saveSettings(newSettings);
    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar las configuraciones' });
  }
});

export default router;
