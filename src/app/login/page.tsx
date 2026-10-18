import LoginForm from "./LoginForm";

export const metadata = { title: "Iniciar sesión — Préstamos Norte" };

export default function LoginPage() {
  return (
    <div className="login-pagina">
      <div className="login-caja">
        <h1>Préstamos Norte</h1>
        <p className="sub">Ingrese con su usuario de agencia</p>
        <div className="panel">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
