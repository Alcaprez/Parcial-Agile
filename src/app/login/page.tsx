import LoginForm from "./LoginForm";

export const metadata = { title: "Iniciar sesión — Préstamos Norte" };

export default function LoginPage() {
  return (
    <div className="login-pagina">
      <aside className="login-lado">
        <div className="logo-grande">PN</div>
        <h2>Gestión de préstamos para las agencias del norte</h2>
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
