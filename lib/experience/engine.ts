import type Lenis from "lenis";
import { demo as demoText } from "@/content/textos";
import type { Bottle } from "./bottle/scene";
import { clamp } from "./math";
import { buildSegments, DEMO, poseAt, type Pose, type Segment } from "./poses";
import { ScrollEffects } from "./scroll-effects";
import { phaseAt, StainDemo } from "./stain-demo";

const MOBILE_MAX = 760;
/** La foto del bote (public/img) incluye un margen: mide 1,07 veces la altura del bote. */
const IMG_SCALE = 1.07;

/** Pose fija para generar la imagen del bote (?poster): centrado, recto, ocupando el 90 % del alto. */
const POSTER_POSE: Pose = { x: 0.5, y: 0.5, s: 0.9, rx: 0.04, ry: -0.42, rz: 0, o: 1 };

/**
 * Arranca la experiencia de scroll sobre el HTML ya pintado por el servidor y devuelve la función
 * que la desmonta. Todo lo que hay aquí es decoración: si algo falla, la página sigue leyéndose.
 */
export function startExperience(): () => void {
  const $ = <T extends Element>(s: string) => document.querySelector<T>(s);
  const $$ = <T extends Element>(s: string) => [...document.querySelectorAll<T>(s)];
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const posterMode = params.has("poster");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches && !posterMode;

  const canvas = $<HTMLCanvasElement>("#bottle")!;
  const img = $<HTMLImageElement>("#bottle-img")!;
  const specsEl = $<HTMLElement>("#specs")!;
  const demoEl = $<HTMLElement>("#demo")!;
  const wrap = $<HTMLElement>(".canvas-wrap")!;
  const calls = $$<HTMLElement>(".call");
  const phases = $$<HTMLElement>(".ph");
  const captions = $$<HTMLElement>(".cap");
  const bar = $<HTMLElement>(".bar i");
  const sections = $$<HTMLElement>("[data-pose]");

  const stain = new StainDemo($<HTMLCanvasElement>("#stain")!, wrap, {
    fabric: demoText.telaEtiqueta,
    untreated: demoText.telaSinTratar,
    treated: demoText.telaTratada,
  });

  const effects = new ScrollEffects(reduce || posterMode);

  let VW = innerWidth;
  let VH = innerHeight;
  let mobile = VW <= MOBILE_MAX;
  let segments: Segment[] = [];
  let specsRange: [number, number] = [0, 1];
  let demoRange: [number, number] = [0, 1];

  let bottle: Bottle | null = null;
  let mode: "loading" | "3d" | "image" = reduce ? "image" : "loading";
  let lenis: Lenis | null = null;
  let disposed = false;

  function layout() {
    VW = innerWidth;
    VH = innerHeight;
    mobile = VW <= MOBILE_MAX;
    root.classList.toggle("is-mobile", mobile);
    stain.layout(mobile);
    const top = (el: HTMLElement) => el.getBoundingClientRect().top + scrollY;
    const built = buildSegments({
      vh: VH,
      mobile,
      specs: { top: top(specsEl), height: specsEl.offsetHeight },
      demo: { top: top(demoEl), height: demoEl.offsetHeight },
      sections: sections.map((el) => ({ pose: el.dataset.pose!, top: top(el), height: el.offsetHeight })),
      sprayTarget: (t) => stain.targetFrac(t, VW, VH),
    });
    segments = built.segments;
    specsRange = built.specs;
    demoRange = built.demo;
    bottle?.resize(VW, VH, mobile);
    effects.layout(VH, mobile);
    lastT = -1;
    lastPose = null;
  }

  /** Con movimiento reducido el bote no viaja: se queda en la portada y se desvanece al bajar. */
  function currentPose(y: number, now: number): Pose {
    if (posterMode) return POSTER_POSE;
    const p = { ...poseAt(segments, y) };
    if (reduce) {
      const hero = poseAt(segments, 0);
      return { ...hero, o: 1 - clamp(y / (VH * 0.8)) };
    }
    if (!mobile) {
      // flota un poco, como si estuviera en el aire
      const k = now / 1000;
      p.y += Math.sin(k * 1.1) * 0.006;
      p.ry += Math.sin(k * 0.6) * 0.05;
    }
    return p;
  }

  /** Modo imagen: la foto del bote sigue la pose con transformaciones CSS (sin el giro sobre su eje). */
  function placeImage(p: Pose) {
    img.style.setProperty("--bx", `${p.x * VW}px`);
    img.style.setProperty("--by", `${p.y * VH}px`);
    img.style.setProperty("--bh", `${p.s * VH * IMG_SCALE}px`);
    img.style.setProperty("--brz", `${-p.rz}rad`);
    img.style.opacity = String(p.o);
  }

  let lastT = -1;
  let lastPhase = -1;
  let lastCall = -2;
  let lastPose: Pose | null = null;
  let mistAlive = false;
  let prevNow = performance.now();
  let raf = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prevNow) / 1000);
    prevNow = now;
    lenis?.raf(now);
    const y = scrollY;
    effects.update(y);

    // especificaciones: aparecen una a una (en móvil solo se ve la actual)
    const u = clamp((y - specsRange[0]) / Math.max(1, specsRange[1] - specsRange[0]));
    const ci = y < specsRange[0] - VH * 0.2 ? -1 : Math.min(3, Math.floor(u * 4.6 - 0.3));
    if (ci !== lastCall) {
      calls.forEach((c, i) => {
        c.classList.toggle("on", i <= ci);
        c.classList.toggle("cur", i === ci);
      });
      lastCall = ci;
    }

    // demo
    const t = clamp((y - demoRange[0]) / Math.max(1, demoRange[1] - demoRange[0]));
    if (Math.abs(t - lastT) > 1e-4) {
      stain.draw(t);
      lastT = t;
      bar?.style.setProperty("--p", String(t));
    }
    const ph = phaseAt(t);
    if (ph !== lastPhase) {
      phases.forEach((e, i) => e.classList.toggle("on", i === ph));
      captions.forEach((e, i) => e.classList.toggle("on", i === ph));
      lastPhase = ph;
    }

    // bote
    const p = currentPose(y, now);
    if (mode === "image") {
      placeImage(p);
      return;
    }
    if (mode !== "3d" || !bottle) {
      placeImage(p);
      return;
    }
    const pinned = y >= demoRange[0] && y <= demoRange[1];
    const spraying = pinned && t > DEMO.sprayFrom && t < DEMO.sprayTo + 0.03;
    const moved = !lastPose || (Object.keys(p) as (keyof Pose)[]).some((k) => Math.abs(p[k] - lastPose![k]) > 1e-5);
    if (moved) bottle.setPose(p);
    if (spraying || mistAlive) mistAlive = bottle.step(dt, spraying, spraying ? stain.targetPx(t) : null, stain.s.maxR || 60);
    if (moved || mistAlive || spraying) {
      canvas.style.opacity = String(p.o);
      if (p.o > 0.001) bottle.render();
      lastPose = p;
    }
  }

  /** ¿Hay WebGL utilizable? Sin él (o si el navegador avisa de que irá lento) ni se descarga Three.js. */
  function canUseWebGL(allowSlow: boolean) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2", { failIfMajorPerformanceCaveat: !allowSlow }) ?? c.getContext("webgl", { failIfMajorPerformanceCaveat: !allowSlow });
      (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
      return !!gl;
    } catch {
      return false;
    }
  }

  async function load3D() {
    const allowSlow = params.get("3d") === "force" || posterMode;
    if (!canUseWebGL(allowSlow)) {
      mode = "image";
      return;
    }
    try {
      const { createBottle } = await import("./bottle/scene");
      if (disposed) return;
      const css = getComputedStyle(root);
      const fonts = {
        display: css.getPropertyValue("--f-display").trim(),
        body: css.getPropertyValue("--f-body").trim(),
        mono: css.getPropertyValue("--f-mono").trim(),
      };
      bottle = createBottle(canvas, fonts, { allowSlow, noShadow: posterMode });
      bottle.resize(VW, VH, mobile);
      bottle.setPose(currentPose(scrollY, performance.now()));
      bottle.render();
      mode = "3d";
      root.classList.add("bottle-3d");
      // la etiqueta usa las tipografías de la web: se repinta cuando han cargado
      document.fonts?.ready.then(() => {
        bottle?.relabel();
        lastPose = null;
      });
    } catch (err) {
      console.info("INTACTA: bote 3D desactivado, se usa la imagen.", err);
      mode = "image";
    }
  }

  // Scroll suave solo con ratón o trackpad (en táctil, el nativo) y sin movimiento reducido.
  async function loadLenis() {
    if (reduce || posterMode || !matchMedia("(pointer: fine)").matches) return;
    const { default: LenisCtor } = await import("lenis");
    if (disposed) return;
    lenis = new LenisCtor({ autoRaf: false, anchors: true, lerp: 0.12 });
  }

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  };
  const ro = new ResizeObserver(() => {
    stain.layout(mobile);
    lastT = -1;
  });

  layout();
  if (posterMode) root.classList.add("poster");
  addEventListener("resize", onResize);
  ro.observe(wrap);
  document.fonts?.ready.then(() => {
    if (!disposed) layout();
  });
  raf = requestAnimationFrame(frame);
  if (!reduce) {
    // el 3D se carga cuando el navegador queda libre, para no retrasar la primera pintura
    const idle: (f: () => void, o?: { timeout: number }) => unknown =
      window.requestIdleCallback?.bind(window) ?? ((f) => window.setTimeout(f, 200));
    idle(() => void load3D(), { timeout: 1500 });
  }
  void loadLenis();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    removeEventListener("resize", onResize);
    ro.disconnect();
    lenis?.destroy();
    bottle?.dispose();
    root.classList.remove("bottle-3d", "is-mobile", "poster");
  };
}
