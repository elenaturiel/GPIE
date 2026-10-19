import { RANGOS_HABITACIONES } from "@/lib/calculadora/calculo";

/**
 * Validación de la solicitud de piloto en el servidor (no se fía de lo que valide el navegador).
 * Pura: recibe el cuerpo tal como llega y devuelve los datos limpios o los errores por campo.
 */

/** Lo que llega del navegador. */
export type LeadInput = {
  nombre?: unknown;
  cargo?: unknown;
  hotel?: unknown;
  ciudad?: unknown;
  habitaciones?: unknown;
  email?: unknown;
  telefono?: unknown;
  aceptaPrivacidad?: unknown;
  aceptaComunicaciones?: unknown;
  origen?: unknown;
  utm?: unknown;
  calculadora?: unknown;
  /** Trampa para bots: campo oculto que una persona deja vacío. */
  web?: unknown;
  /** Milisegundos desde que se mostró el formulario hasta que se envió. */
  tiempo?: unknown;
};

export type CalcResumen = {
  habitaciones: number;
  piezas: number;
  ahorroAnual: number;
  costeActual: number;
  costeIntacta: number;
  entradas: Record<string, number>;
};

export type Lead = {
  nombre: string;
  cargo: string;
  hotel: string;
  ciudad: string;
  habitaciones: string;
  email: string;
  telefono: string;
  aceptaComunicaciones: boolean;
  origen: string;
  utm: { source: string; medium: string; campaign: string };
  calculadora: CalcResumen | null;
};

export type Resultado =
  | { ok: true; lead: Lead }
  | { ok: false; bot: true }
  | { ok: false; bot: false; errores: Partial<Record<keyof LeadInput, string>> };

/** Tiempo mínimo para rellenar el formulario: por debajo, es un bot. */
export const TIEMPO_MINIMO_MS = 2500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\+?[0-9 ()-]{6,20}$/;
const ORIGENES = ["cabecera", "portada", "tras-demo", "calculadora", "piloto"];

const texto = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

const numero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function calculadora(v: unknown): CalcResumen | null {
  if (!v || typeof v !== "object") return null;
  const c = v as Record<string, unknown>;
  const campos = ["habitaciones", "piezas", "ahorroAnual", "costeActual", "costeIntacta"] as const;
  const out: Partial<CalcResumen> = {};
  for (const k of campos) {
    const n = numero(c[k]);
    if (n === null || Math.abs(n) > 1e9) return null;
    out[k] = Math.round(n * 100) / 100;
  }
  const entradas: Record<string, number> = {};
  if (c.entradas && typeof c.entradas === "object") {
    for (const [k, val] of Object.entries(c.entradas as Record<string, unknown>).slice(0, 20)) {
      const n = numero(val);
      if (n !== null && /^[a-zA-Z]{1,40}$/.test(k)) entradas[k] = n;
    }
  }
  return { ...(out as Omit<CalcResumen, "entradas">), entradas };
}

export function validarLead(body: LeadInput): Resultado {
  if (texto(body.web, 200) !== "") return { ok: false, bot: true };
  const tiempo = numero(body.tiempo);
  if (tiempo !== null && tiempo < TIEMPO_MINIMO_MS) return { ok: false, bot: true };

  const lead: Lead = {
    nombre: texto(body.nombre, 80),
    cargo: texto(body.cargo, 80),
    hotel: texto(body.hotel, 120),
    ciudad: texto(body.ciudad, 80),
    habitaciones: texto(body.habitaciones, 20),
    email: texto(body.email, 254).toLowerCase(),
    telefono: texto(body.telefono, 20),
    aceptaComunicaciones: body.aceptaComunicaciones === true,
    origen: ORIGENES.includes(texto(body.origen, 20)) ? texto(body.origen, 20) : "desconocido",
    utm: { source: "", medium: "", campaign: "" },
    calculadora: calculadora(body.calculadora),
  };
  if (body.utm && typeof body.utm === "object") {
    const u = body.utm as Record<string, unknown>;
    lead.utm = { source: texto(u.source, 80), medium: texto(u.medium, 80), campaign: texto(u.campaign, 80) };
  }

  const errores: Partial<Record<keyof LeadInput, string>> = {};
  if (lead.nombre.length < 2) errores.nombre = "Escribe tu nombre.";
  if (lead.hotel.length < 2) errores.hotel = "Escribe el nombre del hotel.";
  if (lead.ciudad.length < 2) errores.ciudad = "Escribe la ciudad.";
  if (!(RANGOS_HABITACIONES as readonly string[]).includes(lead.habitaciones)) errores.habitaciones = "Elige un rango de habitaciones.";
  if (!EMAIL.test(lead.email)) errores.email = "Escribe un email válido.";
  if (lead.telefono && !TELEFONO.test(lead.telefono)) errores.telefono = "El teléfono no parece válido.";
  if (body.aceptaPrivacidad !== true) errores.aceptaPrivacidad = "Tienes que aceptar la política de privacidad.";

  return Object.keys(errores).length ? { ok: false, bot: false, errores } : { ok: true, lead };
}

/** Evita que un texto que empieza por = + - @ se interprete como fórmula en la hoja de cálculo. */
export const seguroParaHoja = (s: string) => s.replace(/^[=+\-@\t\r]/, "'$&");
