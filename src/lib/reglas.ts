import type { Errores } from "./validators";
import { soles } from "./formato";

export const LIMITE_CLIENTE = 10000;

/** Plazo (meses) según el monto solicitado. AJUSTAR con el negocio. */
export const TABLA_PLAZOS = [
  { hasta: 1000, meses: 12 },
  { hasta: 2000, meses: 24 },
  { hasta: 4000, meses: 36 },
  { hasta: 6000, meses: 48 },
  { hasta: 10000, meses: 60 },
] as const;

export function plazoPorMonto(monto: number): number | null {
  if (!Number.isFinite(monto) || monto <= 0) return null;
  return TABLA_PLAZOS.find((t) => monto <= t.hasta)?.meses ?? null;
}

export type SolicitudInput = {
  monto: string;
  finalidad: string;
  observaciones: string;
};

export const solicitudVacia: SolicitudInput = { monto: "", finalidad: "", observaciones: "" };

export function parseMonto(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 ? n : null;
}

export function normalizarSolicitud(i: SolicitudInput): SolicitudInput {
  const t = (s: string) => s.trim().replace(/\s+/g, " ");
  return { monto: t(i.monto), finalidad: t(i.finalidad), observaciones: i.observaciones.trim() };
}

export function validarSolicitud(raw: SolicitudInput, disponible?: number): Errores {
  const i = normalizarSolicitud(raw);
  const e: Errores = {};

  const monto = parseMonto(i.monto);
  if (!i.monto) e.monto = "El monto es obligatorio.";
  else if (monto === null)
    e.monto = "Ingrese un monto válido en soles, mayor a S/ 0 (máximo 2 decimales).";
  else if (monto > LIMITE_CLIENTE)
    e.monto = `El monto no puede superar ${soles(LIMITE_CLIENTE)}.`;
  else if (disponible !== undefined && monto > disponible)
    e.monto = `El monto supera el límite disponible del cliente (${soles(disponible)}).`;

  if (!i.finalidad) e.finalidad = "La finalidad del préstamo es obligatoria.";
  else if (i.finalidad.length < 5 || i.finalidad.length > 200)
    e.finalidad = "La finalidad debe tener entre 5 y 200 caracteres.";

  if (i.observaciones.length > 500)
    e.observaciones = "Las observaciones no pueden superar 500 caracteres.";

  return e;
}