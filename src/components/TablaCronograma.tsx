import { soles } from "@/lib/formato";

export type CuotaVista = {
  numero: number;
  vencimiento: string; // YYYY-MM-DD
  capital: number | string;
  interes: number | string;
  total: number | string;
  estado?: string;
};

const fecha = (v: string) => v.split("-").reverse().join("/");

export default function TablaCronograma({ cuotas }: { cuotas: CuotaVista[] }) {
  const suma = (k: "capital" | "interes" | "total") =>
    cuotas.reduce((a, c) => a + Number(c[k]), 0);

  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            <th>N.º</th>
            <th>Vencimiento</th>
            <th>Capital</th>
            <th>Interés</th>
            <th>Total programado</th>
            {cuotas[0]?.estado !== undefined && <th>Estado</th>}
          </tr>
        </thead>
        <tbody>
          {cuotas.map((c) => (
            <tr key={c.numero}>
              <td>{c.numero}</td>
              <td>{fecha(c.vencimiento)}</td>
              <td>{soles(c.capital)}</td>
              <td>{soles(c.interes)}</td>
              <td>{soles(c.total)}</td>
              {c.estado !== undefined && <td>{c.estado}</td>}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>
              <strong>Totales</strong>
            </td>
            <td>
              <strong>{soles(suma("capital"))}</strong>
            </td>
            <td>
              <strong>{soles(suma("interes"))}</strong>
            </td>
            <td>
              <strong>{soles(suma("total"))}</strong>
            </td>
            {cuotas[0]?.estado !== undefined && <td></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}