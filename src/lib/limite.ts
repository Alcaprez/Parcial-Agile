import { query } from "./db";
import { LIMITE_CLIENTE } from "./reglas";

export type LimiteCliente = { limite: number; reservado: number; disponible: number };

/** Reservado = solicitudes Pendientes + Aprobadas del cliente, en TODAS las agencias. */
export async function limiteCliente(clienteId: number): Promise<LimiteCliente> {
  const rows = await query<{ reservado: string }>(
    `SELECT COALESCE(SUM(monto), 0) AS reservado
       FROM solicitudes
      WHERE cliente_id = $1 AND estado IN ('Pendiente','Aprobada')`,
    [clienteId],
  );
  const reservado = Number(rows[0].reservado);
  return {
    limite: LIMITE_CLIENTE,
    reservado,
    disponible: Math.max(0, LIMITE_CLIENTE - reservado),
  };
}