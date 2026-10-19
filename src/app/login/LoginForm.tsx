"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} noValidate>
      {state?.error && (
        <div className="aviso err" role="alert">
          {state.error}
        </div>
      )}
      <div className="campo" style={{ marginBottom: 14 }}>
        <label htmlFor="usuario">Usuario</label>
        <input
          id="usuario"
          name="usuario"
          autoComplete="username"
          defaultValue={state?.usuario ?? ""}
          autoFocus
          required
        />
      </div>
      <div className="campo" style={{ marginBottom: 16 }}>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <button className="btn" type="submit" disabled={pending} style={{ width: "100%" }}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
