"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { usuarioActual } from "@/lib/session";

export type CuentaState =
  | { ok?: boolean; errores?: Record<string, string>; mensaje?: string }
  | undefined;

export async function cambiarPassword(_prev: CuentaState, formData: FormData): Promise<CuentaState> {
  const user = await usuarioActual();
  if (!user) redirect("/login");

  const actual = String(formData.get("actual") ?? "");
  const nueva = String(formData.get("nueva") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  const errores: Record<string, string> = {};
  if (!actual) errores.actual = "Ingrese su contraseña actual.";
  if (nueva.length < 8) errores.nueva = "La nueva contraseña debe tener al menos 8 caracteres.";
  else if (nueva.length > 72) errores.nueva = "La nueva contraseña no puede superar 72 caracteres.";
  else if (!/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) errores.nueva = "Debe incluir al menos una letra y un número.";
  else if (nueva === actual) errores.nueva = "La nueva contraseña debe ser distinta de la actual.";
  if (nueva !== confirmar) errores.confirmar = "La confirmación no coincide.";
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  try {
    const rows = await query<{ password_hash: string }>("SELECT password_hash FROM usuarios WHERE id = $1", [user.id]);
    if (!rows[0] || !(await bcrypt.compare(actual, rows[0].password_hash))) {
      return { ok: false, errores: { actual: "La contraseña actual es incorrecta." } };
    }
    // pass_version = 99: el sistema nunca volverá a reemplazar esta contraseña.
    await query("UPDATE usuarios SET password_hash = $1, pass_version = 99 WHERE id = $2", [
      await bcrypt.hash(nueva, 10),
      user.id,
    ]);
  } catch (err) {
    console.error("cambiarPassword:", err);
    return { ok: false, mensaje: "No se pudo cambiar la contraseña por un error del sistema. Intente de nuevo." };
  }
  return { ok: true, mensaje: "Contraseña actualizada correctamente." };
}