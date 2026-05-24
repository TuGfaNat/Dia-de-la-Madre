import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const isKVEnabled = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    // Validar autorización
    if (!session || session.value !== 'authenticated_session_token_mama') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const kvEnabled = isKVEnabled();
    let kvWorking = false;
    let kvError = null;
    let productsCount = 0;

    if (kvEnabled) {
      try {
        // Intentar leer de KV para verificar el estado de la conexión
        const testVal = await kv.get('mama_products');
        kvWorking = true;
        if (Array.isArray(testVal)) {
          productsCount = testVal.length;
        }
      } catch (err: any) {
        kvWorking = false;
        kvError = err.message || String(err);
      }
    }

    return NextResponse.json({
      kvEnabled,
      kvWorking,
      kvError,
      productsCount,
      env: {
        hasUrl: !!process.env.KV_REST_API_URL,
        hasToken: !!process.env.KV_REST_API_TOKEN,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
