import { clamp, easeBack, easeIn, easeInOut, easeOut, lerp, rng, shade, type RGB } from "./math";
import { DEMO } from "./poses";

/**
 * La butaca de la demo, dibujada en un <canvas> 2D y movida por el scroll (t = 0…1).
 *
 *   0.08–0.38  el bote rocía la tela limpia de izquierda a derecha (la tela pasa a «tratada»)
 *   0.44–0.67  caen vino, café y zumo: cada gota choca y se queda en bolitas encima
 *   0.72–0.88  un paño pasa de izquierda a derecha y se lleva las gotas
 *   0.86–0.96  brillo de tela limpia
 */

type Liquid = { rgb: RGB; size: number };
const WINE: Liquid = { rgb: [122, 18, 40], size: 1.15 };
const COFFEE: Liquid = { rgb: [92, 56, 30], size: 1 };
const JUICE: Liquid = { rgb: [236, 128, 16], size: 0.9 };

/** Dónde cae cada líquido (en fracciones de la tela) y cuándo empieza a caer. */
const DROPS = [
  { fx: 0.22, fy: 0.56, liquid: WINE, seed: 3, at: 0.44 },
  { fx: 0.5, fy: 0.44, liquid: COFFEE, seed: 11, at: 0.5 },
  { fx: 0.78, fy: 0.6, liquid: JUICE, seed: 21, at: 0.56 },
];
const FALL = 0.05; // lo que tarda en caer
const SPLAT = 0.06; // lo que tarda en separarse en gotas
const TOWEL = { from: 0.72, to: 0.88 };
const SHINE = { from: 0.86, to: 0.96 };

export const DEMO_PHASES = [DEMO.sprayEnd, 0.7]; // fase 0 hasta 0.42, fase 1 hasta 0.70, fase 2 después

export function phaseAt(t: number) {
  return t < DEMO_PHASES[0] ? 0 : t < DEMO_PHASES[1] ? 1 : 2;
}

/** Punto de la tela al que apunta la niebla (fracciones de la tela). */
export function sprayPoint(t: number) {
  const p = clamp((t - DEMO.sprayFrom) / (DEMO.sprayTo - DEMO.sprayFrom));
  return { fx: lerp(0.1, 0.9, p), fy: 0.52 + 0.1 * Math.sin(p * Math.PI * 3), p };
}

export type DemoLabels = { fabric: string; untreated: string; treated: string };

export class StainDemo {
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private dpr = 1;
  private fabric: HTMLCanvasElement | null = null;
  private monoFont = "monospace";
  /** Rectángulo de la tela dentro del canvas, y tamaños derivados. */
  s = { sw: 0, sh: 0, sx: 0, sy: 0, maxR: 0, dropR: 0, rad: 0 };

  constructor(
    private canvas: HTMLCanvasElement,
    private wrap: HTMLElement,
    private labels: DemoLabels,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D no disponible");
    this.ctx = ctx;
  }

  layout(mobile: boolean) {
    const r = this.wrap.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.W = r.width;
    this.H = r.height;
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    const sw = Math.min(this.W * 0.94, 1000);
    const sh = Math.min(this.H * (mobile ? 0.6 : 0.64), sw * 0.56);
    const sx = (this.W - sw) / 2;
    const sy = this.H - sh - Math.max(8, (this.H - sh) * 0.08);
    this.s = {
      sw,
      sh,
      sx,
      sy,
      maxR: Math.min(sh * 0.25, sw * 0.12),
      dropR: Math.max(7, Math.min(sw * 0.035, sh * 0.1)),
      rad: Math.min(22, sw * 0.03),
    };
    this.monoFont = getComputedStyle(document.documentElement).getPropertyValue("--f-mono").trim() || "monospace";
    this.buildFabric();
  }

  /** Punto de rociado en fracciones de pantalla, con la sección fija (para la pose del bote). */
  targetFrac(t: number, vw: number, vh: number) {
    const q = sprayPoint(t);
    return { x: (this.wrap.offsetLeft + this.s.sx + q.fx * this.s.sw) / vw, y: (this.wrap.offsetTop + this.s.sy + q.fy * this.s.sh) / vh };
  }

  /** Punto de rociado en píxeles de pantalla, tal como está ahora (para las partículas). */
  targetPx(t: number) {
    const r = this.wrap.getBoundingClientRect();
    const q = sprayPoint(t);
    return { x: r.left + this.s.sx + q.fx * this.s.sw, y: r.top + this.s.sy + q.fy * this.s.sh };
  }

  /** Tejido de la butaca: trama, ruido y viñeteado, pintado una vez. */
  private buildFabric() {
    const { sw, sh } = this.s;
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(sw * this.dpr));
    c.height = Math.max(1, Math.round(sh * this.dpr));
    const g = c.getContext("2d")!;
    g.scale(this.dpr, this.dpr);
    const R = rng(7);
    const base = g.createLinearGradient(0, 0, sw, sh);
    base.addColorStop(0, "#E2D8C4");
    base.addColorStop(1, "#CFC3AA");
    g.fillStyle = base;
    g.fillRect(0, 0, sw, sh);
    for (let y = 0; y < sh; y += 2.4) {
      g.fillStyle = (Math.floor(y / 2.4) % 2 ? "rgba(255,252,244," : "rgba(80,62,40,") + (0.05 + R() * 0.07) + ")";
      g.fillRect(0, y, sw, 1);
    }
    for (let x = 0; x < sw; x += 2.4) {
      g.fillStyle = (Math.floor(x / 2.4) % 2 ? "rgba(255,252,244," : "rgba(80,62,40,") + (0.03 + R() * 0.05) + ")";
      g.fillRect(x, 0, 1, sh);
    }
    for (let i = 0; i < (sw * sh) / 900; i++) {
      g.fillStyle = `rgba(90,70,45,${0.04 + R() * 0.07})`;
      g.fillRect(R() * sw, R() * sh, 4 + R() * 14, 1);
    }
    const v = g.createRadialGradient(sw / 2, sh / 2, Math.min(sw, sh) * 0.25, sw / 2, sh / 2, Math.max(sw, sh) * 0.7);
    v.addColorStop(0, "rgba(60,45,25,0)");
    v.addColorStop(1, "rgba(60,45,25,.22)");
    g.fillStyle = v;
    g.fillRect(0, 0, sw, sh);
    this.fabric = c;
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  /** Gota cayendo (forma de lágrima, estirada según `stretch`). */
  private drop(x: number, y: number, r: number, stretch: number, L: Liquid) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x, y - r * 2.3 * stretch);
    c.bezierCurveTo(x + r * 0.25, y - r * 1.3 * stretch, x + r, y - r * 0.7, x + r, y);
    c.arc(x, y, r, 0, Math.PI);
    c.bezierCurveTo(x - r, y - r * 0.7, x - r * 0.25, y - r * 1.3 * stretch, x, y - r * 2.3 * stretch);
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.3, r * 0.1, x, y, r * 1.6);
    g.addColorStop(0, shade(L.rgb, 0.45));
    g.addColorStop(0.55, shade(L.rgb, 0));
    g.addColorStop(1, shade(L.rgb, -0.55));
    c.fillStyle = g;
    c.fill();
    c.beginPath();
    c.ellipse(x - r * 0.35, y - r * 0.25, r * 0.22, r * 0.14, -0.6, 0, 7);
    c.fillStyle = "rgba(255,255,255,.85)";
    c.fill();
  }

  /** Bolita de líquido sobre la tela tratada: sombra, cuerpo y brillo. */
  private bead(x: number, y: number, r: number, L: Liquid, a = 1) {
    const c = this.ctx;
    c.save();
    c.globalAlpha = a;
    let g = c.createRadialGradient(x + r * 0.2, y + r * 0.55, 0, x + r * 0.2, y + r * 0.55, r * 1.2);
    g.addColorStop(0, "rgba(40,25,10,.32)");
    g.addColorStop(1, "rgba(40,25,10,0)");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x + r * 0.2, y + r * 0.55, r * 1.2, r * 0.55, 0, 0, 7);
    c.fill();
    g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r * 1.05);
    g.addColorStop(0, shade(L.rgb, 0.5));
    g.addColorStop(0.5, shade(L.rgb, 0));
    g.addColorStop(1, shade(L.rgb, -0.6));
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(x, y, r, r * 0.9, 0, 0, 7);
    c.fill();
    c.beginPath();
    c.ellipse(x - r * 0.36, y - r * 0.38, r * 0.28, r * 0.16, -0.55, 0, 7);
    c.fillStyle = "rgba(255,255,255,.9)";
    c.fill();
    c.restore();
  }

  private towel(xr: number, cy: number, tw: number, th: number) {
    const c = this.ctx;
    c.save();
    c.translate(xr - tw / 2, cy);
    c.rotate(-0.06);
    c.shadowColor = "rgba(15,59,44,.25)";
    c.shadowBlur = 24;
    c.shadowOffsetY = 12;
    this.roundRect(-tw / 2, -th / 2, tw, th, 14);
    c.fillStyle = "#E4F3EA";
    c.fill();
    c.shadowColor = "transparent";
    const g = c.createLinearGradient(0, -th / 2, 0, th / 2);
    g.addColorStop(0, "rgba(255,255,255,.55)");
    g.addColorStop(1, "rgba(31,122,82,.18)");
    c.fillStyle = g;
    c.fill();
    c.save();
    c.clip();
    c.strokeStyle = "rgba(31,122,82,.18)";
    c.lineWidth = 1;
    for (let y = -th / 2 + 5; y < th / 2; y += 4) {
      c.beginPath();
      c.moveTo(-tw / 2, y);
      c.lineTo(tw / 2, y + 2);
      c.stroke();
    }
    c.fillStyle = "rgba(31,122,82,.35)";
    c.fillRect(-tw / 2, th * 0.28, tw, 3);
    c.restore();
    c.restore();
  }

  private sparkle(x: number, y: number, s: number, a: number) {
    const c = this.ctx;
    c.save();
    c.globalAlpha = a;
    c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.moveTo(x, y - s);
    c.quadraticCurveTo(x, y, x + s, y);
    c.quadraticCurveTo(x, y, x, y + s);
    c.quadraticCurveTo(x, y, x - s, y);
    c.quadraticCurveTo(x, y, x, y - s);
    c.fill();
    c.restore();
  }

  /** Posiciones de las bolitas en que se separa una gota al chocar (sp = 0…1 de la separación). */
  private beads(cx: number, cy: number, sp: number, d: (typeof DROPS)[number]) {
    const { maxR, dropR } = this.s;
    const P = rng(d.seed * 7 + 1);
    const n = 7;
    const r0 = dropR * d.liquid.size;
    const out: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / (n - 1)) * Math.PI * 2 + P() * 0.6;
      const dist = (i === 0 ? 0 : 0.5 + P() * 0.5) * maxR * 0.75 * d.liquid.size;
      const r2 = r0 * (i === 0 ? 0.95 : 0.32 + P() * 0.42);
      out.push({ x: cx + Math.cos(ang) * dist * easeBack(sp), y: cy + Math.sin(ang) * dist * 0.7 * easeBack(sp), r: lerp(r0 * 1.45, r2, easeOut(sp)) });
    }
    return out;
  }

  draw(t: number) {
    if (!this.W || !this.fabric) return;
    const c = this.ctx;
    const { sw, sh, sx, sy, maxR, dropR, rad } = this.s;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.W, this.H);

    // tela con sombra
    c.save();
    c.shadowColor = "rgba(15,59,44,.22)";
    c.shadowBlur = 50;
    c.shadowOffsetY = 24;
    this.roundRect(sx, sy, sw, sh, rad);
    c.fillStyle = "#CFC3AA";
    c.fill();
    c.restore();

    c.save();
    this.roundRect(sx, sy, sw, sh, rad);
    c.clip();
    c.drawImage(this.fabric, sx, sy, sw, sh);

    // la parte ya rociada brilla un momento y luego la capa deja de verse
    const q = sprayPoint(t);
    const sheen = 0.16 * clamp((t - DEMO.sprayFrom) / 0.02) * (1 - clamp((t - DEMO.sprayTo) / 0.1));
    if (sheen > 0) {
      const edge = sx + q.fx * sw;
      const g = c.createLinearGradient(sx, 0, edge + maxR, 0);
      g.addColorStop(0, `rgba(207,235,220,${sheen})`);
      g.addColorStop(Math.max(0, 1 - (maxR * 1.5) / Math.max(1, edge + maxR - sx)), `rgba(207,235,220,${sheen})`);
      g.addColorStop(1, "rgba(207,235,220,0)");
      c.fillStyle = g;
      c.fillRect(sx, sy, edge + maxR - sx, sh);
    }
    // zona húmeda donde cae la niebla
    if (t > DEMO.sprayFrom - 0.01 && t < DEMO.sprayEnd) {
      const x = sx + q.fx * sw;
      const y = sy + q.fy * sh;
      const g = c.createRadialGradient(x, y, 0, x, y, maxR * 1.3);
      g.addColorStop(0, "rgba(120,190,150,.28)");
      g.addColorStop(1, "rgba(120,190,150,0)");
      c.fillStyle = g;
      c.fillRect(x - maxR * 1.4, y - maxR * 1.4, maxR * 2.8, maxR * 2.8);
    }

    // etiquetas de la tela
    const fs = sw < 520 ? 9.5 : 11;
    c.font = `500 ${fs}px ${this.monoFont}`;
    c.fillStyle = "rgba(55,42,26,.75)";
    c.textAlign = "left";
    c.fillText(this.labels.fabric, sx + 16, sy + 24);
    const treated = t >= DEMO.sprayTo;
    c.textAlign = "right";
    c.fillStyle = treated ? "#1F7A52" : "rgba(55,42,26,.75)";
    c.fillText(treated ? this.labels.treated : this.labels.untreated, sx + sw - 16, sy + 24);
    c.textAlign = "left";

    // paño: su borde delantero va de fuera a fuera de la tela
    const tw = Math.max(70, sw * 0.2);
    const towelP = clamp((t - TOWEL.from) / (TOWEL.to - TOWEL.from));
    const lead = t < TOWEL.from ? -Infinity : t > TOWEL.to ? Infinity : lerp(sx - 8, sx + sw + tw + 8, easeInOut(towelP));

    // gotas que ya han chocado: bolitas encima de la tela, hasta que pasa el paño
    const falling: { x: number; y: number; r: number; stretch: number; L: Liquid }[] = [];
    for (const d of DROPS) {
      const cx = sx + d.fx * sw;
      const cy = sy + d.fy * sh;
      const fallP = clamp((t - d.at) / FALL);
      const splatP = clamp((t - d.at - FALL) / SPLAT);
      if (fallP <= 0) continue;
      if (splatP <= 0) {
        falling.push({ x: cx, y: lerp(Math.min(-dropR * 3, sy - sh * 0.9), cy, easeIn(fallP)), r: dropR * d.liquid.size, stretch: 1 + 0.45 * fallP, L: d.liquid });
        continue;
      }
      for (const b of this.beads(cx, cy, splatP, d)) {
        if (lead > b.x - b.r * 0.3) continue; // el paño ya ha pasado por aquí
        this.bead(b.x, b.y, b.r, d.liquid);
      }
    }
    if (Number.isFinite(lead)) this.towel(lead, sy + sh * 0.52, tw, sh * 0.62);

    const shine = clamp((t - SHINE.from) / 0.04) * (1 - clamp((t - (SHINE.to - 0.04)) / 0.04));
    if (shine > 0) {
      this.sparkle(sx + sw * 0.28, sy + sh * 0.4, 9, shine);
      this.sparkle(sx + sw * 0.62, sy + sh * 0.66, 7, shine * 0.8);
      this.sparkle(sx + sw * 0.8, sy + sh * 0.34, 6, shine * 0.7);
    }
    c.restore();

    // las gotas en el aire se dibujan fuera del recorte de la tela
    for (const f of falling) this.drop(f.x, f.y, f.r, f.stretch, f.L);
  }
}
