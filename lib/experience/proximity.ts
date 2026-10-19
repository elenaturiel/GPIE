/**
 * Proximidad variable en el titular de la portada: cada letra se ensancha y gana peso según lo cerca
 * que esté el cursor (ejes 'wdth' y 'wght' de Archivo variable). Solo con ratón o trackpad y sin
 * movimiento reducido. Adaptado de VariableProximity (Train with Jaime).
 */
const FROM = { wdth: 62, wght: 850 };
const TO = { wdth: 92, wght: 900 };
const RADIUS = 170;

export function startProximity(): () => void {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const title = document.querySelector<HTMLElement>(".hero-type");
  if (!title) return () => {};
  const letters = [...title.querySelectorAll<HTMLElement>(".vp")];
  let pointer: { x: number; y: number } | null = null;
  let raf = 0;
  let active = false;

  const set = (el: HTMLElement, t: number) => {
    el.style.fontVariationSettings = `'wdth' ${Math.round(FROM.wdth + (TO.wdth - FROM.wdth) * t)}, 'wght' ${Math.round(FROM.wght + (TO.wght - FROM.wght) * t)}`;
  };

  function paint() {
    raf = 0;
    const box = title!.getBoundingClientRect();
    const near =
      pointer && pointer.x > box.left - RADIUS && pointer.x < box.right + RADIUS && pointer.y > box.top - RADIUS && pointer.y < box.bottom + RADIUS;
    if (!near) {
      if (active) letters.forEach((el) => (el.style.fontVariationSettings = ""));
      active = false;
      return;
    }
    active = true;
    // leer todas las posiciones antes de escribir ningún estilo (una sola maquetación por fotograma)
    const centers = letters.map((el) => {
      const r = el.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    });
    letters.forEach((el, i) => {
      const d = Math.hypot(pointer!.x - centers[i][0], pointer!.y - centers[i][1]);
      const t = d >= RADIUS ? 0 : Math.exp(-((d / RADIUS) ** 2) * 3); // caída gaussiana
      set(el, t);
    });
  }
  const onMove = (e: PointerEvent) => {
    pointer = { x: e.clientX, y: e.clientY };
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const onLeave = () => {
    pointer = null;
    if (!raf) raf = requestAnimationFrame(paint);
  };
  addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}
