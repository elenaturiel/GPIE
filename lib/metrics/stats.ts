import { kv } from "@/lib/store/kv";

/**
 * Contadores del embudo del pretotipo, por día y sin datos personales: ni cookies, ni identificadores,
 * ni IP. Solo sumas («hoy, 3 clics en el botón de la portada»). Así hay tasa de conversión aunque
 * nadie acepte cookies de analítica.
 *
 *   visita            carga de la página
 *   cta.<origen>      clic en un botón «Solicitar piloto» (la puerta falsa)
 *   empezado.<origen> empezó a rellenar los datos
 *   envio.<origen>    dejó sus datos (lo suma el servidor al guardar)
 */

/** Botones de puerta falsa. «ahorro» es la de «¿Quieres calcular cuánto vas a ahorrar?»; el resto, la del piloto. */
export const ORIGENES = ["cabecera", "portada", "tras-demo", "piloto", "ahorro"] as const;
export type Origen = (typeof ORIGENES)[number];

const EVENTOS_CLIENTE = ["visita", "cta", "empezado"] as const;
export type EventoCliente = (typeof EVENTOS_CLIENTE)[number];

const dia = (d: Date) => d.toISOString().slice(0, 10);
const KEY_DIA = (d: string) => `intacta:stats:${d}`;
const GUARDAR_DIAS = 400;

/** Nombre del contador para un evento, o null si el evento no es válido. */
export function campo(evento: unknown, origen?: unknown): string | null {
  const valido = typeof evento === "string" && ((EVENTOS_CLIENTE as readonly string[]).includes(evento) || evento === "envio");
  if (!valido) return null;
  if (evento === "visita") return evento;
  if (typeof origen !== "string" || !(ORIGENES as readonly string[]).includes(origen)) return null;
  return `${evento}.${origen}`;
}

export async function sumar(nombre: string, ahora = new Date()) {
  const k = KEY_DIA(dia(ahora));
  await kv([
    ["HINCRBY", k, nombre, 1],
    ["EXPIRE", k, GUARDAR_DIAS * 86400],
  ]);
}

export type Totales = Record<string, number>;

/** Suma los contadores de los últimos `dias` días (incluido hoy). */
export async function leerTotales(dias: number, ahora = new Date()): Promise<{ total: Totales; porDia: { dia: string; t: Totales }[] }> {
  const fechas = Array.from({ length: dias }, (_, i) => dia(new Date(ahora.getTime() - i * 864e5)));
  const res = await kv(fechas.map((d) => ["HGETALL", KEY_DIA(d)]));
  const total: Totales = {};
  const porDia = fechas.map((d, i) => {
    const flat = (res[i] as string[]) ?? [];
    const t: Totales = {};
    for (let j = 0; j < flat.length; j += 2) {
      t[flat[j]] = Number(flat[j + 1]);
      total[flat[j]] = (total[flat[j]] ?? 0) + Number(flat[j + 1]);
    }
    return { dia: d, t };
  });
  return { total, porDia: porDia.reverse() };
}

/** Las dos puertas falsas: qué botones pertenecen a cada una. */
export const PUERTAS = { piloto: ["cabecera", "portada", "tras-demo", "piloto"], ahorro: ["ahorro"] } as const;
export const puertaDe = (origen: string): keyof typeof PUERTAS => (origen === "ahorro" ? "ahorro" : "piloto");

/** Suma de un tipo de evento en todos los orígenes (p. ej. todos los «cta.*»). */
export const sumaTipo = (t: Totales, tipo: string) => Object.entries(t).reduce((a, [k, v]) => (k.startsWith(`${tipo}.`) ? a + v : a), 0);
