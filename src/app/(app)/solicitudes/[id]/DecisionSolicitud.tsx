"use client";

import { useState, useTransition } from "react";
import { decidirSolicitud } from "@/app/actions/decidirSolicitud";

export default function DecisionSolicitud({
  solicitudId,
  codigo,
}: {
  solicitudId: number;
  codigo: string;
}) {
  const [modo, setModo] = useState<"aprobar" | "rechazar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function abrir(m: "aprobar" | "rechazar") {
    setMensaje(null);
    setErrorMotivo("");
    setMotivo("");
    setModo(m);
  }

  function confirmar() {
    if (!modo) return;
    if (modo === "rechazar") {
      const t = motivo.trim();
      if (!t) return setErrorMotivo("El motivo del rechazo es obligatorio.");
      if (t.length < 5 || t.length > 300)
        return setErrorMotivo("El motivo debe tener entre 5 y 300 caracteres.");
    }
    start(async () => {
      const r = await decidirSolicitud(solicitudId, modo, motivo);
      // Si hubo éxito, la acción redirige a la lista de pendientes.
      if (r && !r.ok) {
        if (r.motivo) {
          setErrorMotivo(r.motivo);
        } else {
          setModo(null);
          setMensaje(r.mensaje);
        }
      }
    });
  }

  return (
    <>
      {mensaje && (
        <div className="aviso err" role="alert">
          {mensaje}
        </div>
      )}

      <div className="acciones">
        <button className="btn" type="button" onClick={() => abrir("aprobar")} disabled={pending}>
          Aprobar
        </button>
        <button className="btn peligro" type="button" onClick={() => abrir("rechazar")} disabled={pending}>
          Rechazar
        </button>
      </div>

      {modo && (
        <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="dec-titulo">
          <div className="modal">
            <h2 id="dec-titulo">
              {modo === "aprobar" ? "Confirmar aprobación" : "Confirmar rechazo"}
            </h2>

            {modo === "aprobar" ? (
              <p>
                ¿Desea aprobar la solicitud <strong>{codigo}</strong>? El monto quedará reservado
                hasta que se formalice el desembolso.
              </p>
            ) : (
              <>
                <p>
                  ¿Desea rechazar la solicitud <strong>{codigo}</strong>? El monto reservado se
                  liberará para el cliente.
                </p>
                <div className="campo">
                  <label htmlFor="motivo">Motivo del rechazo *</label>
                  <textarea
                    id="motivo"
                    rows={3}
                    maxLength={300}
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      setErrorMotivo("");
                    }}
                    className={errorMotivo ? "invalido" : ""}
                    aria-invalid={Boolean(errorMotivo)}
                  />
                  {errorMotivo && <span className="error">{errorMotivo}</span>}
                </div>
              </>
            )}

            <p className="sub" style={{ margin: "12px 0 0" }}>
              Esta decisión no podrá deshacerse.
            </p>

            <div className="acciones">
              <button
                className={modo === "aprobar" ? "btn" : "btn peligro"}
                type="button"
                onClick={confirmar}
                disabled={pending}
              >
                {pending ? "Guardando…" : modo === "aprobar" ? "Sí, aprobar" : "Sí, rechazar"}
              </button>
              <button className="btn sec" type="button" onClick={() => setModo(null)} disabled={pending}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}