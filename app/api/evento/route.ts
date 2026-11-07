import { campo, sumar } from "@/lib/metrics/stats";

// POST /api/evento → suma 1 a un contador del embudo (visita, clic en «Solicitar piloto»…).
// Sin cookies, sin identificadores y sin guardar la IP: solo totales por día.

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return new Response(null, { status: 403 });
  let body: { e?: unknown; o?: unknown } = {};
  try {
    body = JSON.parse((await request.text()).slice(0, 500));
  } catch {
    return new Response(null, { status: 400 });
  }
  // «envio» solo lo suma el servidor al guardar una solicitud de verdad
  const nombre = body.e === "envio" ? null : campo(body.e, body.o);
  if (!nombre) return new Response(null, { status: 400 });
  try {
    await sumar(nombre);
  } catch (e) {
    console.error("[evento]", (e as Error).message);
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 204 });
}
