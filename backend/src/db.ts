import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  category: string;
}

export interface Category {
  id: string;
  name: string;
}

const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const dbFilePath = path.join(dataDir, 'products.json');
const categoriesFilePath = path.join(dataDir, 'categories.json');

// Memoria global como fallback
let memoryProducts: Product[] | null = null;
let memoryCategories: Category[] | null = null;

// Configuración de PostgreSQL
export let sql: any = null;

if (process.env.DATABASE_URL) {
  try {
    const isSslRequired = process.env.DATABASE_SSL === 'true' || 
      (!process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1') && !process.env.DATABASE_URL.includes('db:5432'));
    
    sql = postgres(process.env.DATABASE_URL, {
      ssl: isSslRequired ? 'require' : false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    console.log('[DB] Cliente PostgreSQL configurado.');
  } catch (err) {
    console.error('[DB] Error al inicializar cliente PostgreSQL:', err);
  }
}

export const isDbEnabled = () => {
  return !!(process.env.DATABASE_URL && sql);
};

let dbInitializedPromise: Promise<void> | null = null;

export async function ensureDbInitialized(): Promise<void> {
  if (!isDbEnabled()) return;
  if (!dbInitializedPromise) {
    dbInitializedPromise = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
          )
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC NOT NULL,
            stock INTEGER NOT NULL,
            image TEXT NOT NULL,
            images TEXT[] NOT NULL,
            category TEXT NOT NULL
          )
        `;

        // Sembrar categorías si está vacía
        const catCount = await sql`SELECT COUNT(*)::int as count FROM categories`;
        if (catCount[0].count === 0) {
          console.log('[DB] Sembrando categorías iniciales en PostgreSQL...');
          const localCategories = getLocalCategories();
          for (const cat of localCategories) {
            await sql`
              INSERT INTO categories (id, name)
              VALUES (${cat.id}, ${cat.name})
              ON CONFLICT (id) DO NOTHING
            `;
          }
        }

        // Sembrar productos si está vacía
        const prodCount = await sql`SELECT COUNT(*)::int as count FROM products`;
        if (prodCount[0].count === 0) {
          console.log('[DB] Sembrando productos iniciales en PostgreSQL...');
          const localProducts = getLocalProducts();
          for (const prod of localProducts) {
            await sql`
              INSERT INTO products (id, name, description, price, stock, image, images, category)
              VALUES (
                ${prod.id},
                ${prod.name},
                ${prod.description},
                ${prod.price},
                ${prod.stock},
                ${prod.image},
                ${prod.images || [prod.image]},
                ${prod.category}
              )
              ON CONFLICT (id) DO NOTHING
            `;
          }
        }

        console.log('[DB] Base de datos PostgreSQL inicializada con éxito.');
      } catch (error) {
        console.error('[DB] Error al inicializar las tablas de PostgreSQL:', error);
        dbInitializedPromise = null;
        throw error;
      }
    })();
  }
  return dbInitializedPromise;
}

export async function getProducts(): Promise<Product[]> {
  if (isDbEnabled()) {
    try {
      await ensureDbInitialized();
      const rows = await sql`
        SELECT id, name, description, price::float as price, stock, image, images, category
        FROM products
        ORDER BY id ASC
      `;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price: r.price,
        stock: r.stock,
        image: r.image,
        images: r.images,
        category: r.category
      }));
    } catch (error) {
      console.error('[DB] Error leyendo de Postgres, usando fallback local/memoria:', error);
    }
  }

  const products = memoryProducts || getLocalProducts();
  return products.map(p => ({
    ...p,
    images: p.images && p.images.length > 0 ? p.images : [p.image]
  }));
}

export function getLocalProducts(): Product[] {
  try {
    if (fs.existsSync(dbFilePath)) {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      const products = JSON.parse(data);
      memoryProducts = products;
      return products;
    }
  } catch (error) {
    console.error('[DB] Error leyendo archivo local de productos:', error);
  }
  return [];
}

export async function saveProducts(products: Product[]): Promise<boolean> {
  if (isDbEnabled()) {
    try {
      await ensureDbInitialized();
      await sql.begin(async (sqlTrans: any) => {
        await sqlTrans`TRUNCATE TABLE products`;
        if (products.length > 0) {
          for (const p of products) {
            await sqlTrans`
              INSERT INTO products (id, name, description, price, stock, image, images, category)
              VALUES (
                ${p.id},
                ${p.name},
                ${p.description},
                ${p.price},
                ${p.stock},
                ${p.image},
                ${p.images || [p.image]},
                ${p.category}
              )
            `;
          }
        }
      });
      return true;
    } catch (error) {
      console.error('[DB] Error guardando productos en PostgreSQL:', error);
    }
  }

  memoryProducts = products;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn('[DB] No se pudo escribir en el archivo físico. Guardado en memoria:', error);
    return true;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (isDbEnabled()) {
    try {
      await ensureDbInitialized();
      const rows = await sql`SELECT id, name FROM categories ORDER BY id ASC`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name
      }));
    } catch (error) {
      console.error('[DB] Error leyendo categorías de Postgres, usando fallback:', error);
    }
  }

  if (memoryCategories) {
    return memoryCategories;
  }
  return getLocalCategories();
}

export function getLocalCategories(): Category[] {
  try {
    if (fs.existsSync(categoriesFilePath)) {
      const data = fs.readFileSync(categoriesFilePath, 'utf8');
      const categories = JSON.parse(data);
      memoryCategories = categories;
      return categories;
    }
  } catch (error) {
    console.error('[DB] Error leyendo archivo local de categorías:', error);
  }
  return [];
}

export async function saveCategories(categories: Category[]): Promise<boolean> {
  if (isDbEnabled()) {
    try {
      await ensureDbInitialized();
      await sql.begin(async (sqlTrans: any) => {
        await sqlTrans`TRUNCATE TABLE categories`;
        if (categories.length > 0) {
          for (const c of categories) {
            await sqlTrans`
              INSERT INTO categories (id, name)
              VALUES (${c.id}, ${c.name})
            `;
          }
        }
      });
      return true;
    } catch (error) {
      console.error('[DB] Error guardando categorías en PostgreSQL:', error);
    }
  }

  memoryCategories = categories;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn('[DB] No se pudo escribir en el archivo físico de categorías. Guardado en memoria:', error);
    return true;
  }
}
