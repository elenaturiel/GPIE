import { TIPOS } from "./tipos";
import { ORIGENES } from "@/lib/metrics/stats";

/**
 * Validación de la solicitud de piloto en el servidor (no se fía de lo que valide el navegador).
 * Pura: recibe el cuerpo tal como llega y devuelve los datos limpios o los errores por campo.
 */

/** Lo que llega del navegador. */
export type LeadInput = {
  nombre?: unknown;
  tipo?: unknown;
  empresa?: unknown;
  ciudad?: unknown;
  email?: unknown;
  telefono?: unknown;
  aceptaPrivacidad?: unknown;
  aceptaComunicaciones?: unknown;
  origen?: unknown;
  utm?: unknown;
  /** Trampa para bots: campo oculto que una persona deja vacío. */
  web?: unknown;
  /** Milisegundos desde que se mostró el formulario hasta que se envió. */
  tiempo?: unknown;
};

export type Lead = {
  nombre: string;
  tipo: string;
  empresa: string;
  ciudad: string;
  email: string;
  telefono: string;
  aceptaComunicaciones: boolean;
  origen: string;
  utm: { source: string; medium: string; campaign: string };
};

export type Resultado =
  | { ok: true; lead: Lead }
  | { ok: false; bot: true }
  | { ok: false; bot: false; errores: Partial<Record<keyof LeadInput, string>> };

/** Tiempo mínimo para rellenar el formulario: por debajo, es un bot. */
export const TIEMPO_MINIMO_MS = 2500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^\+?[0-9 ()-]{6,20}$/;

const texto = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

const numero = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function validarLead(body: LeadInput): Resultado {
  if (texto(body.web, 200) !== "") return { ok: false, bot: true };
  const tiempo = numero(body.tiempo);
  if (tiempo !== null && tiempo < TIEMPO_MINIMO_MS) return { ok: false, bot: true };

  const lead: Lead = {
    nombre: texto(body.nombre, 80),
    tipo: texto(body.tipo, 60),
    empresa: texto(body.empresa, 120),
    ciudad: texto(body.ciudad, 80),
    email: texto(body.email, 254).toLowerCase(),
    telefono: texto(body.telefono, 20),
    aceptaComunicaciones: body.aceptaComunicaciones === true,
    origen: (ORIGENES as readonly string[]).includes(texto(body.origen, 20)) ? texto(body.origen, 20) : "desconocido",
    utm: { source: "", medium: "", campaign: "" },
  };
  if (body.utm && typeof body.utm === "object") {
    const u = body.utm as Record<string, unknown>;
    lead.utm = { source: texto(u.source, 80), medium: texto(u.medium, 80), campaign: texto(u.campaign, 80) };
  }

  const errores: Partial<Record<keyof LeadInput, string>> = {};
  if (lead.nombre.length < 2) errores.nombre = "Escribe tu nombre.";
  if (lead.ciudad.length < 2) errores.ciudad = "Escribe la ciudad.";
  if (!TIPOS.includes(lead.tipo)) errores.tipo = "Elige dónde lo usarías.";
  if (!EMAIL.test(lead.email)) errores.email = "Escribe un email válido.";
  if (lead.telefono && !TELEFONO.test(lead.telefono)) errores.telefono = "El teléfono no parece válido.";
  if (body.aceptaPrivacidad !== true) errores.aceptaPrivacidad = "Tienes que aceptar la política de privacidad.";

  return Object.keys(errores).length ? { ok: false, bot: false, errores } : { ok: true, lead };
}

/** Evita que un texto que empieza por = + - @ se interprete como fórmula al abrir el CSV en Excel o Sheets. */
export const seguroParaHoja = (s: string) => s.replace(/^[=+\-@\t\r]/, "'$&");
