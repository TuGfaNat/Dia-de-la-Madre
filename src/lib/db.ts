import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

const dbFilePath = path.join(process.cwd(), 'src/data/products.json');

// Fallback en memoria global para Vercel en caso de que no haya KV
declare global {
  var __memoryProducts: Product[] | undefined;
}

const isKVEnabled = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

export async function getProducts(): Promise<Product[]> {
  // 1. Si Vercel KV está configurado (por ejemplo, al conectarlo en Vercel con 1 clic), lo usamos
  if (isKVEnabled()) {
    try {
      const products = await kv.get<Product[]>('mama_products');
      if (products) {
        return products;
      }
      // Inicializar KV con el contenido del archivo local si está vacío
      const localProducts = getLocalProducts();
      await kv.set('mama_products', localProducts);
      return localProducts;
    } catch (error) {
      console.error("Error leyendo de Vercel KV, usando fallback local/memoria:", error);
    }
  }

  // 2. Si no, usamos memoria o el archivo local
  if (globalThis.__memoryProducts) {
    return globalThis.__memoryProducts;
  }
  return getLocalProducts();
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

