"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { crearSesion, cerrarSesion } from "@/lib/session";

export type LoginState = { error?: string; usuario?: string } | undefined;

// Hash ficticio para igualar el tiempo de respuesta cuando el usuario no existe.
const HASH_FALSO = bcrypt.hashSync("sin-usuario", 10);

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!usuario || !password) {
    return { error: "Ingrese su usuario y contraseña.", usuario };
  }

  let uid: number | null = null;
  try {
    const rows = await query<{ id: number; password_hash: string }>(
      "SELECT id, password_hash FROM usuarios WHERE usuario = $1 AND activo",
      [usuario],
    );
    const u = rows[0];
    const ok = await bcrypt.compare(password, u?.password_hash ?? HASH_FALSO);
    if (u && ok) uid = u.id;
  } catch (err) {
    console.error("login:", err);
    return { error: "No se pudo iniciar sesión por un error del sistema. Intente de nuevo.", usuario };
  }

  if (uid === null) {
    return { error: "Usuario o contraseña incorrectos.", usuario };
  }
  await crearSesion(uid);
  redirect("/");
}

export async function logout() {
  await cerrarSesion();
  redirect("/login");
}
