// Force redeploy to trigger Vercel environment variables update for Vercel KV
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string; // Se mantiene por retrocompatibilidad
  images?: string[]; // Soporte para múltiples fotos
  category: string;
}

export interface Category {
  id: string;
  name: string;
}

const dbFilePath = path.join(process.cwd(), 'src/data/products.json');
const categoriesFilePath = path.join(process.cwd(), 'src/data/categories.json');

// Fallback en memoria global para Vercel en caso de que no haya KV
declare global {
  var __memoryProducts: Product[] | undefined;
  var __memoryCategories: Category[] | undefined;
}

const isKVEnabled = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

export async function getProducts(): Promise<Product[]> {
  let products: Product[] = [];

  // 1. Si Vercel KV está configurado (por ejemplo, al conectarlo en Vercel con 1 clic), lo usamos
  if (isKVEnabled()) {
    try {
      const kvProducts = await kv.get<Product[]>('mama_products');
      if (kvProducts) {
        products = kvProducts;
      } else {
        // Inicializar KV con el contenido del archivo local si está vacío
        const localProducts = getLocalProducts();
        await kv.set('mama_products', localProducts);
        products = localProducts;
      }
    } catch (error) {
      console.error("Error leyendo de Vercel KV, usando fallback local/memoria:", error);
      products = globalThis.__memoryProducts || getLocalProducts();
    }
  } else {
    products = globalThis.__memoryProducts || getLocalProducts();
  }

  // Normalizar imágenes para asegurar compatibilidad con productos antiguos
  return products.map(p => ({
    ...p,
    images: p.images && p.images.length > 0 ? p.images : [p.image]
  }));
}

function getLocalProducts(): Product[] {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    const products = JSON.parse(data);
    globalThis.__memoryProducts = products;
    return products;
  } catch (error) {
    console.error("Error leyendo archivo local de productos:", error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<boolean> {
  // 1. Si Vercel KV está habilitado, guardamos allí
  if (isKVEnabled()) {
    try {
      await kv.set('mama_products', products);
      return true;
    } catch (error) {
      console.error("Error guardando en Vercel KV:", error);
    }
  }

  // 2. Si no, guardamos localmente (para desarrollo) y en memoria (para producción temporal)
  globalThis.__memoryProducts = products;
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn(
      "Advertencia: No se pudo escribir en el archivo físico (normal en Vercel Serverless). Guardado temporalmente en memoria:",
      error
    );
    return true;
  }
}

// Métodos para el CRUD de Categorías

export async function getCategories(): Promise<Category[]> {
  if (isKVEnabled()) {
    try {
      const categories = await kv.get<Category[]>('mama_categories');
      if (categories) {
        return categories;
      }
      // Inicializar KV con el contenido del archivo local si está vacío
      const localCategories = getLocalCategories();
      await kv.set('mama_categories', localCategories);
      return localCategories;
    } catch (error) {
      console.error("Error leyendo de Vercel KV las categorías, usando fallback:", error);
    }
  }

  if (globalThis.__memoryCategories) {
    return globalThis.__memoryCategories;
  }
  return getLocalCategories();
}

function getLocalCategories(): Category[] {
  try {
    const data = fs.readFileSync(categoriesFilePath, 'utf8');
    const categories = JSON.parse(data);
    globalThis.__memoryCategories = categories;
    return categories;
  } catch (error) {
    console.error("Error leyendo archivo local de categorías:", error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<boolean> {
  if (isKVEnabled()) {
    try {
      await kv.set('mama_categories', categories);
      return true;
    } catch (error) {
      console.error("Error guardando categorías en Vercel KV:", error);
    }
  }

  globalThis.__memoryCategories = categories;
  try {
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn(
      "Advertencia: No se pudo escribir en el archivo físico de categorías (normal en Vercel Serverless). Guardado temporalmente en memoria:",
      error
    );
    return true;
  }
}
