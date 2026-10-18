import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function sesionValida(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("sesion")?.value;
  const s = process.env.JWT_SECRET;
  if (!token || !s) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(s));
    return true;
  } catch {
    return false;
  }
}

// Comprobación optimista de la cookie. La verificación real del usuario
// (activo, rol, agencia) se hace en cada página con usuarioActual().
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const valida = await sesionValida(request);

  if (pathname === "/login") {
    if (valida) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }
  if (!valida) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
