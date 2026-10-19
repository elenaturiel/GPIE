/**
 * Límite de envíos por visitante: como mucho `max` en `ventanaMs`.
 *
 * Vive en la memoria de la función del servidor, así que cada instancia de Vercel lleva su propia
 * cuenta y se reinicia con ella. Para un pretotipo basta (frena a quien insiste desde la misma IP);
 * junto con la trampa para bots y el tiempo mínimo cubre el spam habitual. La IP no se guarda en
 * ningún sitio: solo se usa como clave en memoria unos minutos.
 */
export function crearLimitador(max = 5, ventanaMs = 10 * 60 * 1000) {
  const vistos = new Map<string, number[]>();
  return function permitido(clave: string, ahora = Date.now()): boolean {
    const recientes = (vistos.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
    if (recientes.length >= max) {
      vistos.set(clave, recientes);
      return false;
    }
    recientes.push(ahora);
    vistos.set(clave, recientes);
    if (vistos.size > 5000) for (const [k, ts] of vistos) if (!ts.some((t) => ahora - t < ventanaMs)) vistos.delete(k);
    return true;
  };
}
