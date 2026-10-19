"use client";

import { useState } from "react";
import { cta } from "@/content/textos";

// Rangos sin solapes y sin opción preseleccionada (no sesga los datos).
const ROOMS = ["Menos de 50", "50–149", "150–299", "300 o más"];

/**
 * Formulario del piloto. FASE 1: solo la parte visual del prototipo; todavía no guarda nada.
 * La fase 4 lo conecta al servidor (validación, antispam, Supabase, aviso por email) y añade
 * ciudad, teléfono y las casillas de privacidad y comunicaciones.
 */
export function LeadForm() {
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const hotel = String(f.get("hotel") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const missing = [];
    if (!name) missing.push("tu nombre");
    if (!hotel) missing.push("el hotel");
    if (!/^\S+@\S+\.\S+$/.test(email)) missing.push("un email válido");
    if (missing.length) return setError(`Falta ${missing.join(", ")}.`);
    setError("");
    setSentTo(name.split(" ")[0]);
  }

  if (sentTo)
    return (
      <div className="thanks" role="status">
        <span className="mono eyebrow">Solicitud recibida</span>
        <b>Gracias, {sentTo}.</b>
        <p>Estamos seleccionando los primeros hoteles para el piloto. Te escribimos en 48 horas.</p>
      </div>
    );

  return (
    <form className="lead-form" noValidate onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="f-name">Nombre</label>
        <input id="f-name" name="name" autoComplete="name" placeholder="Ana García" required />
      </div>
      <div className="field">
        <label htmlFor="f-role">Cargo</label>
        <input id="f-role" name="role" autoComplete="organization-title" placeholder="Gobernanta, director/a…" />
      </div>
      <div className="field full">
        <label htmlFor="f-hotel">Hotel</label>
        <input id="f-hotel" name="hotel" autoComplete="organization" placeholder="Hotel y ciudad" required />
      </div>
      <div className="field">
        <label htmlFor="f-rooms">Habitaciones</label>
        <select id="f-rooms" name="rooms" defaultValue="">
          <option value="" disabled>
            Elige un rango
          </option>
          {ROOMS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-email">Email</label>
        <input id="f-email" name="email" type="email" autoComplete="email" placeholder="ana@hotel.com" required />
      </div>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary" type="submit">
        {cta.principal}
      </button>
      <p className="fine">Te escribimos en 48 horas para concretar visita. Solo usamos estos datos para el piloto.</p>
    </form>
  );
}
