"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { registrarCliente, type ClienteExistente } from "@/app/actions/clientes";
import {
  clienteVacio,
  validarCliente,
  type ClienteInput,
  type Errores,
} from "@/lib/validators";

type Campo = {
  name: keyof ClienteInput;
  label: string;
  ayuda?: string;
  max?: number;
  inputMode?: "numeric" | "tel" | "email" | "text";
  type?: string;
};

const SOLO_DIGITOS: (keyof ClienteInput)[] = ["dni", "ruc", "telefono", "repDni"];

export default function ClienteForm() {
  const [v, setV] = useState<ClienteInput>(clienteVacio);
  const [errores, setErrores] = useState<Errores>({});
  const [existente, setExistente] = useState<ClienteExistente | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [pending, start] = useTransition();

  function cambiar(name: keyof ClienteInput, valor: string) {
    const limpio = SOLO_DIGITOS.includes(name) ? valor.replace(/\D/g, "") : valor;
    setV((prev) => ({ ...prev, [name]: limpio }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
    setExistente(null);
    setMensaje(null);
  }

  function alEnviar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setExistente(null);
    const errs = validarCliente(v);
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;
    setConfirmando(true);
  }

  function confirmar() {
    start(async () => {
      const r = await registrarCliente(v);
      // Si hubo éxito, la acción redirige al detalle del cliente.
      if (r && !r.ok) {
        setConfirmando(false);
        if (r.errores) setErrores(r.errores);
        if (r.existente) setExistente(r.existente);
        if (r.mensaje) setMensaje(r.mensaje);
      }
    });
  }

  const esPersona = v.tipo === "persona";

  const campos: Campo[] = esPersona
    ? [
        { name: "nombres", label: "Nombres", max: 60 },
        { name: "apellidos", label: "Apellidos", max: 60 },
        { name: "dni", label: "DNI", max: 8, inputMode: "numeric", ayuda: "8 dígitos" },
      ]
    : [
        { name: "razonSocial", label: "Razón social", max: 120 },
        { name: "ruc", label: "RUC", max: 11, inputMode: "numeric", ayuda: "11 dígitos" },
      ];

  const contacto: Campo[] = [
    { name: "telefono", label: "Teléfono", max: 9, inputMode: "tel", ayuda: "9 dígitos, empieza con 9" },
    { name: "correo", label: "Correo electrónico", max: 120, inputMode: "email", type: "email" },
    { name: "direccion", label: "Dirección", max: 160 },
  ];

  const representante: Campo[] = [
    { name: "repNombres", label: "Nombres del representante", max: 60 },
    { name: "repApellidos", label: "Apellidos del representante", max: 60 },
    { name: "repDni", label: "DNI del representante", max: 8, inputMode: "numeric", ayuda: "8 dígitos" },
  ];

  const pintar = (c: Campo) => (
    <div className="campo" key={c.name}>
      <label htmlFor={c.name}>{c.label} *</label>
      <input
        id={c.name}
        name={c.name}
        type={c.type ?? "text"}
        inputMode={c.inputMode}
        maxLength={c.max}
        value={v[c.name]}
        onChange={(e) => cambiar(c.name, e.target.value)}
        className={errores[c.name] ? "invalido" : ""}
        aria-invalid={Boolean(errores[c.name])}
        aria-describedby={errores[c.name] ? `${c.name}-err` : undefined}
        autoComplete="off"
      />
      {errores[c.name] ? (
        <span className="error" id={`${c.name}-err`}>
          {errores[c.name]}
        </span>
      ) : (
        c.ayuda && <span className="ayuda">{c.ayuda}</span>
      )}
    </div>
  );

  return (
    <form onSubmit={alEnviar} noValidate>
      {mensaje && (
        <div className="aviso err" role="alert">
          {mensaje}
        </div>
      )}

      {existente && (
        <div className="aviso warn" role="alert">
          <strong>
            Ya existe un cliente registrado con este {existente.tipo === "persona" ? "DNI" : "RUC"}.
          </strong>{" "}
          No se permite registrarlo de nuevo.
          <dl className="detalle" style={{ marginTop: 10 }}>
            <div>
              <dt>Código</dt>
              <dd>{existente.codigo}</dd>
            </div>
            <div>
              <dt>{existente.tipo === "persona" ? "Cliente" : "Razón social"}</dt>
              <dd>{existente.nombre}</dd>
            </div>
            <div>
              <dt>{existente.tipo === "persona" ? "DNI" : "RUC"}</dt>
              <dd>{existente.documento}</dd>
            </div>
          </dl>
          <div className="acciones">
            <Link className="btn sec" href={`/clientes/${existente.id}`}>
              Ver cliente existente
            </Link>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="campo" style={{ maxWidth: 280, marginBottom: 16 }}>
          <label htmlFor="tipo">Tipo de cliente *</label>
          <select
            id="tipo"
            value={v.tipo}
            onChange={(e) => {
              setErrores({});
              setExistente(null);
              setV((p) => ({ ...p, tipo: e.target.value === "empresa" ? "empresa" : "persona" }));
            }}
          >
            <option value="persona">Persona natural</option>
            <option value="empresa">Empresa</option>
          </select>
        </div>
        <div className="grid">
          {campos.map(pintar)}
          {contacto.map(pintar)}
        </div>
      </div>

      {!esPersona && (
        <div className="panel">
          <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>Representante legal</h2>
          <div className="grid">{representante.map(pintar)}</div>
        </div>
      )}

      {Object.values(errores).some(Boolean) && (
        <div className="aviso err" role="alert">
          Revise los campos marcados. No se puede registrar hasta corregirlos.
        </div>
      )}

      <div className="acciones">
        <button className="btn" type="submit" disabled={pending}>
          Registrar
        </button>
        <Link className="btn sec" href="/clientes">
          Volver a la lista
        </Link>
      </div>

      {confirmando && (
        <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="conf-titulo">
          <div className="modal">
            <h2 id="conf-titulo">Confirmar registro</h2>
            <p>¿Está seguro de haber llenado todo correctamente?</p>
            <p className="sub" style={{ marginBottom: 0 }}>
              Después de registrar, solo podrá modificar el teléfono y el correo.
            </p>
            <div className="acciones">
              <button className="btn" type="button" onClick={confirmar} disabled={pending}>
                {pending ? "Registrando…" : "Sí, registrar"}
              </button>
              <button
                className="btn sec"
                type="button"
                onClick={() => setConfirmando(false)}
                disabled={pending}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
