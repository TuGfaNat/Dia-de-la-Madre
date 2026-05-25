export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql, isDbEnabled } from '@/lib/db';

export async function GET() {
  try {
    if (!isDbEnabled()) {
      return NextResponse.json({
        success: false,
        message: 'Database connection URL not set'
      }, { status: 400 });
    }

    // Ejecutar una consulta rápida (ping) para mantener la base de datos despierta
    const result = await sql`SELECT 1 as ping`;
    
    return NextResponse.json({
      success: true,
      message: 'Database ping successful',
      timestamp: new Date().toISOString(),
      result: result[0]
    });
  } catch (error: any) {
    console.error("Keep-Alive database ping failed:", error);
    return NextResponse.json({
      success: false,
      message: 'Database ping failed',
      error: error.message || String(error)
    }, { status: 500 });
  }
}
