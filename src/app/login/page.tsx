import { LogoMark } from "@/components/Logo";
import LoginForm from "./LoginForm";

export const metadata = { title: "Iniciar sesión — ALGARROBO" };

export default function LoginPage() {
  return (
    <div className="login-pagina">
      <aside className="login-lado">
        <LogoMark size={64} />
        <div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "0.08em", lineHeight: 1 }}>
            ALGARROBO
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
          <li>CLIENTES Centralizados</li>
          <li>Multiples Agencias por todo el norte del Peru</li>
          <li>Control seguro y estricto</li>
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
