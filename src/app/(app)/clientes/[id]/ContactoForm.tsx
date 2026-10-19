"use client";

import { useActionState } from "react";
import { actualizarContacto } from "@/app/actions/clientes";

export default function ContactoForm({
  id,
  telefono,
  correo,
}: {
  id: number;
  telefono: string;
  correo: string;
}) {
  const [state, action, pending] = useActionState(actualizarContacto.bind(null, id), undefined);
  const e = state?.errores ?? {};

  return (
    <form action={action} noValidate>
      {state?.ok && (
        <div className="aviso ok" role="status">
          {state.mensaje}
        </div>
      )}
      {state && !state.ok && state.mensaje && (
        <div className="aviso err" role="alert">
          {state.mensaje}
        </div>
      )}
      <div className="grid">
        <div className="campo">
          <label htmlFor="telefono">Teléfono *</label>
          <input
            id="telefono"
            name="telefono"
            inputMode="tel"
            maxLength={9}
            defaultValue={state?.telefono ?? telefono}
            className={e.telefono ? "invalido" : ""}
            autoComplete="off"
          />
          {e.telefono && <span className="error">{e.telefono}</span>}
        </div>
        <div className="campo">
          <label htmlFor="correo">Correo electrónico *</label>
          <input
            id="correo"
            name="correo"
            type="email"
            maxLength={120}
            defaultValue={state?.correo ?? correo}
            className={e.correo ? "invalido" : ""}
            autoComplete="off"
          />
          {e.correo && <span className="error">{e.correo}</span>}
        </div>
      </div>
      <div className="acciones">
        <button className="btn sec" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar teléfono y correo"}
        </button>
      </div>
    </form>
  );
}
