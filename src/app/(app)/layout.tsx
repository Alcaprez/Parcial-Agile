import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { ETIQUETA_ROL, usuarioActual } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await usuarioActual();
  if (!user) redirect("/login");

  return (
    <>
      <header className="topbar">
        <span className="marca">Préstamos Norte</span>
        <nav>
          <Link href="/clientes">Clientes</Link>
          <Link href="/clientes/nuevo">Registrar cliente</Link>
          {user.rol !== "agente" && <Link href="/solicitudes/pendientes">Solicitudes pendientes</Link>}
        </nav>
        <div className="quien">
          <span>
            {user.nombre} · {ETIQUETA_ROL[user.rol]}
            {user.agencia ? ` · ${user.agencia}` : " · Todas las agencias"}
          </span>
          <form action={logout}>
            <button type="submit">Cerrar sesión</button>
          </form>
        </div>
      </header>
      <main className="contenido">{children}</main>
    </>
  );
}
