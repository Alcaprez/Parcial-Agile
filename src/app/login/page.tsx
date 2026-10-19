import { LogoMark } from "@/components/Logo";
import LoginForm from "./LoginForm";

export const metadata = { title: "Iniciar sesión — Algarrobo" };

export default function LoginPage() {
  return (
    <div className="login-pagina">
      <aside className="login-lado">
        <LogoMark size={64} />
        <div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
            Algarrobo
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              opacity: 0.75,
            }}
          >
            Préstamos del Norte
          </div>
        </div>
        <h2>Raíces firmes, crédito justo.</h2>
        <ul>
          <li>Base de clientes centralizada, sin duplicados</li>
          <li>Cuatro agencias: Trujillo, Chiclayo, Piura y Tumbes</li>
          <li>Control del límite de S/ 10,000 por cliente</li>
        </ul>
      </aside>
      <section className="login-form-lado">
        <div className="login-caja">
          <h1>Iniciar sesión</h1>
          <p className="sub">Ingrese con su usuario de agencia</p>
          <div className="panel">
            <LoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}
