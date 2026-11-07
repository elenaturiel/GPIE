/**
 * Suma 1 a un contador del embudo (lib/metrics/stats.ts) desde el navegador.
 * Sin cookies ni identificadores: solo dice «ha pasado esto». Si falla, no pasa nada.
 */
export function track(e: "visita" | "cta" | "empezado", o?: string) {
  try {
    void fetch("/api/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ e, o }),
      keepalive: true, // que llegue aunque se cierre la página
    }).catch(() => {});
  } catch {
    /* sin red o navegador antiguo: el contador no es imprescindible */
  }
}
