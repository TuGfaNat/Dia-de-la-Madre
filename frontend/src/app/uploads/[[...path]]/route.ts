import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "http://backend:5000" : "http://localhost:5000")
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const backendBase = getBackendUrl();
  const resolvedParams = await params;
  const subPath = resolvedParams?.path && resolvedParams.path.length > 0 ? `/${resolvedParams.path.join("/")}` : "";
  const targetUrl = `${backendBase}/uploads${subPath}`;

  try {
    const backendRes = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
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
    console.error(`[Uploads Proxy Error] Failed to fetch ${targetUrl}:`, err);
    return new NextResponse("Image not found", { status: 404 });
  }
}
