import { redirect } from "next/navigation";
import { ETIQUETA_ROL, usuarioActual } from "@/lib/session";
import CuentaForm from "./CuentaForm";

export const metadata = { title: "Mi cuenta — ALGARROBO" };

export default async function CuentaPage() {
  const user = await usuarioActual();
  if (!user) redirect("/login");

  return (
    <>
      <h1>Mi cuenta</h1>
      <p className="sub">
        {user.nombre} · usuario <strong>{user.usuario}</strong> · {ETIQUETA_ROL[user.rol]} ·{" "}
        {user.agencia ?? "Todas las agencias"}
      </p>
      <div className="panel" style={{ maxWidth: 520 }}>
        <h2>Cambiar contraseña</h2>
        <CuentaForm />
      </div>
    </>
  );
}