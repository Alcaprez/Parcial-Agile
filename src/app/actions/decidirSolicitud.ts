"use server";

import { redirect } from "next/navigation";
import { withTransaction } from "@/lib/db";
import { usuarioActual } from "@/lib/session";
import { LIMITE_CLIENTE } from "@/lib/reglas";
import { soles } from "@/lib/formato";

export type DecisionResultado =
  | { ok: false; mensaje: string; motivo?: string }
  | undefined;

type Salida =
  | { tipo: "ok"; codigo: string }
  | { tipo: "noexiste" }
  | { tipo: "otraagencia" }
  | { tipo: "yaresuelta"; estado: string }
  | { tipo: "limite"; disponible: number };

export async function decidirSolicitud(
  solicitudId: number,
  decision: "aprobar" | "rechazar",
  motivoEntrada: string,
): Promise<DecisionResultado> {
  const user = await usuarioActual();
  if (!user) redirect("/login");
  if (user.rol !== "administrador" || !user.agenciaId) {
    return { ok: false, mensaje: "Solo el administrador de una agencia puede aprobar o rechazar solicitudes." };
  }
  if (!Number.isInteger(solicitudId) || solicitudId <= 0) {
    return { ok: false, mensaje: "Solicitud no válida." };
  }
  if (decision !== "aprobar" && decision !== "rechazar") {
    return { ok: false, mensaje: "Decisión no válida." };
  }

  const motivo = motivoEntrada.trim().replace(/\s+/g, " ");
  if (decision === "rechazar") {
    if (!motivo) return { ok: false, mensaje: "Indique el motivo del rechazo.", motivo: "El motivo del rechazo es obligatorio." };
    if (motivo.length < 5 || motivo.length > 300) {
      return { ok: false, mensaje: "Revise el motivo.", motivo: "El motivo debe tener entre 5 y 300 caracteres." };
    }
  }

  let salida: Salida;
  try {
    salida = await withTransaction<Salida>(async (q) => {
      // 1) Averiguar el cliente de la solicitud.
      const previa = await q<{ cliente_id: number }>(
        "SELECT cliente_id FROM solicitudes WHERE id = $1",
        [solicitudId],
      );
      if (!previa[0]) return { tipo: "noexiste" };
      const clienteId = previa[0].cliente_id;

      // 2) Bloquear al cliente: serializa decisiones y altas de solicitudes del mismo cliente.
      await q("SELECT id FROM clientes WHERE id = $1 FOR UPDATE", [clienteId]);

      // 3) Releer la solicitud ya con el bloqueo.
      const s = await q<{ estado: string; monto: string; agencia_id: number; codigo: string }>(
        "SELECT estado, monto, agencia_id, codigo FROM solicitudes WHERE id = $1 FOR UPDATE",
        [solicitudId],
      );
      if (!s[0]) return { tipo: "noexiste" };
      if (s[0].agencia_id !== user.agenciaId) return { tipo: "otraagencia" };
      if (s[0].estado !== "Pendiente") return { tipo: "yaresuelta", estado: s[0].estado };

      // 4) Al aprobar: revalidar el límite contra las DEMÁS solicitudes del cliente.
      if (decision === "aprobar") {
        const lim = await q<{ excede: boolean; disponible: string }>(
          `SELECT $3::numeric > ($2::numeric - COALESCE(SUM(monto), 0)) AS excede,
                  ($2::numeric - COALESCE(SUM(monto), 0)) AS disponible
             FROM solicitudes
            WHERE cliente_id = $1 AND id <> $4
              AND estado IN ('Pendiente','Aprobada')`,
          [clienteId, LIMITE_CLIENTE, s[0].monto, solicitudId],
        );
        if (lim[0].excede) {
          return { tipo: "limite", disponible: Math.max(0, Number(lim[0].disponible)) };
        }
      }

      // 5) Guardar la decisión (la condición evita pisar una resolución previa).
      const upd = await q<{ id: number }>(
        `UPDATE solicitudes
            SET estado = $2, decidido_por = $3, decidido_en = now(), motivo_rechazo = $4
          WHERE id = $1 AND estado = 'Pendiente'
          RETURNING id`,
        [
          solicitudId,
          decision === "aprobar" ? "Aprobada" : "Rechazada",
          user.id,
          decision === "rechazar" ? motivo : null,
        ],
      );
      if (!upd[0]) return { tipo: "yaresuelta", estado: "resuelta" };
      return { tipo: "ok", codigo: s[0].codigo };
    });
  } catch (err) {
    console.error("decidirSolicitud:", err);
    return { ok: false, mensaje: "No se pudo guardar la decisión por un error del sistema. Intente de nuevo." };
  }

  switch (salida.tipo) {
    case "noexiste":
      return { ok: false, mensaje: "La solicitud ya no existe." };
    case "otraagencia":
      return { ok: false, mensaje: "Solo puede decidir solicitudes de su agencia." };
    case "yaresuelta":
      return { ok: false, mensaje: "Esta solicitud ya fue resuelta y no puede modificarse. Actualice la lista." };
    case "limite":
      return {
        ok: false,
        mensaje: `No se puede aprobar: el monto supera el límite disponible del cliente (${soles(salida.disponible)} de ${soles(LIMITE_CLIENTE)}).`,
      };
    case "ok":
      redirect(
        `/solicitudes/pendientes?decidida=${salida.codigo}&resultado=${decision === "aprobar" ? "aprobada" : "rechazada"}`,
      );
  }
}