import { clamp, easeOut, lerp } from "./math";

/**
 * Efectos atados al scroll que no son el bote ni la demo:
 *
 * - Cabecera: transparente sobre la portada, sólida (con desenfoque en escritorio) a partir de 80 px.
 * - Portada: el titular se aleja (escala y se desvanece) al bajar, como la portada del iPhone.
 * - Banda tras la demo: un marco redondeado en el centro que se abre a pantalla completa (clip-path).
 * - Pasos del piloto: lista fija; la línea en foco se rellena y las demás quedan en contorno.
 *
 * Todo escribe solo transform, opacity, clip-path o color directamente en cada elemento.
 */
export class ScrollEffects {
  private nav = document.querySelector<HTMLElement>(".nav");
  private heroType = document.querySelector<HTMLElement>(".hero-type");
  private band = document.querySelector<HTMLElement>(".xp");
  private bandFrame = document.querySelector<HTMLElement>(".xp-frame");
  private bandContent = document.querySelector<HTMLElement>(".xp-content");
  private bandTitle = document.querySelector<HTMLElement>(".xp .fold");
  private steps = document.querySelector<HTMLElement>(".steps");
  private stepsList = document.querySelector<HTMLElement>(".steps-list");
  private stepRows = [...document.querySelectorAll<HTMLElement>(".step")];

  private vh = 1;
  private mobile = false;
  private bandTop = 0;
  private bandScroll = 1;
  private stepsTop = 0;
  private stepsScroll = 1;
  private rowH = 1;
  private lastY = -1;

  constructor(private reduce: boolean) {
    if (!reduce) {
      document.documentElement.classList.add("fx-on");
      this.bandTitle?.removeAttribute("data-reveal"); // en la banda, el titular lo dispara la apertura
    }
  }

  layout(vh: number, mobile: boolean) {
    this.vh = vh;
    this.mobile = mobile;
    const top = (el: HTMLElement) => el.getBoundingClientRect().top + scrollY;
    if (this.band) {
      this.bandTop = top(this.band);
      this.bandScroll = Math.max(1, this.band.offsetHeight - vh);
    }
    if (this.steps) {
      const slot = this.steps.querySelector<HTMLElement>(".slot");
      this.stepsTop = top(this.steps) + (slot?.offsetHeight ?? 0);
      this.stepsScroll = Math.max(1, this.steps.offsetHeight - (slot?.offsetHeight ?? 0) - vh);
      this.rowH = this.stepRows[0]?.offsetHeight || 1;
    }
    this.lastY = -1;
  }

  update(y: number) {
    if (y === this.lastY) return;
    this.lastY = y;
    this.nav?.classList.toggle("is-solid", y > 80);
    if (this.reduce) return;

    // portada: el titular se aleja
    if (this.heroType) {
      const p = clamp((y - this.vh * 0.08) / (this.vh * 0.6));
      this.heroType.style.transform = p ? `translate3d(0, ${(-p * 6).toFixed(2)}vh, 0) scale(${(1 - 0.08 * p).toFixed(4)})` : "";
      this.heroType.style.opacity = p ? String(1 - p) : "";
    }

    // banda: el marco se abre durante el primer 75 % de su recorrido
    if (this.band && this.bandFrame) {
      const v = easeOut(clamp((y - this.bandTop) / (this.bandScroll * 0.75)));
      const ix = (1 - v) * (this.mobile ? 8 : 29);
      const iy = (1 - v) * (this.mobile ? 24 : 21);
      this.bandFrame.style.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% round ${lerp(this.mobile ? 20 : 28, 0, v).toFixed(1)}px)`;
      if (this.bandContent) {
        const o = clamp((v - 0.5) / 0.35);
        this.bandContent.style.opacity = String(o);
        this.bandContent.style.transform = `translate3d(0, ${((1 - o) * 24).toFixed(1)}px, 0)`;
        if (o > 0.4) this.bandTitle?.setAttribute("data-visible", "");
      }
    }

    // pasos: la lista sube de línea en línea
    if (this.steps && this.stepsList && this.stepRows.length) {
      const n = this.stepRows.length;
      const p = clamp((y - this.stepsTop) / this.stepsScroll) * (n - 1);
      this.stepsList.style.transform = `translate3d(0, ${(-(p + 0.5) * this.rowH).toFixed(1)}px, 0)`;
      this.stepRows.forEach((row, i) => {
        const d = Math.abs(i - p);
        const fill = Math.max(0, 1 - d);
        const scale = Math.max(0.8, 1 - d * 0.1);
        row.style.opacity = String(Math.max(0.24, 1 - d * 0.68));
        row.style.transform = `translate3d(${(Math.min(d, 3) * 0.35).toFixed(3)}em, 0, 0) scale(${scale.toFixed(4)})`;
        row.style.setProperty("--fill", fill.toFixed(3));
      });
    }
  }
}
