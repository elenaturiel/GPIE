import { clamp, lerp, smooth } from "./math";

/**
 * Dónde está el bote en cada momento del scroll.
 *
 * Una pose se da en fracciones de la pantalla: x / y es el centro del bote (0 = izquierda/arriba,
 * 1 = derecha/abajo), s su altura respecto a la de la pantalla, rx / ry / rz los giros en radianes
 * y o su opacidad (0 a 1).
 */
export type Pose = { x: number; y: number; s: number; rx: number; ry: number; rz: number; o: number };

/** Pose de una sección de texto: entra con giro ry0 y sale con ry1 mientras lees. */
type SectionPose = Omit<Pose, "ry"> & { ry0: number; ry1: number };

export const TAU = Math.PI * 2;

export const mix = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  s: lerp(a.s, b.s, t),
  rx: lerp(a.rx, b.rx, t),
  ry: lerp(a.ry, b.ry, t),
  rz: lerp(a.rz, b.rz, t),
  o: lerp(a.o, b.o, t),
});

const pose = (p: Partial<Pose>): Pose => ({ x: 0.5, y: 0.5, s: 1, rx: 0, ry: 0, rz: 0, o: 1, ...p });

/* ── Escritorio ─────────────────────────────────────────────
   Portada: el bote, gigante y cortado por abajo, a la derecha del titular (las dos líneas se leen
   enteras y el final de «MANCHA» queda justo detrás de su borde). */
const DESKTOP = {
  hero: pose({ x: 0.7, y: 0.74, s: 1.1, rx: 0.04, ry: -0.42 }),
  sections: {
    problem: { x: 0.8, y: 0.52, s: 0.62, rx: 0.05, ry0: 0.3, ry1: 1.3, rz: -0.12, o: 1 },
    how: { x: 0.2, y: 0.5, s: 0.6, rx: 0.05, ry0: 2.3, ry1: 3.3, rz: 0.14, o: 1 },
    where: { x: 0.82, y: 0.5, s: 0.52, rx: 0.05, ry0: 3.9, ry1: 4.9, rz: -0.08, o: 1 },
    // en la calculadora el bote se aparta hacia el borde y se desvanece: hace falta todo el ancho
    calc: { x: 0.97, y: 0.5, s: 0.4, rx: 0.05, ry0: 4.9, ry1: 4.9, rz: -0.1, o: 0 },
    steps: { x: 0.82, y: 0.52, s: 0.6, rx: 0.05, ry0: 4.9, ry1: TAU - 0.6, rz: 0.1, o: 1 },
    pilot: { x: 0.79, y: 0.52, s: 0.82, rx: 0.04, ry0: TAU - 0.6, ry1: TAU - 0.3, rz: -0.1, o: 1 },
  } as Record<string, SectionPose>,
};

/* ── Móvil ──────────────────────────────────────────────────
   En las secciones de lectura el bote viaja dentro de una franja vacía al principio de cada sección
   (`.slot`, un tercio de pantalla): sube con ella y, cuando la franja llega arriba, se queda quieto y
   el texto (opaco, por encima) lo tapa. Así nunca pisa el texto y no hay pantallas vacías. */
export const MOBILE_SLOT = 0.34; // alto de la franja, en pantallas (debe coincidir con el CSS)
const MOBILE_TOP = 0.25; // altura a la que se queda el bote cuando la franja llega arriba
const MOBILE = {
  hero: pose({ x: 0.5, y: 0.8, s: 0.92, rx: 0.04, ry: -0.42 }),
  sections: {
    problem: { x: 0.5, y: 0, s: 0.26, rx: 0.05, ry0: 0.3, ry1: 1.3, rz: -0.1, o: 1 },
    how: { x: 0.5, y: 0, s: 0.26, rx: 0.05, ry0: 2.3, ry1: 3.3, rz: 0.1, o: 1 },
    where: { x: 0.5, y: 0, s: 0.26, rx: 0.05, ry0: 3.9, ry1: 4.9, rz: -0.08, o: 1 },
    calc: { x: 0.5, y: 0, s: 0.26, rx: 0.05, ry0: 4.9, ry1: 4.9, rz: 0, o: 0 },
    steps: { x: 0.5, y: 0, s: 0.26, rx: 0.05, ry0: 4.9, ry1: TAU - 0.6, rz: 0.08, o: 1 },
    pilot: { x: 0.5, y: 0, s: 0.28, rx: 0.04, ry0: TAU - 0.6, ry1: TAU - 0.3, rz: -0.08, o: 1 },
  } as Record<string, SectionPose>,
};

/** Giro de 360° en la sección de especificaciones (u = 0…1). */
export const specPose = (u: number, mobile: boolean): Pose =>
  pose({
    x: 0.5,
    y: mobile ? 0.56 : 0.53,
    s: mobile ? 0.46 : 0.78,
    rx: 0.08 * Math.sin(Math.PI * u),
    ry: -0.42 + u * TAU,
  });

/** Momentos de la demo (t = 0…1 dentro de la sección fija). */
export const DEMO = { sprayFrom: 0.08, sprayTo: 0.38, sprayEnd: 0.42, sideAt: 0.54 };

/**
 * Pose en la demo. `target` es el punto de la tela al que apunta la niebla, en fracciones de pantalla.
 * Mientras rocía, el bote va inclinado siguiendo ese punto; después se aparta a un lado y gira despacio.
 */
export function demoPose(t: number, mobile: boolean, target: (t: number) => { x: number; y: number }): Pose {
  const spray = (tt: number) =>
    pose({
      x: clamp(target(tt).x + (mobile ? 0.2 : 0.13), 0.25, mobile ? 0.84 : 0.92),
      y: mobile ? 0.3 : 0.26,
      s: mobile ? 0.3 : 0.44,
      ry: TAU - Math.PI / 2 + 0.12,
      rz: 0.5,
    });
  const side = pose({ x: mobile ? 0.84 : 0.88, y: mobile ? 0.3 : 0.26, s: mobile ? 0.2 : 0.38, rx: 0.05, ry: TAU - 0.4, rz: -0.06 });
  if (t < DEMO.sprayEnd) return spray(t);
  if (t < DEMO.sideAt) return mix(spray(DEMO.sprayEnd - 1e-4), side, smooth((t - DEMO.sprayEnd) / (DEMO.sideAt - DEMO.sprayEnd)));
  return { ...side, ry: side.ry + (t - DEMO.sideAt) * 1.2 };
}

/** Un tramo del scroll: entre a y b (px de documento) la pose sale de f(u, scrollY), con u = 0…1. */
export type Segment = { a: number; b: number; f: (u: number, y: number) => Pose };

export type Layout = {
  vh: number;
  mobile: boolean;
  specs: { top: number; height: number };
  demo: { top: number; height: number };
  /** Secciones de lectura en orden, con el nombre de su pose (data-pose). */
  sections: { pose: string; top: number; height: number }[];
  /** Punto de la tela al que rocía el bote, en fracciones de pantalla. */
  sprayTarget: (t: number) => { x: number; y: number };
};

export function buildSegments(L: Layout): { segments: Segment[]; specs: [number, number]; demo: [number, number] } {
  const P = L.mobile ? MOBILE : DESKTOP;
  const sA = L.specs.top;
  const sB = sA + L.specs.height - L.vh;
  const dA = L.demo.top;
  const dB = dA + L.demo.height - L.vh;
  const demoAt = (t: number) => demoPose(t, L.mobile, L.sprayTarget);

  const segments: Segment[] = [
    { a: 0, b: sA, f: (u) => mix(P.hero, specPose(0, L.mobile), smooth(u)) },
    { a: sA, b: sB, f: (u) => specPose(u, L.mobile) },
    { a: sB, b: dA, f: (u) => mix(specPose(1, L.mobile), demoAt(0), smooth(u)) },
    { a: dA, b: dB, f: (u) => demoAt(u) },
  ];

  let prevAt = dB;
  let prev: (y: number) => Pose = () => demoAt(1);

  for (const sec of L.sections) {
    const p = P.sections[sec.pose];
    if (!p) continue;
    const { ry0, ry1, ...rest } = p;
    const from = prev;

    if (L.mobile) {
      // La franja (slot) ocupa el principio de la sección: el bote va en su centro hasta que se queda arriba.
      const slotCenter = sec.top + (MOBILE_SLOT * L.vh) / 2;
      const follow = (y: number, ry: number): Pose => ({ ...rest, ry, y: Math.max(MOBILE_TOP, (slotCenter - y) / L.vh) });
      const a = Math.max(prevAt, sec.top - L.vh); // la franja asoma por abajo
      const m = Math.max(a, sec.top - L.vh * 0.8);
      const b = Math.max(m, sec.top + sec.height - L.vh); // hasta que asoma la sección siguiente
      // Cambio de sitio: el bote anterior está tapado por el texto; se desvanece y reaparece en la franja nueva.
      segments.push({
        a: prevAt,
        b: a,
        f: (_u, y) => from(y),
      });
      segments.push({
        a,
        b: m,
        f: (u, y) => {
          const q = u < 0.5 ? from(y) : follow(y, ry0);
          return { ...q, o: q.o * Math.abs(1 - 2 * u) };
        },
      });
      segments.push({ a: m, b, f: (u, y) => follow(y, lerp(ry0, ry1, u)) });
      prevAt = b;
      prev = (y) => follow(y, ry1);
    } else {
      const pin: Pose = { ...rest, ry: ry0 };
      const out: Pose = { ...rest, ry: ry1 };
      const a = Math.max(prevAt, sec.top - L.vh * 0.35);
      const b = Math.max(a, sec.top + sec.height - L.vh * 0.8);
      segments.push({ a: prevAt, b: a, f: (u, y) => mix(from(y), pin, smooth(u)) });
      segments.push({ a, b, f: (u) => mix(pin, out, u) });
      prevAt = b;
      prev = () => out;
    }
  }

  const last = prev;
  segments.push({ a: prevAt, b: Number.POSITIVE_INFINITY, f: (_u, y) => last(y) });
  return { segments, specs: [sA, sB], demo: [dA, dB] };
}

/** Pose del bote para un scroll dado. */
export function poseAt(segments: Segment[], y: number): Pose {
  for (const s of segments) {
    if (y <= s.b) {
      const u = s.b > s.a && Number.isFinite(s.b) ? clamp((y - s.a) / (s.b - s.a)) : 1;
      return s.f(u, y);
    }
  }
  const s = segments[segments.length - 1];
  return s.f(1, y);
}
