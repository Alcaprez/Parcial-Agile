import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import { query } from "./db";

export const COOKIE = "sesion";
const DURACION_SEG = 60 * 60 * 8; // 8 horas

export type Rol = "dueno" | "administrador" | "agente";

export type Usuario = {
  id: number;
  nombre: string;
  usuario: string;
  rol: Rol;
  agenciaId: number | null;
  agencia: string | null;
};

function secreto(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET no está definido o es demasiado corto (mínimo 16 caracteres)");
  }
  return new TextEncoder().encode(s);
}

export async function crearSesion(uid: number) {
  const token = await new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_SEG}s`)
    .sign(secreto());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_SEG,
  });
}

export async function cerrarSesion() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Usuario autenticado y activo (consultado en BD en cada petición), o null. */
export const usuarioActual = cache(async (): Promise<Usuario | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  let uid: number;
  try {
    const { payload } = await jwtVerify(token, secreto());
    uid = Number(payload.uid);
  } catch {
    return null;
  }
  const rows = await query<{
    id: number;
    nombre: string;
    usuario: string;
    rol: Rol;
    agencia_id: number | null;
    agencia: string | null;
  }>(
    `SELECT u.id, u.nombre, u.usuario, u.rol, u.agencia_id, a.nombre AS agencia
       FROM usuarios u LEFT JOIN agencias a ON a.id = u.agencia_id
      WHERE u.id = $1 AND u.activo`,
    [uid],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    nombre: r.nombre,
    usuario: r.usuario,
    rol: r.rol,
    agenciaId: r.agencia_id,
    agencia: r.agencia,
  };
});

export const ETIQUETA_ROL: Record<Rol, string> = {
  dueno: "Dueño",
  administrador: "Administrador",
  agente: "Agente",
};
