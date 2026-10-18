"use client";

import { useState, useTransition } from "react";
import { crearSolicitud } from "@/app/actions/crearSolicitud";
import {
  parseMonto,
  plazoPorMonto,
  solicitudVacia,
  validarSolicitud,
  type SolicitudInput,
} from "@/lib/reglas";
import type { Errores } from "@/lib/validators";

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
  const plazo = monto ? plazoPorMonto(monto) : null;

  function cambiar(name: keyof SolicitudInput, valor: string) {
    const limpio = name === "monto" ? valor.replace(/[^\d.,]/g, "") : valor;
    setV((p) => ({ ...p, [name]: limpio }));
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
            <label htmlFor="plazo">Plazo (meses)</label>
            <input
              id="plazo"
              value={plazo ? `${plazo} meses` : ""}
              placeholder="Se calcula según el monto"
              readOnly
              aria-readonly="true"
            />
            <span className="ayuda">Calculado automáticamente</span>
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

      <div className="acciones">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear solicitud"}
        </button>
      </div>
    </form>
  );
}