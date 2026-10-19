import { createHash } from "node:crypto";
import { crearLimitador } from "@/lib/lead/rate-limit";
import { aFila, guardarEnHoja } from "@/lib/lead/sheets";
import { validarLead, type LeadInput } from "@/lib/lead/validate";

// POST /api/lead → valida la solicitud de piloto y la guarda en Google Sheets.

const permitido = crearLimitador(5, 10 * 60 * 1000);
const MAX_BYTES = 16 * 1024;

const json = (status: number, body: object) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  // Solo desde la propia web.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return json(403, { ok: false, error: "Origen no permitido." });

  // La IP solo se usa (resumida) como clave del límite en memoria; no se guarda.
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "sin-ip";
  const clave = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  if (!permitido(clave)) return json(429, { ok: false, error: "Demasiados envíos seguidos. Espera unos minutos." });

  const raw = await request.text();
  if (raw.length > MAX_BYTES) return json(413, { ok: false, error: "Solicitud demasiado grande." });
  let body: LeadInput;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "Datos no válidos." });
  }

  const r = validarLead(body);
  if (!r.ok && r.bot) return json(200, { ok: true }); // a los bots se les dice que sí y no se guarda nada
  if (!r.ok) return json(422, { ok: false, errores: r.errores });

  const envio = await guardarEnHoja(aFila(r.lead, new Date()));
  if (!envio.ok) {
    console.error("[lead]", envio.detalle);
    return json(502, { ok: false, error: "No se ha podido guardar la solicitud." });
  }
  return json(200, { ok: true });
}
