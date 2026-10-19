/**
 * Content Security Policy de la web.
 *
 * Los scripts solo se ejecutan si vienen de este dominio o llevan el nonce de la petición
 * ('strict-dynamic' deja que esos scripts carguen sus propios trozos). Los estilos permiten
 * 'unsafe-inline' porque el bote y la coreografía cambian estilos en línea; no hay HTML
 * de terceros en la página, así que el riesgo es bajo.
 *
 * Cuando se añadan GA4 o Meta Pixel (fase 5), sus dominios se añaden en EXTRA_*.
 */
const EXTRA_SCRIPT: string[] = [];
const EXTRA_CONNECT: string[] = [];
const EXTRA_IMG: string[] = [];

export function buildCsp(nonce: string, isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : []), ...EXTRA_SCRIPT],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:", ...EXTRA_IMG],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...EXTRA_CONNECT],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const csp = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (!isDev) csp.push("upgrade-insecure-requests");
  return csp.join("; ");
}

/** Cabeceras fijas para todas las respuestas (la CSP va aparte, con su nonce). */
export const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
