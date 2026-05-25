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

const dbFilePath = path.join(process.cwd(), 'src/data/products.json');
const categoriesFilePath = path.join(process.cwd(), 'src/data/categories.json');

// Fallback en memoria global para Vercel en caso de que no haya base de datos
declare global {
  var __memoryProducts: Product[] | undefined;
  var __memoryCategories: Category[] | undefined;
}

// Configuración de PostgreSQL cliente seguro para serverless
let sql: any = null;
if (process.env.DATABASE_URL) {
  try {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  } catch (err) {
    console.error("Error al instanciar el cliente PostgreSQL:", err);
  }
}

export const isDbEnabled = () => {
  return !!(process.env.DATABASE_URL && sql);
};

let dbInitializedPromise: Promise<void> | null = null;

async function ensureDbInitialized() {
  if (!isDbEnabled()) return;
  if (!dbInitializedPromise) {
    dbInitializedPromise = (async () => {
      try {
        // Crear tabla de categorías
        await sql`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
          )
        `;
        // Crear tabla de productos
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
        const catCountResult = await sql`SELECT COUNT(*)::int as count FROM categories`;
        if (catCountResult[0].count === 0) {
          console.log("Sembrando categorías en PostgreSQL...");
          const localCategories = getLocalCategories();
          if (localCategories.length > 0) {
            for (const cat of localCategories) {
              await sql`
                INSERT INTO categories (id, name)
                VALUES (${cat.id}, ${cat.name})
                ON CONFLICT (id) DO NOTHING
              `;
            }
          }
        }

        // Sembrar productos si está vacía
        const prodCountResult = await sql`SELECT COUNT(*)::int as count FROM products`;
        if (prodCountResult[0].count === 0) {
          console.log("Sembrando productos en PostgreSQL...");
          const localProducts = getLocalProducts();
          if (localProducts.length > 0) {
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
        }
      } catch (error) {
        console.error("Error al inicializar las tablas de PostgreSQL:", error);
        dbInitializedPromise = null; // Reiniciar en caso de error para reintentar
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
      console.error("Error leyendo de Postgres, usando fallback local/memoria:", error);
    }
  }

  const products = globalThis.__memoryProducts || getLocalProducts();
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
      console.error("Error guardando productos en PostgreSQL:", error);
    }
  }

  globalThis.__memoryProducts = products;
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn("Advertencia: No se pudo escribir en el archivo físico. Guardado temporalmente en memoria:", error);
    return true;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (isDbEnabled()) {
    try {
      await ensureDbInitialized();
      const rows = await sql`SELECT id, name FROM categories`;
      return rows.map((r: any) => ({
        id: r.id,
        name: r.name
      }));
    } catch (error) {
      console.error("Error leyendo categorías de Postgres, usando fallback:", error);
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
      console.error("Error guardando categorías en PostgreSQL:", error);
    }
  }

  globalThis.__memoryCategories = categories;
  try {
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.warn("Advertencia: No se pudo escribir en el archivo físico de categorías. Guardado temporalmente en memoria:", error);
    return true;
  }
}

// Exportar la conexión sql para consultas personalizadas externas
export { sql };
