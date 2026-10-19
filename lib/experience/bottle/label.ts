import { etiquetaBote } from "@/content/textos";

export type LabelFonts = { display: string; body: string; mono: string };

/** Pinta la etiqueta verde del bote en un canvas (se usa como textura del cilindro). */
export function drawLabel(c: HTMLCanvasElement, fonts: LabelFonts) {
  const g = c.getContext("2d")!;
  const W = c.width;
  const H = c.height;
  const cx = W / 2;
  const hasStretch = "fontStretch" in g;

  type TextOpts = { size: number; color: string; family?: string; weight?: number; track?: number; stretch?: CanvasFontStretch; maxW?: number };
  function text(s: string, x: number, y: number, o: TextOpts) {
    g.save();
    g.fillStyle = o.color;
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${o.track ?? 0}px`;
    let sx = 1;
    g.font = `${o.weight ?? 400} ${o.size}px ${o.family ?? fonts.display}`;
    if (o.stretch) {
      if (hasStretch) g.fontStretch = o.stretch;
      else sx = 0.66; // navegadores sin fontStretch en canvas: se estrecha a mano
    }
    const w = g.measureText(s).width * sx;
    if (o.maxW && w > o.maxW) sx *= o.maxW / w;
    g.translate(x, y);
    g.scale(sx, 1);
    g.fillText(s, 0, 0);
    g.restore();
  }

  g.fillStyle = "#123F2F";
  g.fillRect(0, 0, W, H);
  const sh = g.createLinearGradient(0, 0, 0, H);
  sh.addColorStop(0, "rgba(255,255,255,.04)");
  sh.addColorStop(1, "rgba(0,0,0,.08)");
  g.fillStyle = sh;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#CFEBDC";
  g.fillRect(0, 26, W, 8);
  g.fillRect(0, H - 34, W, 8);

  const L = etiquetaBote;
  text(L.arriba, cx, 104, { size: 34, family: fonts.mono, weight: 500, color: "#9FD8B8", track: 9 });
  text(L.nombre, cx, 392, { size: 330, weight: 850, stretch: "extra-condensed", color: "#FFFFFF", maxW: W * 0.62 });
  g.fillStyle = "#9FD8B8";
  g.fillRect(cx - 230, 440, 460, 4);
  text(L.lema, cx, 520, { size: 40, weight: 600, family: fonts.body, color: "#E8F4EC", track: 3 });
  text(L.usos, cx, 598, { size: 36, family: fonts.body, color: "#BFDCCB" });

  // icono de gota
  g.save();
  g.translate(cx, 735);
  g.fillStyle = "#9FD8B8";
  g.beginPath();
  g.moveTo(0, -62);
  g.bezierCurveTo(10, -34, 40, -14, 40, 12);
  g.arc(0, 12, 40, 0, Math.PI);
  g.bezierCurveTo(-40, -14, -10, -34, 0, -62);
  g.fill();
  g.fillStyle = "#123F2F";
  g.beginPath();
  g.ellipse(-12, 4, 8, 13, -0.5, 0, 7);
  g.fill();
  g.restore();

  text(L.tecnologia, cx, 880, { size: 32, family: fonts.mono, weight: 500, color: "#9FD8B8", track: 8 });
  text(L.formato, cx + 470, 960, { size: 30, family: fonts.mono, color: "#9FD8B8" });
  text(L.origen, cx - 470, 960, { size: 30, family: fonts.mono, color: "#9FD8B8" });
}
