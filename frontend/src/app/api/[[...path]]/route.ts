import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "http://backend:5000" : "http://localhost:5000")
  );
};

async function handleProxy(
  request: NextRequest,
  paramsPromise: Promise<{ path?: string[] }>
) {
  const backendBase = getBackendUrl();
  const params = await paramsPromise;
  const subPath = params?.path && params.path.length > 0 ? `/${params.path.join("/")}` : "";
  const url = new URL(request.url);
  const targetUrl = `${backendBase}/api${subPath}${url.search}`;

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    // No reenviar host o connection
    if (key !== "host" && key !== "connection") {
      forwardHeaders.set(key, value);
    }
  });

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: forwardHeaders,
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = await request.arrayBuffer();
    }

    const backendRes = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      // Dejar pasar encabezados (incluyendo set-cookie y content-type)
      if (key !== "transfer-encoding") {
        responseHeaders.append(key, value);
      }
    });

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy Error] Failed to proxy ${request.method} ${targetUrl}:`, err);
    return NextResponse.json(
      {
        error: "Error de conexión con el backend",
        target: targetUrl,
        details: err?.message || String(err),
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  return handleProxy(req, params);
}
