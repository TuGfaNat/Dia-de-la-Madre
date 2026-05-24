import { NextResponse } from 'next/server';
import { getCategories, saveCategories, getProducts, saveProducts, Category } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const trimmedNewName = name.trim();
    const categories = await getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const oldName = categories[index].name;

    // Evitar nombres duplicados en otras categorías
    const duplicate = categories.some(
      (c) => c.id !== id && c.name.toLowerCase() === trimmedNewName.toLowerCase()
    );

    if (duplicate) {
      return NextResponse.json(
        { error: 'Ya existe otra categoría con este nombre' },
        { status: 400 }
      );
    }

    // Actualizar categoría
    categories[index].name = trimmedNewName;
    await saveCategories(categories);

    // Actualizar todos los productos que usaban la categoría antigua
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

    return NextResponse.json(categories[index]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const categories = await getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const categoryToDelete = categories[index];
    const oldName = categoryToDelete.name;

    // Si es la categoría por defecto (ej: General), impedir su borrado
    if (categoryToDelete.id === 'general' || oldName.toLowerCase() === 'general') {
      return NextResponse.json(
        { error: 'No se puede eliminar la categoría por defecto (General)' },
        { status: 400 }
      );
    }

    // Eliminar la categoría
    categories.splice(index, 1);

    // Asegurarse de que exista una categoría "General" de respaldo
    let hasGeneral = categories.some((c) => c.id === 'general' || c.name.toLowerCase() === 'general');
    if (!hasGeneral) {
      categories.push({ id: 'general', name: 'General' });
    }
    
    await saveCategories(categories);

    // Reasignar los productos huérfanos a "General"
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

    return NextResponse.json({ 
      success: true, 
      message: 'Categoría eliminada con éxito y productos reasignados a General' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}
