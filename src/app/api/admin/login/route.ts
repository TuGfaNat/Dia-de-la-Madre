import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD || 'Mama2026';

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true, message: 'Autenticación exitosa' });
      
      // Establecer cookie HttpOnly de sesión para mantener el estado de login
      response.cookies.set('admin_session', 'authenticated_session_token_mama', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 día
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Contraseña incorrecta' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor de autenticación' },
      { status: 500 }
    );
  }
}
