export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const smooth = (t: number) => t * t * (3 - 2 * t);
/** Se pasa un poco y vuelve: para las gotas que se separan al caer. */
export const easeBack = (t: number) => {
  const c = 1.5;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

/** Generador pseudoaleatorio con semilla (mulberry32): las manchas salen siempre iguales. */
export function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RGB = readonly [number, number, number];

/** Aclara (k > 0) u oscurece (k < 0) un color y lo devuelve como rgba(). */
export const shade = (rgb: RGB, k: number, a = 1) => {
  const f = k >= 0 ? (c: number) => c + (255 - c) * k : (c: number) => c * (1 + k);
  return `rgba(${rgb.map((c) => Math.round(f(c))).join(",")},${a})`;
};
