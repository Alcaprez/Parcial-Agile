"use client";

import { useMemo, useState, useTransition } from "react";
import { crearSolicitud } from "@/app/actions/crearSolicitud";
import { generarCronograma } from "@/lib/cronograma";
import {
  TASA_MENSUAL,
  parseMonto,
  plazosPorMonto,
  solicitudVacia,
  validarSolicitud,
  type SolicitudInput,
} from "@/lib/reglas";
import { soles } from "@/lib/formato";
import TablaCronograma from "@/components/TablaCronograma";
import type { Errores } from "@/lib/validators";

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SolicitudForm({
  clienteId,
  disponible,
}: {
  clienteId: number;
  disponible: number;
}) {
  const [v, setV] = useState<SolicitudInput>(solicitudVacia);
  const [errores, setErrores] = useState<Errores>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const monto = parseMonto(v.monto);
  const opciones = monto && monto <= disponible ? plazosPorMonto(monto) : [];
  const plazo = Number(v.plazo);

  const cronograma = useMemo(
    () =>
      monto && opciones.includes(plazo)
        ? generarCronograma(monto, plazo, TASA_MENSUAL, hoyISO())
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monto, plazo, v.plazo],
  );

  function cambiar(name: keyof SolicitudInput, valor: string) {
    const limpio = name === "monto" ? valor.replace(/[^\d.,]/g, "") : valor;
    setV((p) => {
      const sig = { ...p, [name]: limpio };
      if (name === "monto") {
        const m = parseMonto(limpio);
        if (!m || !plazosPorMonto(m).includes(Number(p.plazo))) sig.plazo = "";
      }
      return sig;
    });
    if (errores[name]) setErrores((p) => ({ ...p, [name]: "" }));
    setMensaje(null);
  }

  function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    const errs = validarSolicitud(v, disponible);
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    start(async () => {
      const r = await crearSolicitud(clienteId, v);
      // Si hubo éxito, la acción redirige al detalle del cliente.
      if (r && !r.ok) {
        if (r.errores) setErrores(r.errores);
        if (r.mensaje) setMensaje(r.mensaje);
      }
    });
  }

  const totalPagar = cronograma?.reduce((a, c) => a + c.total, 0) ?? 0;

  return (
    <form onSubmit={alEnviar} noValidate>
      {mensaje && (
        <div className="aviso err" role="alert">
          {mensaje}
        </div>
      )}

      <div className="panel">
        <div className="grid">
          <div className="campo">
            <label htmlFor="monto">Monto solicitado (S/) *</label>
            <input
              id="monto"
              inputMode="decimal"
              maxLength={8}
              value={v.monto}
              onChange={(e) => cambiar("monto", e.target.value)}
              className={errores.monto ? "invalido" : ""}
              aria-invalid={Boolean(errores.monto)}
              autoComplete="off"
            />
            {errores.monto ? (
              <span className="error">{errores.monto}</span>
            ) : (
              <span className="ayuda">Mayor a S/ 0 y hasta el límite disponible</span>
            )}
          </div>

          <div className="campo">
            <label htmlFor="plazo">Plazo *</label>
            <select
              id="plazo"
              value={v.plazo}
              onChange={(e) => cambiar("plazo", e.target.value)}
              disabled={opciones.length === 0}
              className={errores.plazo ? "invalido" : ""}
              aria-invalid={Boolean(errores.plazo)}
            >
              <option value="">
                {opciones.length === 0 ? "Ingrese primero el monto" : "Seleccione…"}
              </option>
              {opciones.map((p) => (
                <option key={p} value={p}>
                  {p} meses
                </option>
              ))}
            </select>
            {errores.plazo ? (
              <span className="error">{errores.plazo}</span>
            ) : (
              <span className="ayuda">Las opciones dependen del monto</span>
            )}
          </div>

          <div className="campo" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="finalidad">Finalidad del préstamo *</label>
            <input
              id="finalidad"
              maxLength={200}
              value={v.finalidad}
              onChange={(e) => cambiar("finalidad", e.target.value)}
              className={errores.finalidad ? "invalido" : ""}
              aria-invalid={Boolean(errores.finalidad)}
              autoComplete="off"
            />
            {errores.finalidad && <span className="error">{errores.finalidad}</span>}
          </div>

          <div className="campo" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="observaciones">Observaciones (opcional)</label>
            <textarea
              id="observaciones"
              rows={3}
              maxLength={500}
              value={v.observaciones}
              onChange={(e) => cambiar("observaciones", e.target.value)}
              className={errores.observaciones ? "invalido" : ""}
            />
            {errores.observaciones && <span className="error">{errores.observaciones}</span>}
          </div>
        </div>
        <p className="ayuda" style={{ marginBottom: 0 }}>
          Una vez creada, la solicitud no podrá ser modificada por el agente.
        </p>
      </div>

      {cronograma && (
        <div className="panel">
          <h2>Simulación del cronograma (referencial)</h2>
          <dl className="detalle">
            <div>
              <dt>Cuota mensual aprox.</dt>
              <dd>
                <strong>{soles(cronograma[0].total)}</strong>
              </dd>
            </div>
            <div>
              <dt>Total a pagar</dt>
              <dd>{soles(totalPagar)}</dd>
            </div>
            <div>
              <dt>Tasa mensual</dt>
              <dd>{(TASA_MENSUAL * 100).toFixed(2)}%</dd>
            </div>
          </dl>
          <details style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Ver cronograma completo</summary>
            <div style={{ marginTop: 10 }}>
              <TablaCronograma cuotas={cronograma} />
            </div>
          </details>
          <p className="ayuda" style={{ marginBottom: 0 }}>
            Las fechas definitivas se fijan cuando el administrador apruebe la solicitud.
          </p>
        </div>
      )}

      <div className="acciones">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear solicitud"}
        </button>
      </div>
    </form>
  );
}