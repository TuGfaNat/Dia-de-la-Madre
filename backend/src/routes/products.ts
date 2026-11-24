import { Router, Request, Response } from 'express';
import { getProducts, saveProducts, Product } from '../db.js';

const router = Router();

// GET /api/products
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

// POST /api/products
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, image, images, category, season, colors } = req.body;

    if (!name || !description || price === undefined || stock === undefined || !category) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    let finalImages: string[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      finalImages = images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
    } else if (image && typeof image === 'string' && image.trim() !== '') {
      finalImages = [image.trim()];
    }

    if (finalImages.length === 0) {
      res.status(400).json({ error: 'Debe proporcionar al menos una imagen' });
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({ error: 'Precio inválido' });
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      res.status(400).json({ error: 'Stock inválido' });
      return;
    }

    const products = await getProducts();

    const newProduct: Product = {
      id: String(Date.now()),
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      stock: stockNum,
      image: finalImages[0],
      images: finalImages,
      category: category.trim(),
      season: season ? season.trim() : 'General',
      colors: Array.isArray(colors) ? colors.filter((c: any) => typeof c === 'string' && c.trim()) : [],
    };

    products.push(newProduct);
    await saveProducts(products);

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image, images, category, season, colors } = req.body;

    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const currentProduct = products[index];

    const priceNum = price !== undefined ? parseFloat(price) : currentProduct.price;
    const stockNum = stock !== undefined ? parseInt(stock, 10) : currentProduct.stock;

    if (isNaN(priceNum) || priceNum < 0) {
      res.status(400).json({ error: 'Precio inválido' });
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      res.status(400).json({ error: 'Stock inválido' });
      return;
    }

    let finalImages: string[] | undefined = undefined;
    if (images && Array.isArray(images)) {
      finalImages = images.filter((img: any) => typeof img === 'string' && img.trim() !== '');
    } else if (image && typeof image === 'string' && image.trim() !== '') {
      finalImages = [image.trim()];
    }

    const updatedProduct: Product = {
      ...currentProduct,
      name: name !== undefined ? name.trim() : currentProduct.name,
      description: description !== undefined ? description.trim() : currentProduct.description,
      price: priceNum,
      stock: stockNum,
      image: finalImages && finalImages.length > 0 ? finalImages[0] : (image ?? currentProduct.image),
      images: finalImages ?? currentProduct.images,
      category: category !== undefined ? category.trim() : currentProduct.category,
      season: season !== undefined ? season.trim() : (currentProduct.season || 'General'),
      colors: colors !== undefined ? (Array.isArray(colors) ? colors.filter((c: any) => typeof c === 'string' && c.trim()) : []) : currentProduct.colors,
    };

    products[index] = updatedProduct;
    await saveProducts(products);

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    products.splice(index, 1);
    await saveProducts(products);

    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

export default router;
