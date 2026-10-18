import ClienteForm from "./ClienteForm";

export const metadata = { title: "Registrar cliente — Préstamos Norte" };

export default function NuevoClientePage() {
  return (
    <>
      <h1>Registrar cliente</h1>
      <p className="sub">
        Persona natural o empresa. Una vez registrado, solo podrán modificarse el teléfono y el correo.
      </p>
      <ClienteForm />
    </>
  );
}
