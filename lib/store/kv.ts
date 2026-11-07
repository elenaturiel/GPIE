/**
 * Base de datos de la web: Upstash Redis, creada desde Vercel (proyecto → Storage → Upstash for Redis,
 * región Frankfurt). Vercel añade solo las variables de entorno al conectarla:
 *   KV_REST_API_URL y KV_REST_API_TOKEN   (o UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN)
 *
 * Se usa su API REST con fetch (sin dependencias). Para probar en local sin base de datos:
 * STORE=memory guarda en la memoria del proceso (se pierde al reiniciar; nunca en producción).
 */

export type Cmd = (string | number)[];

type Env = Record<string, string | undefined>;

export class KvNoConfigurado extends Error {
  constructor() {
    super("Base de datos no configurada: conecta Upstash for Redis en Vercel (Storage) o define KV_REST_API_URL y KV_REST_API_TOKEN.");
  }
}

/** Ejecuta varios comandos de Redis seguidos y devuelve sus resultados en orden. */
export async function kv(cmds: Cmd[], env: Env = process.env, doFetch: typeof fetch = fetch): Promise<unknown[]> {
  if (env.STORE === "memory") return memoria(cmds);
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new KvNoConfigurado();
  const res = await doFetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds.map((c) => c.map(String))),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Upstash respondió HTTP ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  const err = data.find((d) => d.error);
  if (err) throw new Error(`Upstash: ${err.error}`);
  return data.map((d) => d.result);
}

/* ── Almacén en memoria (solo pruebas locales, STORE=memory) ──
   En globalThis porque Next empaqueta cada ruta por separado: así la ruta que guarda y la página que
   lee ven los mismos datos dentro del mismo proceso. */
const g = globalThis as typeof globalThis & { __intactaMem?: { listas: Map<string, string[]>; hashes: Map<string, Map<string, number>> } };
g.__intactaMem ??= { listas: new Map(), hashes: new Map() };
const { listas, hashes } = g.__intactaMem;

function memoria(cmds: Cmd[]): unknown[] {
  return cmds.map(([op, key, ...args]) => {
    const k = String(key);
    switch (String(op).toUpperCase()) {
      case "RPUSH": {
        const l = listas.get(k) ?? [];
        l.push(...args.map(String));
        listas.set(k, l);
        return l.length;
      }
      case "LRANGE": {
        const l = listas.get(k) ?? [];
        const a = Number(args[0]);
        const b = Number(args[1]);
        return l.slice(a, b === -1 ? undefined : b + 1);
      }
      case "LREM": {
        const l = listas.get(k) ?? [];
        const i = l.indexOf(String(args[1]));
        if (i === -1) return 0;
        l.splice(i, 1);
        return 1;
      }
      case "HINCRBY": {
        const h = hashes.get(k) ?? new Map<string, number>();
        const v = (h.get(String(args[0])) ?? 0) + Number(args[1]);
        h.set(String(args[0]), v);
        hashes.set(k, h);
        return v;
      }
      case "HGETALL": {
        const h = hashes.get(k);
        return h ? [...h].flatMap(([f, v]) => [f, String(v)]) : [];
      }
      case "EXPIRE":
        return 1;
      default:
        throw new Error(`Comando no soportado en memoria: ${op}`);
    }
  });
}
