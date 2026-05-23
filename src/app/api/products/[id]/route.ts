import { NextResponse } from 'next/server';
import { getProducts, saveProducts, Product } from '@/lib/db';

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
    const { name, description, price, stock, image, category } = body;

    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    const currentProduct = products[index];

    // Modificar campos opcionalmente o validar si se proveen
    const priceNum = price !== undefined ? parseFloat(price) : currentProduct.price;
    const stockNum = stock !== undefined ? parseInt(stock, 10) : currentProduct.stock;

    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: 'Stock inválido' }, { status: 400 });
    }

    const updatedProduct: Product = {
      ...currentProduct,
      name: name ?? currentProduct.name,
      description: description ?? currentProduct.description,
      price: priceNum,
      stock: stockNum,
      image: image ?? currentProduct.image,
      category: category ?? currentProduct.category,
    };

    products[index] = updatedProduct;
    await saveProducts(products);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
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
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    products.splice(index, 1);
    await saveProducts(products);

    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
}
