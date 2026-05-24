import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ninguna imagen' },
        { status: 400 }
      );
    }

    // 1. Si estamos en Vercel pero no se ha configurado Vercel Blob, evitamos intentar escribir localmente
    if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { 
          error: '¡Falta configurar Vercel Blob! Para poder subir y modificar fotos en producción, ve a la pestaña "Storage" en tu panel de Vercel, crea un almacén de "Blob" y conéctalo a tu proyecto.' 
        },
        { status: 400 }
      );
    }

    // 2. Si Vercel Blob está configurado (producción en Vercel), subimos a la nube
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const blob = await put(file.name, buffer, {
        access: 'public',
        addRandomSuffix: true,
      });
      return NextResponse.json({ url: blob.url });
    }

    // 3. Si no, guardamos localmente en public/uploads (desarrollo local)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Crear el directorio local si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    fs.writeFileSync(filePath, buffer);
    
    // Retornamos la ruta local relativa que Next.js puede servir estáticamente
    return NextResponse.json({ url: `/uploads/${uniqueFilename}` });
  } catch (error: any) {
    console.error('Error procesando la subida de imagen:', error);
    let errorMessage = error.message || String(error);
    if (errorMessage.includes('private store') || errorMessage.includes('public access')) {
      errorMessage = 'Tu Vercel Blob está configurado como "Privado" (Private). Para una tienda virtual, las fotos de productos deben ser públicas para que tus clientes puedan verlas. Por favor, ve a Vercel -> Storage, crea un nuevo Blob con acceso "Público" (Public) y conéctalo a tu proyecto.';
    }
    return NextResponse.json(
      { error: 'Error al subir la imagen en el servidor: ' + errorMessage },
      { status: 500 }
    );
  }
}

