import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Marca } from "@/components/Logo";
import { ETIQUETA_ROL, usuarioActual } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await usuarioActual();
  if (!user) redirect("/login");

  return (
    <>
      <header className="topbar">
        <Link href="/" className="marca" style={{ textDecoration: "none" }} aria-label="Algarrobo — inicio">
          <Marca size={38} />
        </Link>
        <nav>
          <Link href="/clientes">Clientes</Link>
          <Link href="/clientes/nuevo">Registrar cliente</Link>
          {user.rol !== "agente" && <Link href="/solicitudes/pendientes">Solicitudes pendientes</Link>}
        </nav>
        <div className="quien">
          <span className="avatar">{user.nombre.charAt(0).toUpperCase()}</span>
          <span className="datos">
            <strong>{user.nombre}</strong>
            <small>
              {ETIQUETA_ROL[user.rol]} · {user.agencia ?? "Todas las agencias"}
            </small>
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
