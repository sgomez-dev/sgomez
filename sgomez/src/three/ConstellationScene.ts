import * as THREE from "three";
import { CAMERA, GLASS, LINES, SHARDS, type Shard } from "@/lib/lost/shards";
import { addLights, backdropMesh, buildBackdrop, buildEnv, glassMaterial, shardGeometry, type GlassProfile, type Make2D } from "./glass-kit";
import type { GlassSceneHandle } from "./GlassScene";
import { PROJECTED_IDS } from "./protocol";

/**
 * Escena 3D viva del 404, sin DOM: corre en el worker del cristal sobre un OffscreenCanvas. Es el RELEVO exacto del último
 * fotograma del vídeo Remotion: mismos fragmentos (contorno extruido con `GLASS`), mismo material (`GLASS_MATERIAL`), mismo
 * entorno (`GLASS_ENV`: cúpula, paneles, luces y fondo de refracción), misma cámara y mismas poses. Todo sale de `shards.ts`;
 * aquí solo se CONSTRUYE con three.js, una vez, y se mueve con transformas. No usa `GLASS_LIVE`, que es solo del hero y el contacto.
 *
 * Encima del reposo se suma: flotación suave, inclinación hacia el puntero y brillo en el fragmento que se señala. Los enlaces
 * `<a>` viven en el hilo principal: `offsets()` les da el desplazamiento de cada fragmento respecto a su reposo, en px.
 */
export type ConstellationState = {
  /** El relevo ya ocurrió: la escena anima. Antes solo pinta su primer fotograma, en reposo. */
  live: boolean;
  /** Id del fragmento señalado (hover o foco de su enlace), o "". */
  highlightId: string;
  /** La escena entra tras el vídeo: sus líneas empiezan ya encendidas. */
  linesOn: boolean;
};

export type ConstellationHandle = GlassSceneHandle & {
  set(s: ConstellationState): void;
  /** Pares `dx, dy` en px, en el orden de `PROJECTED_IDS`. Es el mismo búfer en cada llamada: quien lo manda lo copia. */
  offsets(): Float32Array;
  /** Si hace falta otro fotograma: hay animación, un brillo asentándose o un cambio de estado sin pintar. */
  wants(paused: boolean): boolean;
};

const DEG = Math.PI / 180;
const MAX_TILT = 6 * DEG;
const MAX_FLOAT = 0.08;
const GLOW_COLOR = "#9FB6FF";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

type Rig = {
  id: string;
  shard: Shard;
  group: THREE.Group;
  mat: THREE.MeshPhysicalMaterial;
  q: THREE.Quaternion;
  baseScale: number;
  phase: number;
  speed: number;
  amp: number;
  glow: number;
};

export async function createConstellationScene(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  o: { width: number; height: number; dpr: number; profile: GlassProfile; make2d: Make2D },
  step: () => Promise<void> = () => new Promise((r) => setTimeout(r, 0)),
): Promise<ConstellationHandle> {
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(o.dpr, 1.25));
  renderer.setSize(o.width, o.height, false);

  let width = o.width;
  let height = o.height;
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, width / Math.max(1, height), 0.1, 60);
  camera.position.set(...CAMERA.position);
  const scene = new THREE.Scene();

  // Construcción troceada (PMREM, fondo, geometrías) para no formar una tarea larga en el worker.
  await step();
  const env = buildEnv(renderer);
  await step();
  const backdrop = buildBackdrop(o.make2d);
  const backdropPlane = backdropMesh(backdrop);
  scene.add(backdropPlane);
  addLights(scene);
  await step();
  const geos = SHARDS.map((s) => shardGeometry(s));
  const rigs = SHARDS.map((s, i): Rig => {
    const { pose } = s;
    const group = new THREE.Group();
    group.position.set(pose.x, pose.y, pose.z);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.rx, pose.ry, pose.rz, GLASS.euler));
    group.quaternion.copy(q);
    const baseScale = s.scale * GLASS.radiusPerScale;
    group.scale.setScalar(baseScale);
    const mat = glassMaterial(env, o.profile, GLOW_COLOR);
    group.add(new THREE.Mesh(geos[i]!, mat));
    scene.add(group);
    return {
      id: s.id,
      shard: s,
      group,
      mat,
      q,
      baseScale,
      phase: (i * 2.399963) % (Math.PI * 2),
      speed: 0.55 + ((i * 37) % 11) / 22,
      amp: Math.min(MAX_FLOAT, 0.034 + ((i * 53) % 7) * 0.0076),
      glow: 0,
    };
  });
  const lineMat = new THREE.LineBasicMaterial({ color: "#8FA8FF", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(LINES.length * 6), 3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  lines.renderOrder = -1;
  scene.add(lines);

  // Los shaders se compilan y enlazan antes del primer fotograma. Con KHR_parallel_shader_compile no bloquea la GPU compartida:
  // un `renderer.compile` a secas la congelaba (huecos de rAF de 33 a 117 ms, informe de la Task 4).
  await renderer.compileAsync(scene, camera);

  const out = new Float32Array(PROJECTED_IDS.length * 2);
  const state: ConstellationState = { live: false, highlightId: "", linesOn: false };
  const clock = { t: 0, live: 0 };
  const inp = { x: 0, y: 0 };
  const pos = new Map<string, THREE.Vector3>();
  const v = new THREE.Vector3();
  const b = new THREE.Vector3();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const ex = new THREE.Euler();
  let dirty = true;
  let settling = false;

  return {
    set(s) {
      if (s.live !== state.live || s.highlightId !== state.highlightId || s.linesOn !== state.linesOn) dirty = true;
      Object.assign(state, s);
    },
    offsets: () => out,
    wants: (paused) => dirty || settling || (state.live && !paused),
    frame(dtRaw, input, paused) {
      const dt = Math.min(dtRaw, 0.05);
      camera.updateMatrixWorld();
      if (state.live && !paused) {
        clock.t += dt;
        clock.live += dt;
      }
      // la animación entra suave: en el relevo todo está EXACTAMENTE en reposo
      const ramp = state.live ? smooth(clamp(clock.live / 1.6, 0, 1)) : 0;
      const lineRamp = state.linesOn ? 1 : state.live ? smooth(clamp(clock.live / 0.9, 0, 1)) : 0;
      if (!paused) {
        const k = 1 - Math.exp(-dt * 5);
        inp.x += (input.x - inp.x) * k;
        inp.y += (input.y - inp.y) * k;
      }

      settling = false;
      let n = 0;
      for (const r of rigs) {
        const p = r.shard.pose;
        const fa = r.amp * ramp;
        const fy = Math.sin(clock.t * r.speed + r.phase) * fa;
        const fx = Math.cos(clock.t * r.speed * 0.7 + r.phase * 1.3) * fa * 0.5;
        // paralaje con el puntero: más cerca de la cámara, más se mueve
        const par = 0.06 * (p.z + 1.2) * ramp;
        r.group.position.set(p.x + fx + inp.x * par, p.y + fy - inp.y * par, p.z);

        // giro: inclinación de mundo (hasta 6 grados) por encima de la pose, más un vaivén mínimo
        ex.set(inp.y * MAX_TILT * ramp, inp.x * MAX_TILT * ramp, 0, "XYZ");
        qa.setFromEuler(ex);
        ex.set(
          Math.sin(clock.t * r.speed * 0.8 + r.phase) * 0.035 * ramp,
          Math.cos(clock.t * r.speed * 0.6 + r.phase) * 0.035 * ramp,
          Math.sin(clock.t * r.speed * 0.5 + r.phase * 2) * 0.03 * ramp,
          "XYZ",
        );
        qb.setFromEuler(ex);
        r.group.quaternion.copy(qa).multiply(r.q).multiply(qb);

        // brillo y escala al señalar
        const target = state.highlightId === r.id ? 1 : 0;
        r.glow += (target - r.glow) * (1 - Math.exp(-dt * 9));
        if (Math.abs(target - r.glow) < 0.002) r.glow = target;
        else settling = true;
        r.mat.emissiveIntensity = r.glow * 0.85;
        r.group.scale.setScalar(r.baseScale * (1 + 0.08 * r.glow));

        pos.set(r.id, r.group.position);
        if (r.shard.target !== null) {
          // desplazamiento del enlace: proyección actual menos proyección del reposo
          b.set(p.x, p.y, p.z).project(camera);
          v.copy(r.group.position).project(camera);
          out[2 * n] = ((v.x - b.x) * width) / 2;
          out[2 * n + 1] = (-(v.y - b.y) * height) / 2;
          n++;
        }
      }

      // la constelación: del centro de un fragmento al del otro, con su pose actual
      const arr = lineGeo.attributes.position!.array as Float32Array;
      let m = 0;
      for (const [a, c] of LINES) {
        const pa = pos.get(a);
        const pb = pos.get(c);
        if (!pa || !pb) continue;
        arr.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], m * 6);
        m++;
      }
      lineGeo.setDrawRange(0, m * 2);
      lineGeo.attributes.position!.needsUpdate = true;
      lineMat.opacity = 0.28 * lineRamp;

      dirty = false;
      renderer.render(scene, camera);
    },
    resize(w, h, dpr) {
      width = w;
      height = h;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(dpr, 1.25));
      renderer.setSize(w, h, false);
      dirty = true;
    },
    dispose() {
      env.dispose();
      backdrop.map?.dispose();
      backdrop.dispose();
      backdropPlane.geometry.dispose();
      geos.forEach((g) => g.dispose());
      rigs.forEach((r) => r.mat.dispose());
      lineGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
