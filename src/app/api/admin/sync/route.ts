import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProducts, saveProducts, Product } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    // 1. Verificar sesión
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    // Permitir acceso si tiene la cookie de autenticado o si pasa el token secreto en la URL
    const isAuthenticated = 
      (session && session.value === 'authenticated_session_token_mama') || 
      secret === 'authenticated_session_token_mama';

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const forceStock = url.searchParams.get('force_stock') === 'true';
    const reset = url.searchParams.get('reset') === 'true';

    // 2. Leer productos del JSON local (Source of Truth)
    const dbFilePath = path.join(process.cwd(), 'src/data/products.json');
    let localProducts: Product[] = [];
    try {
      const data = fs.readFileSync(dbFilePath, 'utf8');
      localProducts = JSON.parse(data);
    } catch (e: any) {
      return NextResponse.json({ error: `Error leyendo productos locales: ${e.message}` }, { status: 500 });
    }

    // Modo reset total: Reemplaza KV con el archivo local
    if (reset) {
      await saveProducts(localProducts);
      return NextResponse.json({
        message: 'Reseteo completo completado con éxito',
        action: 'reset',
        count: localProducts.length,
        products: localProducts
      });
    }

    // Obtener productos actuales en KV para hacer el merge inteligente
    const kvProducts = await getProducts();
    const mergedProducts: Product[] = [];

    // Mapear productos existentes en KV para buscarlos rápido
    const kvProductsMap = new Map<string, Product>();
    kvProducts.forEach(p => {
      // Clave: ID o el nombre normalizado en minúsculas
      const keyById = p.id;
      const keyByName = p.name.toLowerCase().trim();
      kvProductsMap.set(keyById, p);
      kvProductsMap.set(keyByName, p);
    });

    localProducts.forEach(localP => {
      const keyById = localP.id;
      const keyByName = localP.name.toLowerCase().trim();
      
      const existingProduct = kvProductsMap.get(keyById) || kvProductsMap.get(keyByName);

      if (existingProduct) {
        // PRODUCTO EXISTENTE: Actualizar campos informativos y preservar el stock de producción
        const merged: Product = {
          ...existingProduct,
          name: localP.name,
          description: localP.description,
          price: localP.price,
          category: localP.category,
          image: localP.image,
          images: localP.images && localP.images.length > 0 ? localP.images : [localP.image],
          // Si forceStock es true, usa el stock del JSON. Si no, respeta el de producción en KV.
          stock: forceStock ? localP.stock : existingProduct.stock
        };
        mergedProducts.push(merged);

        // Eliminar del mapa para saber cuáles no se emparejaron
        kvProductsMap.delete(existingProduct.id);
        kvProductsMap.delete(existingProduct.name.toLowerCase().trim());
      } else {
        // PRODUCTO NUEVO: Insertar tal cual con stock del JSON
        mergedProducts.push({
          ...localP,
          images: localP.images && localP.images.length > 0 ? localP.images : [localP.image]
        });
      }
    });

    // Añadir productos de KV que no están en el archivo JSON (creados directamente en producción)
    // Usamos un Set para no duplicar por alias de ID/Nombre
    const addedIds = new Set<string>();
    kvProductsMap.forEach(kvP => {
      if (!addedIds.has(kvP.id)) {
        mergedProducts.push(kvP);
        addedIds.add(kvP.id);
      }
    });

    // Guardar la lista combinada final en la base de datos
    await saveProducts(mergedProducts);

    return NextResponse.json({
      message: 'Sincronización completada con éxito',
      action: 'sync',
      forceStock,
      totalCount: mergedProducts.length,
      importedCount: localProducts.length,
      products: mergedProducts
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Error en la sincronización: ${error.message}` }, { status: 500 });
  }
}
