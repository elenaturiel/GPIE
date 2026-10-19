import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Points,
  Scene,
  ShaderMaterial,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Pose } from "../poses";
import { drawLabel, type LabelFonts } from "./label";

/** Alto del bote en unidades de la escena (base → boquilla). */
const BOT_H = 2.57;
const FOV = 22;
const MIST_MAX = 900;

export type Bottle = {
  resize(vw: number, vh: number, mobile: boolean): void;
  setPose(p: Pose): void;
  /** Avanza el gatillo y la niebla. Devuelve true si queda niebla en el aire (hay que seguir pintando). */
  step(dt: number, spraying: boolean, target: { x: number; y: number } | null, spread: number): boolean;
  render(): void;
  relabel(): void;
  dispose(): void;
};

/**
 * Crea el bote 3D sobre `canvas`. Lanza un error si no hay WebGL o si el navegador avisa de que
 * iría muy lento (render por software): en ese caso se usa la imagen fija.
 */
export function createBottle(canvas: HTMLCanvasElement, fonts: LabelFonts, opts: { allowSlow?: boolean; noShadow?: boolean } = {}): Bottle {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: !opts.allowSlow,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, 20);

  // Reflejos suaves de estudio para el plástico y el barniz (se calculan una vez).
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();

  // Luces: principal arriba a la derecha, contraluz verde suave y relleno bajo.
  scene.add(new HemisphereLight(0xffffff, 0xbfe3cf, 0.9));
  const key = new DirectionalLight(0xffffff, 1.9);
  key.position.set(5, 7, 9);
  scene.add(key);
  const rim = new DirectionalLight(0xdff5e8, 2.2);
  rim.position.set(-7, 3, -5);
  scene.add(rim);
  const fill = new DirectionalLight(0xffffff, 0.5);
  fill.position.set(-4, -3, 6);
  scene.add(fill);

  const root = new Group();
  root.rotation.order = "ZYX";
  scene.add(root);
  const model = new Group();
  model.position.y = -BOT_H / 2;
  root.add(model);

  // Materiales: plástico blanco con barniz, verdes satinados.
  const white = new MeshPhysicalMaterial({ color: new Color("#F4F5F1"), roughness: 0.38, clearcoat: 0.85, clearcoatRoughness: 0.2, envMapIntensity: 0.55, sheen: 0.15, sheenColor: new Color("#ffffff") });
  const dark = new MeshPhysicalMaterial({ color: new Color("#1A5A42"), roughness: 0.36, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 0.5 });
  const darker = new MeshStandardMaterial({ color: new Color("#0F3B2C"), roughness: 0.5, envMapIntensity: 0.4 });
  const mint = new MeshStandardMaterial({ color: new Color("#9FD8B8"), roughness: 0.42, envMapIntensity: 0.5 });

  // Cuerpo por revolución del perfil.
  const profile = [
    [0, 0], [0.4, 0], [0.47, 0.015], [0.5, 0.07], [0.5, 1.36], [0.485, 1.47], [0.43, 1.57],
    [0.33, 1.66], [0.235, 1.73], [0.215, 1.78], [0.215, 1.93], [0, 1.93],
  ].map(([x, y]) => new Vector2(x, y));
  model.add(new Mesh(new LatheGeometry(profile, 96), white));

  // Etiqueta: textura de canvas sobre un trozo de cilindro un pelo más ancho que el cuerpo.
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1600;
  labelCanvas.height = 1032;
  const labelTex = new CanvasTexture(labelCanvas);
  labelTex.colorSpace = SRGBColorSpace;
  labelTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const LT = Math.PI * 0.86;
  const label = new Mesh(
    new CylinderGeometry(0.503, 0.503, 0.88, 96, 1, true, -LT / 2, LT),
    new MeshPhysicalMaterial({ map: labelTex, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.35, envMapIntensity: 0.35 }),
  );
  label.position.y = 0.89;
  model.add(label);
  const relabel = () => {
    drawLabel(labelCanvas, fonts);
    labelTex.needsUpdate = true;
  };
  relabel();

  // Cuello con rosca.
  const collar = new Mesh(new CylinderGeometry(0.245, 0.25, 0.2, 48), dark);
  collar.position.y = 2.03;
  model.add(collar);
  for (let i = 0; i < 5; i++) {
    const ring = new Mesh(new TorusGeometry(0.25, 0.008, 6, 48), darker);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.95 + i * 0.035;
    model.add(ring);
  }

  // Cabezal pulverizador (construido mirando a +x y girado para que la boquilla mire al lado de la etiqueta).
  const head = new Group();
  head.position.y = 2.13;
  head.rotation.y = -Math.PI / 2;
  model.add(head);
  const hs = new Shape();
  hs.moveTo(-0.21, 0);
  hs.lineTo(-0.23, 0.26);
  hs.quadraticCurveTo(-0.23, 0.4, -0.09, 0.41);
  hs.lineTo(0.3, 0.41);
  hs.quadraticCurveTo(0.4, 0.41, 0.44, 0.37);
  hs.lineTo(0.47, 0.33);
  hs.lineTo(0.47, 0.25);
  hs.lineTo(0.36, 0.22);
  hs.quadraticCurveTo(0.22, 0.2, 0.18, 0.12);
  hs.lineTo(0.14, 0);
  hs.lineTo(-0.21, 0);
  const hg = new ExtrudeGeometry(hs, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 4, curveSegments: 18 });
  hg.translate(0, 0, -0.15);
  head.add(new Mesh(hg, dark));
  const ts = new Shape();
  ts.moveTo(0.13, 0.14);
  ts.lineTo(0.21, 0.14);
  ts.quadraticCurveTo(0.25, -0.05, 0.2, -0.33);
  ts.quadraticCurveTo(0.17, -0.37, 0.14, -0.33);
  ts.quadraticCurveTo(0.17, -0.08, 0.13, 0.14);
  const tg = new ExtrudeGeometry(ts, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3, curveSegments: 14 });
  tg.translate(-0.16, -0.13, -0.07);
  const trigger = new Group();
  trigger.position.set(0.16, 0.13, 0);
  head.add(trigger);
  trigger.add(new Mesh(tg, mint));
  const nozzle = new Mesh(new CylinderGeometry(0.04, 0.045, 0.07, 24), darker);
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.set(0.5, 0.29, 0);
  head.add(nozzle);
  const tip = new Object3D();
  tip.position.set(0.54, 0.29, 0);
  head.add(tip);

  // Sombra de contacto: una mancha difusa bajo la base, que se borra cuando el bote se inclina.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  {
    const g = shadowCanvas.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(15,59,44,0.55)");
    grad.addColorStop(0.45, "rgba(15,59,44,0.22)");
    grad.addColorStop(1, "rgba(15,59,44,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  }
  const shadowTex = new CanvasTexture(shadowCanvas);
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, toneMapped: false });
  const shadow = new Mesh(new PlaneGeometry(1, 1), shadowMat);
  shadow.renderOrder = -1;
  scene.add(shadow);

  // Niebla: puntos con tamaño y opacidad propios, simulados en la CPU.
  const pos = new Float32Array(MIST_MAX * 3);
  const alpha = new Float32Array(MIST_MAX);
  const size = new Float32Array(MIST_MAX);
  const vel = new Float32Array(MIST_MAX * 3);
  const age = new Float32Array(MIST_MAX);
  const life = new Float32Array(MIST_MAX);
  const base = new Float32Array(MIST_MAX);
  const mistGeo = new BufferGeometry();
  mistGeo.setAttribute("position", new BufferAttribute(pos, 3));
  mistGeo.setAttribute("aAlpha", new BufferAttribute(alpha, 1));
  mistGeo.setAttribute("aSize", new BufferAttribute(size, 1));
  const mistMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: { uColor: { value: new Color("#79C79E") }, uK: { value: 1 } },
    vertexShader:
      "attribute float aAlpha;attribute float aSize;varying float vA;uniform float uK;" +
      "void main(){vA=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=aSize*uK/(-mv.z);gl_Position=projectionMatrix*mv;}",
    fragmentShader:
      "uniform vec3 uColor;varying float vA;" +
      "void main(){float d=length(gl_PointCoord-vec2(.5));float a=smoothstep(.5,0.,d)*vA;if(a<.004)discard;" +
      "gl_FragColor=vec4(mix(uColor,vec3(1.),.25),a);\n#include <colorspace_fragment>\n}",
  });
  const mist = new Points(mistGeo, mistMat);
  mist.frustumCulled = false;
  mist.renderOrder = 5;
  scene.add(mist);
  let next = 0;
  let acc = 0;
  let pull = 0;
  let alive = 0;
  const vA = new Vector3();
  const vB = new Vector3();

  let VW = 1;
  let VH = 1;
  let visH = 1;
  let visW = 1;

  function resize(vw: number, vh: number, mobile: boolean) {
    VW = vw;
    VH = vh;
    renderer.setPixelRatio(Math.min(mobile ? 1.5 : 2, window.devicePixelRatio || 1));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    visH = 2 * Math.tan((FOV * Math.PI) / 360) * camera.position.z;
    visW = visH * camera.aspect;
    mistMat.uniforms.uK.value = (vh * renderer.getPixelRatio()) / (2 * Math.tan((FOV * Math.PI) / 360));
  }

  const toWorld = (px: number, py: number, out: Vector3) => out.set((px / VW - 0.5) * visW, (0.5 - py / VH) * visH, 0);

  function setPose(p: Pose) {
    root.position.set((p.x - 0.5) * visW, (0.5 - p.y) * visH, 0);
    const k = (p.s * visH) / BOT_H;
    root.scale.setScalar(k);
    root.rotation.set(p.rx, p.ry, p.rz);
    // sombra: debajo de la base, más tenue cuanto más inclinado
    const upright = Math.max(0, Math.cos(p.rz) * Math.cos(p.rx));
    const w = 1.9 * k;
    shadow.scale.set(w, w * 0.2, 1);
    shadow.position.set(root.position.x + Math.sin(-p.rz) * (BOT_H / 2) * k, root.position.y - (BOT_H / 2) * k * upright - 0.05 * k, -1);
    shadowMat.opacity = Math.pow(upright, 8) * 0.7;
    shadow.visible = !opts.noShadow && shadowMat.opacity > 0.01;
  }

  function spawn(from: Vector3, to: Vector3, spread: number) {
    const i = next;
    next = (next + 1) % MIST_MAX;
    const jx = (Math.random() - 0.5) * spread;
    const jy = (Math.random() - 0.5) * spread * 0.7;
    pos[i * 3] = from.x + (Math.random() - 0.5) * 0.02;
    pos[i * 3 + 1] = from.y + (Math.random() - 0.5) * 0.02;
    pos[i * 3 + 2] = from.z;
    // velocidad inicial para llegar al punto en T segundos con rozamiento k
    const dx = to.x + jx - from.x;
    const dy = to.y + jy - from.y;
    const dz = -from.z;
    const k = 2.2;
    const T = 0.38 + Math.random() * 0.12;
    const f = k / (1 - Math.exp(-k * T));
    vel[i * 3] = dx * f;
    vel[i * 3 + 1] = dy * f;
    vel[i * 3 + 2] = dz * f;
    age[i] = 0;
    life[i] = T + 0.25 + Math.random() * 0.25;
    base[i] = 0.06 + Math.random() * 0.11;
  }

  function step(dt: number, spraying: boolean, target: { x: number; y: number } | null, spread: number) {
    pull = spraying ? (Math.sin((performance.now() / 1000) * 9) + 1) / 2 : Math.max(0, pull - dt * 4);
    trigger.rotation.z = -pull * 0.3;
    if (spraying && target && pull > 0.45) {
      root.updateMatrixWorld();
      tip.getWorldPosition(vA);
      toWorld(target.x, target.y, vB);
      acc += dt * 650;
      const sp = (spread / VH) * visH * 1.4;
      while (acc > 1) {
        acc--;
        spawn(vA, vB, sp);
      }
    }
    alive = 0;
    let changed = false;
    const drag = Math.exp(-2.2 * dt);
    for (let i = 0; i < MIST_MAX; i++) {
      if (life[i] <= 0) {
        if (alpha[i] !== 0) {
          alpha[i] = 0;
          changed = true;
        }
        continue;
      }
      age[i] += dt;
      if (age[i] >= life[i]) {
        life[i] = 0;
        alpha[i] = 0;
        changed = true;
        continue;
      }
      vel[i * 3] *= drag;
      vel[i * 3 + 1] *= drag;
      vel[i * 3 + 2] *= drag;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      const a = age[i] / life[i];
      alpha[i] = Math.sin(Math.PI * Math.min(1, a * 1.15)) * 0.5;
      size[i] = base[i] * (1 + a * 3);
      alive++;
      changed = true;
    }
    if (changed) {
      mistGeo.attributes.position.needsUpdate = true;
      mistGeo.attributes.aAlpha.needsUpdate = true;
      mistGeo.attributes.aSize.needsUpdate = true;
    }
    return alive > 0 || pull > 0;
  }

  function dispose() {
    scene.traverse((o) => {
      const m = o as Mesh;
      m.geometry?.dispose();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    labelTex.dispose();
    shadowTex.dispose();
    envTex.dispose();
    renderer.dispose();
  }

  return { resize, setPose, step, render: () => renderer.render(scene, camera), relabel, dispose };
}
