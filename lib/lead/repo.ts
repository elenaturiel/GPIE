import { randomUUID } from "node:crypto";
import { casillas, primeraCapa, VERSION_PRIVACIDAD } from "@/content/legal";
import { actualizarDoc, leerDoc } from "@/lib/store/docs";
import type { Lead } from "./validate";

/**
 * Interesados (los que dejan sus datos en cualquiera de las dos puertas falsas), guardados en el
 * almacén privado de la web (Vercel Blob). Se consultan, descargan y borran en /panel.
 * Un solo documento: una escritura por solicitud.
 */

const DOC = "interesados.json";
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
  await actualizarDoc<Interesado[]>(DOC, [], (lista) => [...lista, i]);
}

const vigente = (ahora: Date) => (i: Interesado) => new Date(i.fecha).getTime() >= ahora.getTime() - CONSERVAR_DIAS * 864e5;

/** Todos los interesados, el más reciente primero. Si alguno ha pasado el plazo, lo borra. */
export async function listarInteresados(ahora = new Date()): Promise<Interesado[]> {
  const { data } = await leerDoc<Interesado[]>(DOC, []);
  let lista = data;
  if (data.some((i) => !vigente(ahora)(i))) lista = await actualizarDoc<Interesado[]>(DOC, [], (l) => l.filter(vigente(ahora)));
  return [...lista].reverse();
}

/** Borra un interesado (derecho de supresión). Devuelve si existía. */
export async function borrarInteresado(id: string): Promise<boolean> {
  let existia = false;
  await actualizarDoc<Interesado[]>(DOC, [], (l) => {
    existia = l.some((i) => i.id === id);
    return existia ? l.filter((i) => i.id !== id) : null;
  });
  return existia;
}
