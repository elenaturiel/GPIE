import { describe, expect, it } from "vitest";
import { buildSegments, DEMO, MOBILE_SLOT, poseAt, type Layout } from "./poses";

const VH = 900;
const layout = (mobile: boolean): Layout => ({
  vh: VH,
  mobile,
  specs: { top: 900, height: 3 * VH },
  demo: { top: 3600, height: 5 * VH },
  sections: [
    { pose: "problem", top: 8100, height: 1500 },
    { pose: "how", top: 9600, height: 1500 },
    { pose: "where", top: 11100, height: 1500 },
    { pose: "pilot", top: 12600, height: 2200 },
  ],
  sprayTarget: (t) => ({ x: 0.1 + 0.8 * t, y: 0.6 }),
});

describe("buildSegments", () => {
  for (const mobile of [false, true]) {
    const name = mobile ? "móvil" : "escritorio";
    const { segments, specs, demo } = buildSegments(layout(mobile));

    it(`los tramos son contiguos y crecientes (${name})`, () => {
      for (let i = 1; i < segments.length; i++) {
        expect(segments[i].a).toBe(segments[i - 1].b);
        expect(segments[i].b).toBeGreaterThanOrEqual(segments[i].a);
      }
      expect(specs).toEqual([900, 900 + 2 * VH]);
      expect(demo).toEqual([3600, 3600 + 4 * VH]);
    });

    it(`la pose nunca salta entre dos píxeles de scroll (${name})`, () => {
      let prev = poseAt(segments, 0);
      for (let y = 1; y < 16000; y += 1) {
        const p = poseAt(segments, y);
        // un píxel de scroll no puede mover el bote visible más de un 2 % de pantalla
        // (en móvil cambia de franja mientras es invisible: ahí sí puede saltar)
        if (p.o > 0.05 && prev.o > 0.05) {
          expect(Math.abs(p.x - prev.x)).toBeLessThan(0.02);
          expect(Math.abs(p.y - prev.y)).toBeLessThan(0.02);
          expect(Math.abs(p.s - prev.s)).toBeLessThan(0.02);
        }
        expect(Math.abs(p.o - prev.o)).toBeLessThan(0.02);
        prev = p;
      }
    });

    it(`gira 360° en especificaciones (${name})`, () => {
      const a = poseAt(segments, specs[0]);
      const b = poseAt(segments, specs[1]);
      expect(b.ry - a.ry).toBeCloseTo(Math.PI * 2, 5);
    });

    it(`rocía inclinado y luego se aparta (${name})`, () => {
      const spraying = poseAt(segments, demo[0] + (demo[1] - demo[0]) * ((DEMO.sprayFrom + DEMO.sprayTo) / 2));
      const aside = poseAt(segments, demo[0] + (demo[1] - demo[0]) * 0.8);
      expect(spraying.rz).toBeCloseTo(0.5);
      expect(Math.abs(aside.rz)).toBeLessThan(0.1);
      expect(aside.x).toBeGreaterThan(0.8);
    });
  }

  it("en móvil el bote va dentro de la franja vacía y se queda arriba", () => {
    const { segments } = buildSegments(layout(true));
    const top = 9600; // sección "how"
    // la franja asoma por abajo: el bote está en su centro
    const y1 = top - VH * 0.7;
    const p1 = poseAt(segments, y1);
    expect(p1.y).toBeCloseTo((top + (MOBILE_SLOT * VH) / 2 - y1) / VH, 5);
    expect(p1.o).toBe(1);
    // la franja ya ha pasado: el bote se queda arriba (y lo tapa el texto)
    const p2 = poseAt(segments, top + 600);
    expect(p2.y).toBe(0.25);
  });

  it("en escritorio el bote nunca cruza visible de un lado al otro entre secciones", () => {
    const L = layout(false);
    const { segments } = buildSegments(L);
    for (let i = 1; i < L.sections.length; i++) {
      // tramo entre el final de una sección y el momento en que la siguiente queda fija
      const from = L.sections[i - 1].top + L.sections[i - 1].height - VH * 0.8;
      const to = L.sections[i].top - VH * 0.35;
      for (let y = from; y <= to; y += 5) {
        const p = poseAt(segments, y);
        // por el centro de la pantalla (donde está el texto de las dos secciones) solo pasa invisible
        if (Math.abs(p.x - 0.5) < 0.2) expect(p.o).toBeLessThan(0.05);
      }
    }
  });

  it("en escritorio la portada deja el titular a la izquierda del bote", () => {
    const { segments } = buildSegments(layout(false));
    const p = poseAt(segments, 0);
    expect(p.x).toBeGreaterThan(0.6);
  });
});
