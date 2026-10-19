"use client";

import { useActionState } from "react";
import { cambiarPassword } from "@/app/actions/cuenta";

export default function CuentaForm() {
  const [state, action, pending] = useActionState(cambiarPassword, undefined);
  const e = state?.errores ?? {};

  return (
    <form action={action} noValidate key={state?.ok ? "ok" : "form"}>
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
      <div style={{ display: "grid", gap: 16 }}>
        <div className="campo">
          <label htmlFor="actual">Contraseña actual *</label>
          <input id="actual" name="actual" type="password" autoComplete="current-password" className={e.actual ? "invalido" : ""} />
          {e.actual && <span className="error">{e.actual}</span>}
        </div>
        <div className="campo">
          <label htmlFor="nueva">Nueva contraseña *</label>
          <input id="nueva" name="nueva" type="password" autoComplete="new-password" className={e.nueva ? "invalido" : ""} />
          {e.nueva ? <span className="error">{e.nueva}</span> : <span className="ayuda">Mínimo 8 caracteres, con letras y números.</span>}
        </div>
        <div className="campo">
          <label htmlFor="confirmar">Confirmar nueva contraseña *</label>
          <input id="confirmar" name="confirmar" type="password" autoComplete="new-password" className={e.confirmar ? "invalido" : ""} />
          {e.confirmar && <span className="error">{e.confirmar}</span>}
        </div>
      </div>
      <div className="acciones">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Cambiar contraseña"}
        </button>
      </div>
    </form>
  );
}