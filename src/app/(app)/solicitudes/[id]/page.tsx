import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { query } from "@/lib/db";
import { usuarioActual } from "@/lib/session";
import ReintentarBtn from "@/components/ReintentarBtn";
import { fechaLima, soles } from "@/lib/formato";

export const metadata = { title: "Detalle de solicitud — Préstamos Norte" };

type Sol = {
  id: number;
  codigo: string;
  estado: string;
  monto: string;
  plazo_meses: number;
  creada_en: Date;
  sol_telefono: string;
  sol_correo: string;
  agencia_id: number;
  agencia: string;
  cliente_id: number;
  cod_cliente: string;
  tipo: "persona" | "empresa";
  nombres: string | null;
  apellidos: string | null;
  dni: string | null;
  razon_social: string | null;
  ruc: string | null;
  rep_nombres: string | null;
  rep_apellidos: string | null;
  rep_dni: string | null;
  direccion: string;
};

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div>
      <dt>{t}</dt>
      <dd>{v}</dd>
    </div>
  );
}

export default async function SolicitudDetalle({ params }: { params: Promise<{ id: string }> }) {
  const user = await usuarioActual();
  if (!user) redirect("/login");
  if (user.rol === "agente") redirect("/clientes");

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let s: Sol | undefined;
  try {
    const rows = await query<Sol>(
      `SELECT s.id, s.codigo, s.estado, s.monto, s.plazo_meses, s.creada_en,
              s.telefono AS sol_telefono, s.correo AS sol_correo,
              s.agencia_id, a.nombre AS agencia,
              c.id AS cliente_id, c.codigo AS cod_cliente, c.tipo,
              c.nombres, c.apellidos, c.dni, c.razon_social, c.ruc,
              c.rep_nombres, c.rep_apellidos, c.rep_dni, c.direccion
         FROM solicitudes s
         JOIN clientes c ON c.id = s.cliente_id
         JOIN agencias a ON a.id = s.agencia_id
        WHERE s.id = $1`,
      [id],
    );
    s = rows[0];
  } catch (err) {
    console.error("detalle solicitud:", err);
    return (
      <div className="panel">
        <div className="aviso err" role="alert">
          No se pudo cargar la solicitud. Intente nuevamente.
        </div>
        <ReintentarBtn />
      </div>
    );
  }

  // Un administrador solo ve solicitudes de su sucursal.
  if (!s || (user.rol === "administrador" && s.agencia_id !== user.agenciaId)) notFound();

  const esPersona = s.tipo === "persona";

  return (
    <>
      <h1>
        Solicitud {s.codigo} <span className="badge">{s.estado}</span>
      </h1>
      <p className="sub">
        Agencia {s.agencia} · creada el {fechaLima(s.creada_en)} · solo lectura
      </p>

      <div className="panel">
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Datos de la solicitud</h2>
        <dl className="detalle">
          <Dato t="Monto solicitado" v={soles(s.monto)} />
          <Dato t="Plazo" v={`${s.plazo_meses} ${s.plazo_meses === 1 ? "mes" : "meses"}`} />
          <Dato t="Teléfono (registrado en la solicitud)" v={s.sol_telefono} />
          <Dato t="Correo (registrado en la solicitud)" v={s.sol_correo} />
        </dl>
      </div>

      <div className="panel">
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Datos del cliente</h2>
        <dl className="detalle">
          <Dato t="Código de cliente" v={s.cod_cliente} />
          <Dato t="Tipo" v={esPersona ? "Persona natural" : "Empresa"} />
          {esPersona ? (
            <>
              <Dato t="Nombres" v={s.nombres ?? ""} />
              <Dato t="Apellidos" v={s.apellidos ?? ""} />
              <Dato t="DNI" v={s.dni ?? ""} />
            </>
          ) : (
            <>
              <Dato t="Razón social" v={s.razon_social ?? ""} />
              <Dato t="RUC" v={s.ruc ?? ""} />
              <Dato t="Representante legal" v={`${s.rep_apellidos} ${s.rep_nombres}`} />
              <Dato t="DNI del representante" v={s.rep_dni ?? ""} />
            </>
          )}
          <Dato t="Dirección" v={s.direccion} />
        </dl>
      </div>

      <div className="acciones">
        {/* La aprobación y el rechazo corresponden a la HU07. */}
        <button className="btn" type="button" disabled title="Disponible con la HU07">
          Aprobar
        </button>
        <button className="btn peligro" type="button" disabled title="Disponible con la HU07">
          Rechazar
        </button>
        <Link className="btn sec" href="/solicitudes/pendientes">
          Volver a pendientes
        </Link>
      </div>
    </>
  );
}
