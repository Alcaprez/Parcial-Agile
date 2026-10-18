export type TipoCliente = "persona" | "empresa";

export type ClienteInput = {
  tipo: TipoCliente;
  nombres: string;
  apellidos: string;
  dni: string;
  razonSocial: string;
  ruc: string;
  telefono: string;
  correo: string;
  direccion: string;
  repNombres: string;
  repApellidos: string;
  repDni: string;
};

export type Errores = Record<string, string>;

export const clienteVacio: ClienteInput = {
  tipo: "persona",
  nombres: "",
  apellidos: "",
  dni: "",
  razonSocial: "",
  ruc: "",
  telefono: "",
  correo: "",
  direccion: "",
  repNombres: "",
  repApellidos: "",
  repDni: "",
};

const NOMBRE_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ '.-]{1,59}$/;
const CORREO_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarDni(v: string): string | null {
  if (!v) return "El DNI es obligatorio.";
  if (!/^\d{8}$/.test(v)) return "El DNI debe tener exactamente 8 dígitos.";
  return null;
}

export function validarRuc(v: string): string | null {
  if (!v) return "El RUC es obligatorio.";
  if (!/^\d{11}$/.test(v)) return "El RUC debe tener exactamente 11 dígitos.";
  if (!["10", "15", "17", "20"].includes(v.slice(0, 2)))
    return "El RUC debe iniciar con 10, 15, 17 o 20.";
  const pesos = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma = pesos.reduce((acc, p, i) => acc + p * Number(v[i]), 0);
  let dv = 11 - (suma % 11);
  if (dv === 10) dv = 0;
  if (dv === 11) dv = 1;
  if (dv !== Number(v[10])) return "El RUC no es válido (dígito verificador incorrecto).";
  return null;
}

export function validarTelefono(v: string): string | null {
  if (!v) return "El teléfono es obligatorio.";
  if (!/^9\d{8}$/.test(v))
    return "El teléfono debe tener 9 dígitos y empezar con 9.";
  return null;
}

export function validarCorreo(v: string): string | null {
  if (!v) return "El correo es obligatorio.";
  if (v.length > 120 || !CORREO_RE.test(v)) return "El correo no tiene un formato válido.";
  return null;
}

function validarNombre(v: string, etiqueta: string): string | null {
  if (!v) return "Este campo es obligatorio.";
  if (!NOMBRE_RE.test(v)) return `${etiqueta} solo admite letras y debe tener al menos 2 caracteres.`;
  return null;
}

/** Normaliza antes de validar/guardar: recorta, colapsa espacios, mayúsculas en nombres. */
export function normalizarCliente(i: ClienteInput): ClienteInput {
  const t = (s: string) => s.trim().replace(/\s+/g, " ");
  const up = (s: string) => t(s).toUpperCase();
  return {
    tipo: i.tipo === "empresa" ? "empresa" : "persona",
    nombres: up(i.nombres),
    apellidos: up(i.apellidos),
    dni: t(i.dni),
    razonSocial: up(i.razonSocial),
    ruc: t(i.ruc),
    telefono: t(i.telefono),
    correo: t(i.correo).toLowerCase(),
    direccion: t(i.direccion),
    repNombres: up(i.repNombres),
    repApellidos: up(i.repApellidos),
    repDni: t(i.repDni),
  };
}

export function validarContacto(telefono: string, correo: string): Errores {
  const e: Errores = {};
  const t = validarTelefono(telefono);
  const c = validarCorreo(correo);
  if (t) e.telefono = t;
  if (c) e.correo = c;
  return e;
}

export function validarCliente(raw: ClienteInput): Errores {
  const i = normalizarCliente(raw);
  const e: Errores = {};
  const put = (k: string, m: string | null) => {
    if (m) e[k] = m;
  };

  if (i.tipo === "persona") {
    put("nombres", validarNombre(i.nombres, "Los nombres"));
    put("apellidos", validarNombre(i.apellidos, "Los apellidos"));
    put("dni", validarDni(i.dni));
  } else {
    if (!i.razonSocial) e.razonSocial = "La razón social es obligatoria.";
    else if (i.razonSocial.length < 3 || i.razonSocial.length > 120)
      e.razonSocial = "La razón social debe tener entre 3 y 120 caracteres.";
    put("ruc", validarRuc(i.ruc));
    put("repNombres", validarNombre(i.repNombres, "Los nombres del representante"));
    put("repApellidos", validarNombre(i.repApellidos, "Los apellidos del representante"));
    put("repDni", validarDni(i.repDni));
  }
  put("telefono", validarTelefono(i.telefono));
  put("correo", validarCorreo(i.correo));
  if (!i.direccion) e.direccion = "La dirección es obligatoria.";
  else if (i.direccion.length < 5 || i.direccion.length > 160)
    e.direccion = "La dirección debe tener entre 5 y 160 caracteres.";
  return e;
}
