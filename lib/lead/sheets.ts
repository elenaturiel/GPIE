import { casillas, primeraCapa, VERSION_PRIVACIDAD } from "@/content/legal";
import { seguroParaHoja, type Lead } from "./validate";

/**
 * Guarda una solicitud como fila en Google Sheets.
 *
 * La web no habla directamente con Google desde el navegador: el servidor (Vercel) reenvía los datos
 * al Apps Script instalado en la hoja (google-apps-script/Code.gs) junto a una clave secreta. El
 * Apps Script añade la fila y te manda el email de aviso. Variables de entorno:
 *   GOOGLE_SHEETS_WEBHOOK_URL → URL de la aplicación web del Apps Script (acaba en /exec)
 *   GOOGLE_SHEETS_SECRET      → la misma clave que la propiedad SECRET del Apps Script
 *
 * Mismo sistema que la web de Train with Jaime.
 */

/** Columnas de la hoja, en orden (deben coincidir con FIELDS en Code.gs). */
export const COLUMNAS = [
  "fecha",
  "nombre",
  "cargo",
  "hotel",
  "ciudad",
  "habitaciones",
  "email",
  "telefono",
  "acepta_comunicaciones",
  "origen_cta",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "calc_habitaciones",
  "calc_piezas",
  "calc_ahorro_anual",
  "calc_coste_actual",
  "calc_coste_intacta",
  "calc_entradas",
  "consentimiento_fecha",
  "consentimiento_version",
  "consentimiento_texto",
] as const;

export type Fila = Record<(typeof COLUMNAS)[number], string>;

/** Prueba del consentimiento: el texto exacto que se aceptó, con fecha y versión. */
export const TEXTO_CONSENTIMIENTO = [casillas.privacidad, ...Object.values(primeraCapa).slice(0, 5)].join(" ");

export function aFila(lead: Lead, ahora: Date): Fila {
  const c = lead.calculadora;
  const fila: Fila = {
    fecha: ahora.toISOString(),
    nombre: lead.nombre,
    cargo: lead.cargo,
    hotel: lead.hotel,
    ciudad: lead.ciudad,
    habitaciones: lead.habitaciones,
    email: lead.email,
    telefono: lead.telefono,
    acepta_comunicaciones: lead.aceptaComunicaciones ? "sí" : "no",
    origen_cta: lead.origen,
    utm_source: lead.utm.source,
    utm_medium: lead.utm.medium,
    utm_campaign: lead.utm.campaign,
    calc_habitaciones: c ? String(c.habitaciones) : "",
    calc_piezas: c ? String(c.piezas) : "",
    calc_ahorro_anual: c ? String(c.ahorroAnual) : "",
    calc_coste_actual: c ? String(c.costeActual) : "",
    calc_coste_intacta: c ? String(c.costeIntacta) : "",
    calc_entradas: c ? JSON.stringify(c.entradas) : "",
    consentimiento_fecha: ahora.toISOString(),
    consentimiento_version: VERSION_PRIVACIDAD,
    consentimiento_texto: TEXTO_CONSENTIMIENTO,
  };
  return Object.fromEntries(Object.entries(fila).map(([k, v]) => [k, seguroParaHoja(v)])) as Fila;
}

export type Envio = { ok: true } | { ok: false; detalle: string };

export async function guardarEnHoja(fila: Fila, env = process.env, doFetch: typeof fetch = fetch): Promise<Envio> {
  const url = env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = env.GOOGLE_SHEETS_SECRET;
  if (!url || !secret) return { ok: false, detalle: "Google Sheets no está configurado (faltan GOOGLE_SHEETS_WEBHOOK_URL o GOOGLE_SHEETS_SECRET)." };

  let res: Response;
  let text: string;
  try {
    res = await doFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, row: fila }),
      redirect: "follow", // Apps Script responde con una redirección
      signal: AbortSignal.timeout(15000),
    });
    text = await res.text();
  } catch (e) {
    return { ok: false, detalle: `No se ha podido conectar con el Apps Script (${(e as Error).message}).` };
  }
  let data: { ok?: boolean; error?: string } | null = null;
  try {
    data = JSON.parse(text);
  } catch {
    /* Google ha devuelto HTML en vez de JSON */
  }
  if (res.ok && data?.ok) return { ok: true };
  // Diagnóstico legible (sin datos personales) para los logs de Vercel.
  if (data?.error === "unauthorized") return { ok: false, detalle: "La clave no coincide: GOOGLE_SHEETS_SECRET debe ser igual que SECRET en el Apps Script." };
  if (data?.error) return { ok: false, detalle: `El Apps Script respondió: ${data.error}` };
  if (/accounts\.google\.com|ServiceLogin/i.test(text)) return { ok: false, detalle: 'Google pide iniciar sesión: en la implementación, "Quién tiene acceso" debe ser "Cualquier usuario".' };
  return { ok: false, detalle: `Respuesta inesperada de Google (HTTP ${res.status}).` };
}
