import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql, isDbEnabled } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    // Validar autorización
    if (!session || session.value !== 'authenticated_session_token_mama') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const dbEnabled = isDbEnabled();
    let dbWorking = false;
    let dbError = null;
    let productsCount = 0;

    if (dbEnabled) {
      try {
        // Intentar leer de Postgres para verificar el estado de la conexión
        const result = await sql`SELECT COUNT(*)::int as count FROM products`;
        dbWorking = true;
        productsCount = result[0].count;
      } catch (err: any) {
        dbWorking = false;
        dbError = err.message || String(err);
      }
    }

    return NextResponse.json({
      kvEnabled: dbEnabled, // Mantenemos el nombre de campo para compatibilidad con el frontend
      kvWorking: dbWorking,
      kvError: dbError,
      productsCount,
      env: {
        hasUrl: !!process.env.DATABASE_URL,
        hasToken: false, // Ya no es necesario en Postgres
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
