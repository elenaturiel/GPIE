/**
 * Botones principales: con ratón, el botón se deja atraer un poco por el cursor (como un imán) y al
 * pulsar suelta una onda desde el punto de contacto. La pulsación (scale 0.97) es CSS.
 * Usa la propiedad `translate` (no `transform`) para no pisar el `scale` del :active.
 */
const PULL = 0.28; // fracción de la distancia al centro
const MAX = 7; // px
const FOLLOW = 0.22; // suavizado por fotograma

export function startMagnetic(): () => void {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const buttons = [...document.querySelectorAll<HTMLElement>(".btn-primary, .btn-light")];
  const offs: (() => void)[] = [];

  for (const btn of buttons) {
    if (!reduce) {
      const ripple = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const size = Math.hypot(r.width, r.height) * 2;
        const dot = document.createElement("span");
        dot.className = "ripple";
        dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
        btn.appendChild(dot);
        dot
          .animate([{ transform: "scale(0.05)", opacity: 0.35 }, { transform: "scale(1)", opacity: 0 }], {
            duration: 550,
            easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          })
          .finished.finally(() => dot.remove());
      };
      btn.addEventListener("pointerdown", ripple);
      offs.push(() => btn.removeEventListener("pointerdown", ripple));
    }
    if (reduce || !fine) continue;

    let target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      cur.x += (target.x - cur.x) * FOLLOW;
      cur.y += (target.y - cur.y) * FOLLOW;
      const done = Math.abs(target.x - cur.x) < 0.05 && Math.abs(target.y - cur.y) < 0.05;
      if (done) Object.assign(cur, target);
      btn.style.translate = cur.x || cur.y ? `${cur.x.toFixed(2)}px ${cur.y.toFixed(2)}px` : "";
      raf = done ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const clampv = (v: number) => Math.max(-MAX, Math.min(MAX, v));
      target = { x: clampv((e.clientX - (r.left + r.width / 2)) * PULL), y: clampv((e.clientY - (r.top + r.height / 2)) * PULL) };
      kick();
    };
    const leave = () => {
      target = { x: 0, y: 0 };
      kick();
    };
    btn.addEventListener("pointermove", move);
    btn.addEventListener("pointerleave", leave);
    offs.push(() => {
      cancelAnimationFrame(raf);
      btn.removeEventListener("pointermove", move);
      btn.removeEventListener("pointerleave", leave);
    });
  }
  return () => offs.forEach((f) => f());
}
