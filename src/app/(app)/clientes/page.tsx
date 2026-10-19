import Link from "next/link";
import ReintentarBtn from "@/components/ReintentarBtn";
import BuscadorClientes from "@/components/BuscadorClientes";
import { buscarClientes, type ClienteFila } from "@/lib/clientes";

export const metadata = { title: "Clientes — ALGARROBO" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const texto = typeof q === "string" ? q : "";
  const buscando = texto.trim().length > 0;

  let filas: ClienteFila[] | null;
  try {
    filas = await buscarClientes(texto);
  } catch (err) {
    console.error("buscar clientes:", err);
    filas = null;
  }

  return (
    <>
      <h1>Clientes registrados</h1>

      <BuscadorClientes valor={texto} />

      {filas === null ? (
        <div className="panel">
          <div className="aviso err" role="alert">
            No se pudo cargar la lista de clientes. Verifique su conexión e intente nuevamente.
          </div>
          <ReintentarBtn />
        </div>
      ) : filas.length === 0 ? (
        <div className="panel vacio">
          <p>{buscando ? "No se encontraron clientes" : "No hay clientes registrados"}</p>
          {!buscando && (
            <Link className="btn" href="/clientes/nuevo">
              Registrar cliente
            </Link>
          )}
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
                    <span className="badge">
                      {f.tipo === "persona" ? "Persona natural" : "Empresa"}
                    </span>
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
