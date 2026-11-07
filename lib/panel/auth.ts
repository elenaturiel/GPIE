import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Acceso a /panel con una contraseña (variable de entorno PANEL_PASSWORD en Vercel).
 * Al entrar se guarda una cookie técnica (necesaria para la sesión del panel, exenta de consentimiento):
 * solo en /panel, httpOnly, 8 horas. Cambiar la contraseña cierra todas las sesiones.
 */

export const COOKIE = "intacta_panel";
export const DURACION_S = 8 * 3600;

const token = (password: string) => createHmac("sha256", password).update("intacta-panel-v1").digest("hex");

export const panelConfigurado = () => !!process.env.PANEL_PASSWORD;

export function passwordCorrecta(intento: string, password = process.env.PANEL_PASSWORD ?? ""): boolean {
  if (!password) return false;
  // comparar resúmenes de igual longitud, en tiempo constante
  const a = createHash("sha256").update(intento).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}

export const valorCookie = () => token(process.env.PANEL_PASSWORD ?? "");

export async function sesionValida(): Promise<boolean> {
  const password = process.env.PANEL_PASSWORD;
  if (!password) return false;
  const v = (await cookies()).get(COOKIE)?.value ?? "";
  const esperado = token(password);
  return v.length === esperado.length && timingSafeEqual(Buffer.from(v), Buffer.from(esperado));
}
