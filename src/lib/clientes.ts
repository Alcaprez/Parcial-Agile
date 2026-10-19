import { query } from "./db";

export type ClienteFila = {
  id: number;
  codigo: string;
  tipo: "persona" | "empresa";
  nombre: string;
  documento: string;
  telefono: string;
  agencia: string;
};

const NOMBRE_SQL = `CASE WHEN c.tipo = 'persona'
                         THEN c.apellidos || ' ' || c.nombres
                         ELSE c.razon_social END`;

const BASE = `
  SELECT c.id, c.codigo, c.tipo,
         ${NOMBRE_SQL} AS nombre,
         COALESCE(c.dni, c.ruc) AS documento,
         c.telefono,
         a.nombre AS agencia
    FROM clientes c
    JOIN agencias a ON a.id = c.agencia_id`;

// En cola: el cliente registrado primero (CLI-0001) aparece primero.
const ORDEN = `ORDER BY c.id ASC`;

/** Escapa los comodines de LIKE para que el usuario no pueda usarlos. */
const esc = (s: string) => s.replace(/[\\%_]/g, "\\$&");

/**
 * Busca en TODAS las agencias.
 * - Vacío: lista completa (HU03).
 * - Solo dígitos: coincidencia EXACTA por DNI o RUC.
 * - Otro texto: coincidencia parcial por nombre, apellidos o razón social,
 *   sin distinguir mayúsculas ni tildes. Cada palabra debe aparecer.
 */
export async function buscarClientes(texto: string): Promise<ClienteFila[]> {
  const q = texto.trim().replace(/\s+/g, " ").slice(0, 100);

  if (!q) return query<ClienteFila>(`${BASE} ${ORDEN}`);

  if (/^\d+$/.test(q)) {
    return query<ClienteFila>(
      `${BASE} WHERE c.dni = $1 OR c.ruc = $1 ${ORDEN}`,
      [q],
    );
  }

  const palabras = q.split(" ").slice(0, 6);
  const condiciones = palabras.map(
    (_, i) =>
      `unaccent(lower(concat_ws(' ', c.nombres, c.apellidos, c.razon_social)))
         LIKE '%' || unaccent(lower($${i + 1})) || '%'`,
  );
  return query<ClienteFila>(
    `${BASE} WHERE ${condiciones.join(" AND ")} ${ORDEN}`,
    palabras.map(esc),
  );
}