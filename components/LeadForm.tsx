"use client";

import { useEffect, useId, useRef, useState } from "react";
import { casillas, primeraCapa } from "@/content/legal";
import { formulario as F } from "@/content/textos";
import { formatoEuros, RANGOS_HABITACIONES, rangoHabitaciones } from "@/lib/calculadora/calculo";
import { borrarEstimacion, useEstimacion } from "@/lib/calculadora/store";

type Campo = "nombre" | "cargo" | "hotel" | "ciudad" | "habitaciones" | "email" | "telefono" | "aceptaPrivacidad";
type Errores = Partial<Record<Campo, string>>;

/** Validación en el navegador, para avisar antes de enviar (el servidor vuelve a validar todo). */
function validar(d: FormData): Errores {
  const e: Errores = {};
  const v = (k: string) => String(d.get(k) ?? "").trim();
  if (v("nombre").length < 2) e.nombre = "Escribe tu nombre.";
  if (v("hotel").length < 2) e.hotel = "Escribe el nombre del hotel.";
  if (v("ciudad").length < 2) e.ciudad = "Escribe la ciudad.";
  if (!v("habitaciones")) e.habitaciones = "Elige un rango de habitaciones.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) e.email = "Escribe un email válido.";
  if (v("telefono") && !/^\+?[0-9 ()-]{6,20}$/.test(v("telefono"))) e.telefono = "El teléfono no parece válido.";
  if (d.get("aceptaPrivacidad") !== "on") e.aceptaPrivacidad = "Tienes que aceptar la política de privacidad.";
  return e;
}

const ORDEN: Campo[] = ["nombre", "cargo", "hotel", "ciudad", "habitaciones", "email", "telefono", "aceptaPrivacidad"];

/**
 * Formulario del piloto. Envía a /api/lead (que valida y guarda en Google Sheets).
 * `origen`: qué botón lo abrió (cabecera, portada, tras-demo, calculadora, piloto).
 */
export function LeadForm({ origen = "piloto", onDone }: { origen?: string; onDone?: () => void }) {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "error" | "ok">("idle");
  const [nombreOk, setNombreOk] = useState("");
  const estimacion = useEstimacion();
  // Sin opción preseleccionada (no sesga los datos), salvo que venga de la calculadora.
  const [roomsChoice, setRoomsChoice] = useState<string | null>(null);
  const rooms = roomsChoice ?? (estimacion ? rangoHabitaciones(estimacion.entradas.habitaciones) : "");
  const shownAt = useRef(0);
  const okRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  useEffect(() => {
    if (estado === "ok") okRef.current?.focus();
  }, [estado]);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const d = new FormData(form);
    const e = validar(d);
    setErrores(e);
    const primero = ORDEN.find((k) => e[k]);
    if (primero) {
      form.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    setEstado("enviando");
    const q = new URLSearchParams(location.search);
    const r = estimacion?.resultado;
    const payload = {
      nombre: d.get("nombre"),
      cargo: d.get("cargo"),
      hotel: d.get("hotel"),
      ciudad: d.get("ciudad"),
      habitaciones: d.get("habitaciones"),
      email: d.get("email"),
      telefono: d.get("telefono"),
      aceptaPrivacidad: d.get("aceptaPrivacidad") === "on",
      aceptaComunicaciones: d.get("aceptaComunicaciones") === "on",
      origen,
      utm: { source: q.get("utm_source") ?? "", medium: q.get("utm_medium") ?? "", campaign: q.get("utm_campaign") ?? "" },
      calculadora:
        estimacion && r
          ? {
              habitaciones: estimacion.entradas.habitaciones,
              piezas: r.piezas,
              ahorroAnual: r.ahorro,
              costeActual: r.actual.total,
              costeIntacta: r.conIntacta.total,
              entradas: estimacion.entradas,
            }
          : null,
      web: d.get("web"),
      tiempo: Date.now() - shownAt.current,
    };
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setNombreOk(String(d.get("nombre")).trim().split(" ")[0]);
        setEstado("ok");
        borrarEstimacion();
        return;
      }
      if (res.status === 422 && data.errores) {
        setErrores(data.errores);
        setEstado("idle");
        return;
      }
      setEstado("error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok")
    return (
      <div className="thanks" role="status" tabIndex={-1} ref={okRef}>
        <span className="mono eyebrow">{F.graciasAntetitulo}</span>
        <b>
          {F.gracias}, {nombreOk}.
        </b>
        <p>{F.graciasTexto}</p>
        {onDone && (
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            {F.cerrar}
          </button>
        )}
      </div>
    );

  const err = (k: Campo) =>
    errores[k] ? (
      <span className="ferr" id={id(`${k}-e`)}>
        {errores[k]}
      </span>
    ) : null;
  const a11y = (k: Campo) => ({ "aria-invalid": errores[k] ? true : undefined, "aria-describedby": errores[k] ? id(`${k}-e`) : undefined });
  const field = (k: "nombre" | "cargo" | "hotel" | "ciudad" | "email" | "telefono", extra: React.InputHTMLAttributes<HTMLInputElement>, full = false) => (
    <div className={`field${full ? " full" : ""}`}>
      <label htmlFor={id(k)}>{F.campos[k]}</label>
      <input id={id(k)} name={k} placeholder={F.ejemplos[k]} {...a11y(k as Campo)} {...extra} />
      {err(k as Campo)}
    </div>
  );

  return (
    <form className="lead-form" noValidate onSubmit={onSubmit}>
      {estimacion && (
        <div className="estim full" role="status">
          <p>
            Tu estimación irá con la solicitud: <b>{estimacion.entradas.habitaciones} habitaciones</b>, ahorro estimado de{" "}
            <b>{formatoEuros(estimacion.resultado.ahorro)} al año</b> con valores de ejemplo. En el piloto lo medimos de verdad.
          </p>
          <button type="button" className="estim-x" onClick={borrarEstimacion}>
            No incluir
          </button>
        </div>
      )}
      {field("nombre", { autoComplete: "name", required: true })}
      {field("cargo", { autoComplete: "organization-title" })}
      {field("hotel", { autoComplete: "organization", required: true })}
      {field("ciudad", { autoComplete: "address-level2", required: true })}
      <div className="field">
        <label htmlFor={id("habitaciones")}>{F.campos.habitaciones}</label>
        <select id={id("habitaciones")} name="habitaciones" value={rooms} onChange={(e) => setRoomsChoice(e.target.value)} required {...a11y("habitaciones")}>
          <option value="" disabled>
            {F.elegirRango}
          </option>
          {RANGOS_HABITACIONES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        {err("habitaciones")}
      </div>
      {field("email", { type: "email", autoComplete: "email", required: true })}
      {field("telefono", { type: "tel", autoComplete: "tel", inputMode: "tel" }, true)}

      {/* Trampa para bots: invisible para personas y lectores de pantalla. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={id("web")}>Web</label>
        <input id={id("web")} name="web" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="checks full">
        <label className="check">
          <input type="checkbox" name="aceptaPrivacidad" required {...a11y("aceptaPrivacidad")} />
          <span>
            {casillas.privacidad.replace("política de privacidad.", "")}
            <a href="/privacidad" target="_blank" rel="noopener">
              política de privacidad
            </a>
            .
          </span>
        </label>
        {err("aceptaPrivacidad")}
        <label className="check">
          <input type="checkbox" name="aceptaComunicaciones" />
          <span>{casillas.comunicaciones}</span>
        </label>
      </div>

      <p className="privacy-layer full">
        {primeraCapa.responsable} {primeraCapa.finalidad} {primeraCapa.legitimacion} {primeraCapa.destinatarios} {primeraCapa.derechos} {primeraCapa.masInfo}{" "}
        <a href="/privacidad" target="_blank" rel="noopener">
          {primeraCapa.enlace}
        </a>
        .
      </p>

      {estado === "error" && (
        <p className="err" role="alert">
          {F.errorEnvio}
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={estado === "enviando"}>
        {estado === "enviando" ? F.enviando : F.enviar}
      </button>
    </form>
  );
}
