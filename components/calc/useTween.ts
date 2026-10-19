"use client";

import { useEffect, useRef, useState } from "react";

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Número que se desliza hasta su nuevo valor (450 ms, ease-out). Si cambia a medio camino, sale
 * desde donde está. Con movimiento reducido salta directo.
 */
export function useTween(value: number, duration = 450) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const current = useRef(value);
  useEffect(() => {
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    from.current = current.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = instant ? 1 : Math.min(1, (now - t0) / duration);
      current.current = from.current + (value - from.current) * ease(k);
      setShown(current.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return shown;
}
