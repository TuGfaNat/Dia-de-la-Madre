export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getProducts, saveProducts, Product } from '@/lib/db';
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, stock, image, images, category } = body;

    // Validación básica de campos
    if (!name || !description || price === undefined || stock === undefined || !category) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // Normalizar imágenes (soporte para image y images)
    let finalImages: string[] = [];
    if (images && Array.isArray(images) && images.length > 0) {
      finalImages = images.filter(img => typeof img === 'string' && img.trim() !== '');
    } else if (image && typeof image === 'string' && image.trim() !== '') {
      finalImages = [image.trim()];
    }

    if (finalImages.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos una imagen' },
        { status: 400 }
      );
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: 'Precio inválido' },
        { status: 400 }
      );
    }

    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: 'Stock inválido' },
        { status: 400 }
      );
    }

    const products = await getProducts();
    
    // Crear nuevo producto
    const newProduct: Product = {
      id: String(Date.now()), // Generar ID único basado en timestamp
      name,
      description,
      price: priceNum,
      stock: stockNum,
      image: finalImages[0],
      images: finalImages,
      category,
    };

    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al agregar el producto' },
      { status: 500 }
    );
  }
}
