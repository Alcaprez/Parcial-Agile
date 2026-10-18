import Link from "next/link";
import { query } from "@/lib/db";
import ReintentarBtn from "@/components/ReintentarBtn";

export const metadata = { title: "Clientes — Préstamos Norte" };

type Fila = {
  id: number;
  codigo: string;
  tipo: "persona" | "empresa";
  nombre: string;
  documento: string;
  telefono: string;
  agencia: string;
};

async function cargar(): Promise<Fila[] | null> {
  try {
    // A→Z por apellidos y nombres (personas) o por razón social (empresas).
    return await query<Fila>(
      `SELECT c.id, c.codigo, c.tipo,
              CASE WHEN c.tipo = 'persona' THEN c.apellidos || ' ' || c.nombres
                   ELSE c.razon_social END AS nombre,
              COALESCE(c.dni, c.ruc) AS documento,
              c.telefono, a.nombre AS agencia
         FROM clientes c JOIN agencias a ON a.id = c.agencia_id
        ORDER BY lower(CASE WHEN c.tipo = 'persona' THEN c.apellidos || ' ' || c.nombres
                            ELSE c.razon_social END) ASC, c.id ASC`,
    );
  } catch (err) {
    console.error("listar clientes:", err);
    return null;
  }
}

export default async function ClientesPage() {
  const filas = await cargar();

  return (
    <>
      <h1>Clientes registrados</h1>
      <p className="sub">Clientes de todas las agencias, ordenados de la A a la Z.</p>

      {filas === null ? (
        <div className="panel">
          <div className="aviso err" role="alert">
            No se pudo cargar la lista de clientes. Verifique su conexión e intente nuevamente.
          </div>
          <ReintentarBtn />
        </div>
      ) : filas.length === 0 ? (
        <div className="panel vacio">
          <p>No hay clientes registrados</p>
          <Link className="btn" href="/clientes/nuevo">
            Registrar cliente
          </Link>
        </div>
      ) : (
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre / Razón social</th>
                <th>DNI / RUC</th>
                <th>Tipo</th>
                <th>Teléfono</th>
                <th>Agencia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>{f.codigo}</td>
                  <td>{f.nombre}</td>
                  <td>{f.documento}</td>
                  <td>
                    <span className="badge">{f.tipo === "persona" ? "Persona natural" : "Empresa"}</span>
                  </td>
                  <td>{f.telefono}</td>
                  <td>{f.agencia}</td>
                  <td>
                    <Link href={`/clientes/${f.id}`}>Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
