export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getCategories, saveCategories, Category } from '@/lib/db';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const categories = await getCategories();

    // Validar duplicados (insensible a mayúsculas)
    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { error: 'Esta categoría ya existe' },
        { status: 400 }
      );
    }

    // Generar ID amigable (slug) o timestamp si queda vacío
    let id = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')     // Caracteres especiales a guión
      .replace(/^-+|-+$/g, '');        // Quitar guiones iniciales/finales

    if (!id) {
      id = String(Date.now());
    }

    // Asegurar unicidad del ID
    if (categories.some((c) => c.id === id)) {
      id = `${id}-${Date.now()}`;
    }

    const newCategory: Category = {
      id,
      name: trimmedName
    };

    categories.push(newCategory);
    await saveCategories(categories);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al agregar la categoría' },
      { status: 500 }
    );
  }
}
