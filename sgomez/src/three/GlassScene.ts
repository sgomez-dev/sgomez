import * as THREE from "three";
import { CAMERA, GLASS_LIVE, unproject } from "@/lib/lost/shards";
import { addLights, backdropMesh, buildBackdrop, buildEnv, glassMaterial, slabGeometry, type GlassProfile, type Make2D } from "./glass-kit";
import type { Placement } from "./protocol";

/**
 * El cristal entero de la marca, vivo: flota, gira muy despacio y se inclina hacia
 * el puntero. Sin DOM: corre en el worker sobre un OffscreenCanvas. Mismo material,
 * entorno, luces y cámara que el 404 (todo de shards.ts vía glass-kit), pero más claro y
 * con el color del póster (`GLASS_LIVE`) para que el relevo no se note.
 */
export type GlassSceneHandle = {
  frame(dt: number, input: { x: number; y: number }, paused: boolean): void;
  resize(w: number, h: number, dpr: number): void;
  dispose(): void;
};

const DEG = Math.PI / 180;
const TILT = 9 * DEG;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export async function createGlassScene(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  o: { width: number; height: number; dpr: number; profile: GlassProfile; placement: Placement; make2d: Make2D },
  step: () => Promise<void> = () => new Promise((r) => setTimeout(r, 0)),
): Promise<GlassSceneHandle> {
  const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
  // El ACES del 404 con más exposición: con 1 el cristal salía más oscuro que el póster.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = GLASS_LIVE.exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(o.dpr, 1.25));
  renderer.setSize(o.width, o.height, false);

  const camera = new THREE.PerspectiveCamera(CAMERA.fov, o.width / Math.max(1, o.height), 0.1, 60);
  camera.position.set(...CAMERA.position);
  const scene = new THREE.Scene();

  await step();
  const env = buildEnv(renderer);
  await step();
  const backdrop = o.profile === "full" ? buildBackdrop(o.make2d, GLASS_LIVE.backdrop) : null;
  if (backdrop) scene.add(backdropMesh(backdrop));
  addLights(scene);
  await step();
  const geo = slabGeometry();
  const mat = glassMaterial(env, o.profile, undefined, GLASS_LIVE.material);
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geo, mat));
  scene.add(group);

  const P = o.placement;
  const restQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(P.rest.rx, P.rest.ry, P.rest.rz, "XYZ"));
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const ex = new THREE.Euler();
  const inp = { x: 0, y: 0 };
  let t = 0;
  let aspect = o.width / Math.max(1, o.height);

  // El enlazado del shader ocurre en el worker y, con KHR_parallel_shader_compile, sin bloquear la GPU compartida (huecos de rAF de 33 a 117 ms medidos).
  await renderer.compileAsync(scene, camera);

  let base = unproject(P.left, P.top, P.z, aspect);

  return {
    frame(dt, input, paused) {
      if (!paused) {
        t += dt;
        const k = 1 - Math.exp(-dt * 4);
        inp.x += (input.x - inp.x) * k;
        inp.y += (input.y - inp.y) * k;
      }
      // El fotograma de t=0 coincide con el póster (sin giro extra y a escala 1); el movimiento entra en 1,6 s.
      const intro = smooth(clamp01(t / 1.6));
      const float = Math.sin(t * 0.6) * 0.06 * intro;
      group.position.set(base.x + inp.x * 0.12 * intro, base.y + float - inp.y * 0.08 * intro, P.z);
      ex.set(inp.y * TILT * intro, inp.x * TILT * intro, 0, "XYZ");
      qa.setFromEuler(ex);
      // Giro acotado: sin límite la losa se ponía de canto cada unos 39 s.
      ex.set(Math.sin(t * 0.35) * 0.05 * intro, Math.sin(t * 0.1) * 0.2 * intro, (Math.cos(t * 0.3) - 1) * 0.03 * intro, "XYZ");
      qb.setFromEuler(ex);
      group.quaternion.copy(qa).multiply(restQ).multiply(qb);
      group.scale.setScalar(P.scale);
      renderer.render(scene, camera);
    },
    resize(w, h, dpr) {
      aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(dpr, 1.25));
      renderer.setSize(w, h, false);
      base = unproject(P.left, P.top, P.z, aspect);
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      env.dispose();
      backdrop?.map?.dispose();
      backdrop?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
