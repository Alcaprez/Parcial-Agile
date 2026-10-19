import Link from "next/link";

export default function BuscadorClientes({ valor }: { valor: string }) {
  return (
    <form action="/clientes" method="get" role="search" className="buscador">
      <input
        type="search"
        name="q"
        defaultValue={valor}
        maxLength={100}
        placeholder="Buscar por DNI/RUC, nombre o razón social"
        aria-label="Buscar clientes"
      />
      <button type="submit" className="btn">
        Buscar
      </button>
      {valor && (
        <Link href="/clientes" className="btn sec">
          Limpiar
        </Link>
      )}
    </form>
  );
}