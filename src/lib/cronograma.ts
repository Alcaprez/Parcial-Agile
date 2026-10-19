export type Cuota = {
  numero: number;
  vencimiento: string; // YYYY-MM-DD
  capital: number;
  interes: number;
  total: number;
};

function sumarMeses(base: string, meses: number): string {
  const [y, m, d] = base.split("-").map(Number);
  const idx = m - 1 + meses;
  const anio = y + Math.floor(idx / 12);
  const mes = idx % 12;
  const ultimoDia = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const dia = Math.min(d, ultimoDia);
  return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Método francés: cuota fija. fechaBase = fecha de aprobación (YYYY-MM-DD). */
export function generarCronograma(
  monto: number,
  plazo: number,
  tasaMensual: number,
  fechaBase: string,
): Cuota[] {
  const cuotaC = Math.round(
    (tasaMensual === 0
      ? monto / plazo
      : (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazo))) * 100,
  );
  let saldoC = Math.round(monto * 100);
  const out: Cuota[] = [];

  for (let n = 1; n <= plazo; n++) {
    const interesC = Math.round(saldoC * tasaMensual);
    let capitalC = cuotaC - interesC;
    if (n === plazo || capitalC > saldoC) capitalC = saldoC;
    saldoC -= capitalC;
    out.push({
      numero: n,
      vencimiento: sumarMeses(fechaBase, n),
      capital: capitalC / 100,
      interes: interesC / 100,
      total: (capitalC + interesC) / 100,
    });
  }
  return out;
}