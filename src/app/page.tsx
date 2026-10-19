import { redirect } from "next/navigation";
import { usuarioActual } from "@/lib/session";

export default async function Inicio() {
  const user = await usuarioActual();
  if (!user) redirect("/login");
  redirect(user.rol === "agente" ? "/clientes" : "/solicitudes/pendientes");
}
