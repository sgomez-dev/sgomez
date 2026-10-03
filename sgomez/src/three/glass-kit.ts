import * as THREE from "three";
import { GLASS, GLASS_ENV, GLASS_MATERIAL, mulberry32, slabOutlinePoints, type Shard } from "@/lib/lost/shards";

/**
 * Piezas del cristal para cualquier escena: el 404 (fragmentos) y el hero y el
 * contacto (cristal entero, con la silueta redondeada del póster, F3). SIN DOM:
 * corre igual en el hilo principal y en un worker con OffscreenCanvas. Todo sale
 * de shards.ts.
 */
export type Make2D = (w: number, h: number) => HTMLCanvasElement | OffscreenCanvas;
export type GlassProfile = "full" | "lite";

/**
 * full: el material del 404 tal cual (transmisión, dispersión, iridiscencia, clearcoat).
 * lite: sin transmisión ni dispersión. Three omite USE_TRANSMISSION, el pase de
 * transmisión y la parte más cara del shader; queda iridiscencia, clearcoat y entorno.
 */
export function materialParams(profile: GlassProfile) {
  const { attenuationColor, iridescenceThicknessRange, ...rest } = GLASS_MATERIAL;
  const base = { ...rest, iridescenceThicknessRange: [...iridescenceThicknessRange] as [number, number], attenuationColor };
  return profile === "full" ? base : { ...base, transmission: 0, dispersion: 0, thickness: 0 };
}

export type MaterialOverrides = { attenuationColor?: string; attenuationDistance?: number; envMapIntensity?: number };

/** Un material por pieza (el brillo es por pieza). Con emisión 0 y sin `over` es idéntico al del vídeo. */
export function glassMaterial(env: THREE.Texture, profile: GlassProfile = "full", glow = "#9FB6FF", over: MaterialOverrides = {}): THREE.MeshPhysicalMaterial {
  const { attenuationColor, ...p } = { ...materialParams(profile), ...over };
  const m = new THREE.MeshPhysicalMaterial({ ...p, attenuationColor: new THREE.Color(attenuationColor), emissive: new THREE.Color(glow), emissiveIntensity: 0 });
  if (profile === "lite") {
    m.transparent = true;
    m.opacity = 0.9;
  }
  m.envMap = env;
  return m;
}

/** Puntos del contorno: con 72 el lateral del bisel se veia en facetas; con 160 la silueta redondeada se lee lisa. */
const SLAB_POINTS = 160;

/** El cristal entero: silueta redondeada del póster, mismo grosor y bisel que un fragmento, a escala del cristal. */
export function slabGeometry(): THREE.ExtrudeGeometry {
  const k = GLASS.slabRadius;
  const B = GLASS.bevel;
  const shape = new THREE.Shape(slabOutlinePoints(SLAB_POINTS).map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: GLASS.depth * k,
    bevelEnabled: true,
    bevelThickness: B.thickness * k,
    bevelSize: B.size * k,
    bevelOffset: B.offset * k,
    bevelSegments: B.segments + 2,
    curveSegments: 1,
  });
  g.translate(0, 0, (-GLASS.depth * k) / 2);
  g.computeVertexNormals();
  return g;
}

/** El fondo de refracción solo se pinta en el pase de transmisión. */
export function backdropMesh(mat: THREE.MeshBasicMaterial): THREE.Mesh {
  const P = GLASS_ENV.backdrop.plane;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.position.set(...P.pos);
  mesh.scale.set(P.scale, P.scale, 1);
  mesh.onBeforeRender = (renderer) => {
    const inTransmission = renderer.getRenderTarget() !== null;
    mat.colorWrite = inTransmission;
    mat.depthWrite = inTransmission;
  };
  return mesh;
}

export function addLights(scene: THREE.Object3D): void {
  for (const l of GLASS_ENV.lights) {
    const color = new THREE.Color(l.color);
    const light =
      l.type === "ambient" ? new THREE.AmbientLight(color, l.intensity)
      : l.type === "directional" ? new THREE.DirectionalLight(color, l.intensity)
      : new THREE.PointLight(color, l.intensity, 0, 2);
    if (l.pos) light.position.set(...l.pos);
    scene.add(light);
  }
}

/** Entorno HDR de estudio: lo que el cristal refleja. Igual que `useStudioEnv` del vídeo. */
export function buildEnv(gl: THREE.WebGLRenderer): THREE.Texture {
  const env = new THREE.Scene();
  const { dome, panels } = GLASS_ENV;
  const sphere = new THREE.SphereGeometry(dome.radius, 64, 32);
  const ring = dome.ring.map((c) => new THREE.Color(c));
  const p = sphere.attributes.position!;
  const cols = new Float32Array(p.count * 3);
  const L = dome.lobe;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / dome.radius;
    const y = p.getY(i) / dome.radius;
    const z = p.getZ(i) / dome.radius;
    const t = (Math.atan2(y, x) / (Math.PI * 2) + 0.5) * (ring.length - 1);
    const k = Math.min(ring.length - 2, Math.floor(t));
    const c = ring[k]!.clone().lerp(ring[k + 1]!, t - k);
    c.multiplyScalar(L.base + L.front * Math.pow(Math.max(0, z), L.frontPow) + L.back * Math.pow(Math.max(0, -z), L.backPow));
    cols.set([c.r, c.g, c.b], i * 3);
  }
  sphere.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  env.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  for (const pn of panels) {
    const c = new THREE.Color(pn.color).multiplyScalar(pn.intensity);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(pn.w, pn.h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(...pn.pos);
    m.lookAt(0, 0, 0);
    env.add(m);
  }
  const pm = new THREE.PMREMGenerator(gl);
  const tex = pm.fromScene(env, 0.02).texture;
  pm.dispose();
  // la escena auxiliar ya no hace falta: PMREM guardó su resultado
  env.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
  });
  return tex;
}


export type BackdropSpec = {
  seed: number;
  size: number;
  base: string;
  blobs: readonly { x: number; y: number; r: number; rgb: string; a: number }[];
  beams: readonly { rgb: string; a: number }[];
  count: number;
  plane: { repeat: number };
};

/** Fondo SOLO para la refracción (ver `Scene.tsx` del vídeo): el pase de transmisión refracta lo que hay detrás del cristal. */
export function buildBackdrop(make2d: Make2D, B: BackdropSpec = GLASS_ENV.backdrop): THREE.MeshBasicMaterial {
  const c = make2d(B.size, B.size);
  const g = c.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  g.fillStyle = B.base;
  g.fillRect(0, 0, B.size, B.size);
  // Cada mancha y cada haz se pinta tambien en sus copias envueltas (+-size): el tile se repite con RepeatWrapping y sin esto
  // queda una costura donde el borde corta un degradado. Solo se pintan las copias que tocan el tile, y cada mancha solo
  // en su caja: rellenar el tile entero en cada copia costaba hilo principal en el 404.
  const wraps = [-B.size, 0, B.size];
  const touches = (x: number, y: number, r: number) => x + r > 0 && x - r < B.size && y + r > 0 && y - r < B.size;
  for (const b of B.blobs) {
    for (const dx of wraps) {
      for (const dy of wraps) {
        const x = b.x + dx;
        const y = b.y + dy;
        if (!touches(x, y, b.r)) continue;
        const rg = g.createRadialGradient(x, y, 0, x, y, b.r);
        rg.addColorStop(0, `rgba(${b.rgb},${b.a})`);
        rg.addColorStop(1, `rgba(${b.rgb},0)`);
        g.fillStyle = rg;
        g.fillRect(x - b.r, y - b.r, b.r * 2, b.r * 2);
      }
    }
  }
  const rnd = mulberry32(B.seed);
  g.globalCompositeOperation = "lighter";
  const HALF = 700;
  for (let i = 0; i < B.count; i++) {
    const { rgb, a } = B.beams[i % B.beams.length]!;
    const px = rnd() * B.size;
    const py = rnd() * B.size;
    const rot = 0.45 + (rnd() - 0.5) * 0.5;
    const w = 8 + rnd() * 34;
    const alpha = a * (0.35 + rnd() * 0.65);
    for (const dx of wraps) {
      for (const dy of wraps) {
        if (!touches(px + dx, py + dy, Math.hypot(w, HALF))) continue;
        g.save();
        g.translate(px + dx, py + dy);
        g.rotate(rot);
        const lg = g.createLinearGradient(-w, 0, w, 0);
        lg.addColorStop(0, `rgba(${rgb},0)`);
        lg.addColorStop(0.5, `rgba(${rgb},${alpha})`);
        lg.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = lg;
        g.fillRect(-w, -HALF, w * 2, HALF * 2);
        g.restore();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c as HTMLCanvasElement);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(B.plane.repeat, B.plane.repeat);
  return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
}


export function shardGeometry(s: Shard): THREE.ExtrudeGeometry {
  const B = GLASS.bevel;
  const shape = new THREE.Shape(s.outline.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: GLASS.depth,
    bevelEnabled: true,
    bevelThickness: B.thickness,
    bevelSize: B.size,
    bevelOffset: B.offset,
    bevelSegments: B.segments,
    curveSegments: 1,
  });
  g.translate(0, 0, -GLASS.depth / 2);
  return g;
}

