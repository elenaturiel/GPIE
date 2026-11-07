import { randomUUID } from "node:crypto";
import { casillas, primeraCapa, VERSION_PRIVACIDAD } from "@/content/legal";
import { kv } from "@/lib/store/kv";
import type { Lead } from "./validate";

/**
 * Interesados en el piloto, guardados en la base de datos de la web (Upstash Redis en Vercel).
 * Se consultan, descargan y borran en /panel.
 */

const KEY = "intacta:interesados";
export const CONSERVAR_DIAS = 365; // plazo de conservación: 12 meses

export type Interesado = Lead & {
  id: string;
  fecha: string;
  consentimiento: { fecha: string; version: string; texto: string };
};

/** Prueba del consentimiento: el texto exacto que se aceptó. */
export const TEXTO_CONSENTIMIENTO = [casillas.privacidad, ...Object.values(primeraCapa).slice(0, 5)].join(" ");

export function nuevoInteresado(lead: Lead, ahora: Date): Interesado {
  const fecha = ahora.toISOString();
  return { ...lead, id: randomUUID(), fecha, consentimiento: { fecha, version: VERSION_PRIVACIDAD, texto: TEXTO_CONSENTIMIENTO } };
}

export async function guardarInteresado(i: Interesado) {
  await kv([["RPUSH", KEY, JSON.stringify(i)]]);
}

async function crudos(): Promise<string[]> {
  const [r] = await kv([["LRANGE", KEY, 0, -1]]);
  return (r as string[]) ?? [];
}

const leer = (s: string): Interesado | null => {
  try {
    return JSON.parse(s) as Interesado;
  } catch {
    return null;
  }
};

/** Todos los interesados, el más reciente primero. Antes borra los que han pasado el plazo. */
export async function listarInteresados(ahora = new Date()): Promise<Interesado[]> {
  const raw = await crudos();
  const limite = ahora.getTime() - CONSERVAR_DIAS * 864e5;
  const caducados = raw.filter((s) => {
    const i = leer(s);
    return i && new Date(i.fecha).getTime() < limite;
  });
  if (caducados.length) await kv(caducados.map((s) => ["LREM", KEY, 1, s]));
  return raw
    .filter((s) => !caducados.includes(s))
    .map(leer)
    .filter((i): i is Interesado => !!i)
    .reverse();
}

/** Borra un interesado (derecho de supresión). Devuelve si existía. */
export async function borrarInteresado(id: string): Promise<boolean> {
  const s = (await crudos()).find((x) => leer(x)?.id === id);
  if (!s) return false;
  await kv([["LREM", KEY, 1, s]]);
  return true;
}
