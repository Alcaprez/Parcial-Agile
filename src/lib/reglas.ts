import type { Errores } from "./validators";
import { soles } from "./formato";

export const LIMITE_CLIENTE = 10000;

/** Tasa de interés mensual. AJUSTAR con el negocio (0.03 = 3% mensual). */
export const TASA_MENSUAL = 0.03;

/** Plazos (meses) que se ofrecen según el monto. AJUSTAR con el negocio. */
export const PLAZOS_POR_MONTO = [
  { hasta: 1000, plazos: [3, 6] },
  { hasta: 2000, plazos: [3, 6, 9, 12] },
  { hasta: 4000, plazos: [6, 9, 12, 18] },
  { hasta: 6000, plazos: [12, 18, 24] },
  { hasta: 10000, plazos: [12, 18, 24, 36] },
] as const;

export function plazosPorMonto(monto: number): number[] {
  if (!Number.isFinite(monto) || monto <= 0) return [];
  const t = PLAZOS_POR_MONTO.find((x) => monto <= x.hasta);
  return t ? [...t.plazos] : [];
}

export type SolicitudInput = {
  monto: string;
  plazo: string;
  finalidad: string;
  observaciones: string;
};

export const solicitudVacia: SolicitudInput = {
  monto: "",
  plazo: "",
  finalidad: "",
  observaciones: "",
};

export function parseMonto(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(t)) return null;
  const n = Number(t);
  return n > 0 ? n : null;
}

export function normalizarSolicitud(i: SolicitudInput): SolicitudInput {
  const t = (s: string) => s.trim().replace(/\s+/g, " ");
  return {
    monto: t(i.monto),
    plazo: t(i.plazo),
    finalidad: t(i.finalidad),
    observaciones: i.observaciones.trim(),
  };
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

  if (!e.monto && monto !== null) {
    if (!i.plazo) e.plazo = "Seleccione un plazo.";
    else if (!plazosPorMonto(monto).includes(Number(i.plazo)))
      e.plazo = "El plazo seleccionado no está permitido para este monto.";
  }

  if (!i.finalidad) e.finalidad = "La finalidad del préstamo es obligatoria.";
  else if (i.finalidad.length < 5 || i.finalidad.length > 200)
    e.finalidad = "La finalidad debe tener entre 5 y 200 caracteres.";

  if (i.observaciones.length > 500)
    e.observaciones = "Las observaciones no pueden superar 500 caracteres.";

  return e;
}