import * as THREE from "three";
import { CAMERA, unproject } from "@/lib/lost/shards";
import { addLights, backdropMesh, buildBackdrop, buildEnv, glassMaterial, slabGeometry, type GlassProfile, type Make2D } from "./glass-kit";
import type { Placement } from "./protocol";

/**
 * El cristal entero de la marca, vivo: flota, gira muy despacio y se inclina hacia
 * el puntero. Sin DOM: corre en el worker sobre un OffscreenCanvas. Mismo material,
 * entorno, luces y cámara que el 404 (todo de shards.ts vía glass-kit).
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
  // Lo que R3F pone por defecto en el 404: mismo aspecto.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
  const backdrop = o.profile === "full" ? buildBackdrop(o.make2d) : null;
  if (backdrop) scene.add(backdropMesh(backdrop));
  addLights(scene);
  await step();
  const geo = slabGeometry();
  const mat = glassMaterial(env, o.profile);
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

  // El enlazado del shader ocurre aquí, en el hilo del worker. El hilo principal no lo ve.
  renderer.compile(scene, camera);

  let base = unproject(P.left, P.top, P.z, aspect);

  return {
    frame(dt, input, paused) {
      if (!paused) {
        t += dt;
        const k = 1 - Math.exp(-dt * 4);
        inp.x += (input.x - inp.x) * k;
        inp.y += (input.y - inp.y) * k;
      }
      // Entrada estilo keynote: llega 18° girado y se asienta en 1,6 s.
      const intro = smooth(clamp01(t / 1.6));
      const float = Math.sin(t * 0.6) * 0.06 * intro;
      group.position.set(base.x + inp.x * 0.12 * intro, base.y + float - inp.y * 0.08 * intro, P.z);
      ex.set(inp.y * TILT * intro, inp.x * TILT * intro + (1 - intro) * 18 * DEG, 0, "XYZ");
      qa.setFromEuler(ex);
      ex.set(Math.sin(t * 0.35) * 0.05, t * 0.08, Math.cos(t * 0.3) * 0.03, "XYZ");
      qb.setFromEuler(ex);
      group.quaternion.copy(qa).multiply(restQ).multiply(qb);
      group.scale.setScalar(P.scale * (0.94 + 0.06 * intro));
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
    },
  };
}
