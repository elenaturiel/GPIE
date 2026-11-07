import { actualizarDoc, leerDoc } from "@/lib/store/docs";

/**
 * Contadores del embudo del pretotipo, por día y sin datos personales: ni cookies, ni identificadores,
 * ni IP. Solo sumas («hoy, 3 clics en el botón de la portada»). Así hay tasa de conversión aunque
 * nadie acepte cookies de analítica.
 *
 *   visita            carga de la página
 *   cta.<origen>      clic en un botón de puerta falsa
 *   empezado.<origen> empezó a rellenar los datos
 *   envio.<origen>    dejó sus datos (lo suma el servidor al guardar)
 *   video             pulsó reproducir en el vídeo
 *
 * El almacén gratuito (Vercel Blob, Hobby) permite 2.000 escrituras al mes y se bloquea 30 días si se
 * pasan. Por eso los eventos se acumulan en memoria y se guardan juntos: al llegar una solicitud o, como
 * mucho, cada 30 minutos; y los contadores tienen un tope de escrituras al mes (el resto queda para los
 * interesados). Consecuencia: las cifras son aproximadas (si el servidor se apaga con eventos sin guardar,
 * esos se pierden) y, si se llega al tope, dejan de sumar hasta el mes siguiente (el panel lo avisa).
 */

/** Botones de puerta falsa. «ahorro» es la de «¿Quieres calcular cuánto vas a ahorrar?»; el resto, la del piloto. */
export const ORIGENES = ["cabecera", "portada", "tras-demo", "piloto", "ahorro"] as const;
export type Origen = (typeof ORIGENES)[number];

const EVENTOS_CLIENTE = ["visita", "cta", "empezado", "video"] as const;
export type EventoCliente = (typeof EVENTOS_CLIENTE)[number];

const DOC = "contadores.json";
export const TOPE_ESCRITURAS_MES = 1200;
export const INTERVALO_MS = 30 * 60 * 1000;
const GUARDAR_DIAS = 400;

export type Totales = Record<string, number>;
type DocContadores = { dias: Record<string, Totales>; escrituras: Record<string, number> };
const VACIO: DocContadores = { dias: {}, escrituras: {} };

const dia = (d: Date) => d.toISOString().slice(0, 10);
const mes = (d: Date) => d.toISOString().slice(0, 7);

/** Nombre del contador para un evento, o null si el evento no es válido. */
export function campo(evento: unknown, origen?: unknown): string | null {
  const valido = typeof evento === "string" && ((EVENTOS_CLIENTE as readonly string[]).includes(evento) || evento === "envio");
  if (!valido) return null;
  if (evento === "visita" || evento === "video") return evento;
  if (typeof origen !== "string" || !(ORIGENES as readonly string[]).includes(origen)) return null;
  return `${evento}.${origen}`;
}

/* Eventos pendientes de guardar, en la memoria de esta instancia del servidor. */
const g = globalThis as typeof globalThis & { __intactaStats?: { pendiente: Record<string, Totales>; ultimo: number } };
g.__intactaStats ??= { pendiente: {}, ultimo: 0 };
const buf = g.__intactaStats;

/** Pendientes por guardar (para pruebas). */
export const pendientes = () => buf.pendiente;

/** Suma 1 a un contador. Se guarda al momento si `inmediato` o si han pasado 30 minutos desde el último guardado. */
export async function sumar(nombre: string, ahora = new Date(), { inmediato = false } = {}) {
  const d = dia(ahora);
  (buf.pendiente[d] ??= {})[nombre] = (buf.pendiente[d][nombre] ?? 0) + 1;
  if (inmediato || ahora.getTime() - buf.ultimo >= INTERVALO_MS) await volcar(ahora);
}

/** Guarda lo pendiente en el almacén, en una sola escritura. */
export async function volcar(ahora = new Date()) {
  const lote = buf.pendiente;
  if (!Object.keys(lote).length) return;
  buf.pendiente = {};
  try {
    await actualizarDoc<DocContadores>(DOC, VACIO, (doc) => {
      const m = mes(ahora);
      if ((doc.escrituras[m] ?? 0) >= TOPE_ESCRITURAS_MES) return null; // tope del mes: no se escribe más
      for (const [d, t] of Object.entries(lote)) {
        const dest = (doc.dias[d] ??= {});
        for (const [k, v] of Object.entries(t)) dest[k] = (dest[k] ?? 0) + v;
      }
      doc.escrituras[m] = (doc.escrituras[m] ?? 0) + 1;
      const limite = dia(new Date(ahora.getTime() - GUARDAR_DIAS * 864e5));
      for (const d of Object.keys(doc.dias)) if (d < limite) delete doc.dias[d];
      for (const k of Object.keys(doc.escrituras).sort().slice(0, -13)) delete doc.escrituras[k];
      return doc;
    });
    buf.ultimo = ahora.getTime();
  } catch (e) {
    // no se ha podido guardar: se devuelve a pendientes para el próximo intento
    for (const [d, t] of Object.entries(lote)) for (const [k, v] of Object.entries(t)) (buf.pendiente[d] ??= {})[k] = (buf.pendiente[d][k] ?? 0) + v;
    throw e;
  }
}

/** Suma los contadores de los últimos `dias` días (incluido hoy), con lo pendiente de esta instancia. */
export async function leerTotales(
  dias: number,
  ahora = new Date(),
): Promise<{ total: Totales; porDia: { dia: string; t: Totales }[]; escriturasMes: number; topeAlcanzado: boolean }> {
  const { data } = await leerDoc<DocContadores>(DOC, VACIO);
  const fechas = Array.from({ length: dias }, (_, i) => dia(new Date(ahora.getTime() - i * 864e5)));
  const total: Totales = {};
  const porDia = fechas.map((d) => {
    const t: Totales = { ...(data.dias[d] ?? {}) };
    for (const [k, v] of Object.entries(buf.pendiente[d] ?? {})) t[k] = (t[k] ?? 0) + v;
    for (const [k, v] of Object.entries(t)) total[k] = (total[k] ?? 0) + v;
    return { dia: d, t };
  });
  const escriturasMes = data.escrituras[mes(ahora)] ?? 0;
  return { total, porDia: porDia.reverse(), escriturasMes, topeAlcanzado: escriturasMes >= TOPE_ESCRITURAS_MES };
}

/** Las dos puertas falsas: qué botones pertenecen a cada una. */
export const PUERTAS = { piloto: ["cabecera", "portada", "tras-demo", "piloto"], ahorro: ["ahorro"] } as const;
export const puertaDe = (origen: string): keyof typeof PUERTAS => (origen === "ahorro" ? "ahorro" : "piloto");

/** Suma de un tipo de evento en todos los orígenes (p. ej. todos los «cta.*»). */
export const sumaTipo = (t: Totales, tipo: string) => Object.entries(t).reduce((a, [k, v]) => (k.startsWith(`${tipo}.`) ? a + v : a), 0);
