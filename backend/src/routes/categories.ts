import { Router, Request, Response } from 'express';
import { getCategories, saveCategories, getProducts, saveProducts, Category } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// GET /api/categories (Público)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
});

// POST /api/categories (Protegido)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
      return;
    }

    const trimmedName = name.trim();
    const categories = await getCategories();

    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      res.status(400).json({ error: 'Esta categoría ya existe' });
      return;
    }

    let id = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!id) {
      id = String(Date.now());
    }

    if (categories.some((c) => c.id === id)) {
      id = `${id}-${Date.now()}`;
    }

    const newCategory: Category = {
      id,
      name: trimmedName
    };

    categories.push(newCategory);
    await saveCategories(categories);

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar la categoría' });
  }
});

// PUT /api/categories/:id (Protegido)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
      return;
    }

    const trimmedNewName = name.trim();
    const categories = await getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    const oldName = categories[index].name;

    const duplicate = categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === trimmedNewName.toLowerCase()
    );

    if (duplicate) {
      res.status(400).json({ error: 'Ya existe otra categoría con este nombre' });
      return;
    }

    categories[index].name = trimmedNewName;
    await saveCategories(categories);

    // Actualizar productos asociados
    const products = await getProducts();
    let productsUpdated = false;

    products.forEach((product) => {
      if (product.category === oldName) {
        product.category = trimmedNewName;
        productsUpdated = true;
      }
    });

    if (productsUpdated) {
      await saveProducts(products);
    }

    res.json(categories[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
});

// DELETE /api/categories/:id (Protegido)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categories = await getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    const categoryToDelete = categories[index];
    const oldName = categoryToDelete.name;

    if (categoryToDelete.id === 'general' || oldName.toLowerCase() === 'general') {
      res.status(400).json({ error: 'No se puede eliminar la categoría por defecto (General)' });
      return;
    }

    categories.splice(index, 1);

    let hasGeneral = categories.some((c) => c.id === 'general' || c.name.toLowerCase() === 'general');
    if (!hasGeneral) {
      categories.push({ id: 'general', name: 'General' });
    }

    await saveCategories(categories);

    // Reasignar productos huérfanos a General
    const products = await getProducts();
    let productsUpdated = false;

    products.forEach((product) => {
      if (product.category === oldName) {
        product.category = 'General';
        productsUpdated = true;
      }
    });

    if (productsUpdated) {
      await saveProducts(products);
    }

    res.json({
      success: true,
      message: 'Categoría eliminada con éxito y productos reasignados a General'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
});

export default router;
