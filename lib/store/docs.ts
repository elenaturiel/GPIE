import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

/**
 * Almacén de la web: Vercel Blob (privado), gratis en el plan Hobby.
 * Crear en Vercel: proyecto → Storage → Create → Blob → acceso «Private», región Frankfurt (fra1).
 * Al conectarlo al proyecto, Vercel da las credenciales solo (OIDC: BLOB_STORE_ID / VERCEL_OIDC_TOKEN,
 * o BLOB_READ_WRITE_TOKEN).
 *
 * Se guardan pocos documentos JSON (interesados, contadores) y cada escritura es condicional (ETag):
 * si otro envío ha cambiado el documento entretanto, se vuelve a leer y se reintenta. Así no se pierde
 * nada aunque lleguen dos solicitudes a la vez.
 *
 * ⚠️ Límites del plan Hobby: 2.000 escrituras al mes. Si se superan, Vercel no cobra pero bloquea el
 * almacén 30 días. Por eso los contadores se agrupan (lib/metrics/stats.ts) y tienen un tope mensual.
 *
 * Para probar en local sin Vercel: STORE=memory (se pierde al reiniciar; nunca en producción).
 */

export class AlmacenNoConfigurado extends Error {
  constructor() {
    super("Almacenamiento no configurado: crea un Blob privado en Vercel (Storage → Create → Blob, acceso Private, región Frankfurt) y conéctalo al proyecto.");
  }
}

type Env = Record<string, string | undefined>;
export type Doc<T> = { data: T; etag: string | null };

const PREFIX = "intacta/";
const memoriaActiva = (env: Env) => env.STORE === "memory";
export const almacenConfigurado = (env: Env = process.env) => memoriaActiva(env) || !!(env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID);

/* ── Memoria (solo pruebas): en globalThis porque Next empaqueta cada ruta por separado ── */
const g = globalThis as typeof globalThis & { __intactaDocs?: Map<string, { body: string; etag: string }>; __intactaEtag?: number };
g.__intactaDocs ??= new Map();
g.__intactaEtag ??= 0;

export class Conflicto extends Error {}

export async function leerDoc<T>(nombre: string, vacio: T, env: Env = process.env): Promise<Doc<T>> {
  if (memoriaActiva(env)) {
    const d = g.__intactaDocs!.get(nombre);
    return d ? { data: JSON.parse(d.body) as T, etag: d.etag } : { data: vacio, etag: null };
  }
  if (!almacenConfigurado(env)) throw new AlmacenNoConfigurado();
  const r = await get(PREFIX + nombre, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return { data: vacio, etag: null };
  const texto = await new Response(r.stream).text();
  return { data: JSON.parse(texto) as T, etag: r.blob.etag };
}

/** Escribe el documento solo si nadie lo ha cambiado desde que se leyó (etag). Si no, lanza Conflicto. */
export async function escribirDoc<T>(nombre: string, data: T, etag: string | null, env: Env = process.env): Promise<void> {
  const body = JSON.stringify(data);
  if (memoriaActiva(env)) {
    const actual = g.__intactaDocs!.get(nombre);
    if ((actual?.etag ?? null) !== etag) throw new Conflicto();
    g.__intactaDocs!.set(nombre, { body, etag: `m${++g.__intactaEtag!}` });
    return;
  }
  if (!almacenConfigurado(env)) throw new AlmacenNoConfigurado();
  try {
    await put(PREFIX + nombre, body, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      // primera vez: que falle si otro lo acaba de crear; después: solo si no ha cambiado
      ...(etag ? { ifMatch: etag, allowOverwrite: true } : { allowOverwrite: false }),
      cacheControlMaxAge: 60,
    });
  } catch (e) {
    if (e instanceof BlobPreconditionFailedError || (!etag && /already exists/i.test((e as Error).message))) throw new Conflicto();
    throw e;
  }
}

/** Lee, aplica `cambio` y escribe, reintentando si otro lo ha cambiado a la vez. Si `cambio` devuelve null, no escribe. */
export async function actualizarDoc<T>(nombre: string, vacio: T, cambio: (d: T) => T | null, env: Env = process.env): Promise<T> {
  for (let intento = 0; intento < 5; intento++) {
    const { data, etag } = await leerDoc(nombre, vacio, env);
    const nuevo = cambio(structuredClone(data));
    if (nuevo === null) return data; // nada que cambiar: no gasta una escritura
    try {
      await escribirDoc(nombre, nuevo, etag, env);
      return nuevo;
    } catch (e) {
      if (!(e instanceof Conflicto)) throw e;
      await new Promise((r) => setTimeout(r, 80 + Math.random() * 200));
    }
  }
  throw new Error(`No se ha podido guardar ${nombre}: demasiados cambios a la vez.`);
}
