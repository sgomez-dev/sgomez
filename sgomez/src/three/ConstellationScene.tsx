/* eslint-disable react-hooks/immutability -- los objetos de three.js son imperativos: se construyen una vez y se mutan en el bucle de render */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, invalidate } from "@react-three/fiber";
import { CAMERA, GLASS, GLASS_ENV, GLASS_MATERIAL, LINES, LINES_MOBILE, SHARDS, unproject, type Shard } from "@/lib/lost/shards";

/**
 * Escena 3D viva del 404. Es el RELEVO exacto del último fotograma del vídeo
 * Remotion: mismos fragmentos (contorno extruido con `GLASS`), mismo material
 * (`GLASS_MATERIAL`), mismo entorno (`GLASS_ENV`: cúpula, paneles, luces y fondo
 * de refracción), misma cámara y mismas poses. Todo sale de `shards.ts`; aquí
 * solo se CONSTRUYE con three.js, una vez, y se mueve con transformas.
 *
 * Encima del reposo se suma: flotación suave, inclinación hacia el puntero o el
 * giroscopio, y brillo en el fragmento que se señala (`highlightId`).
 */

export type SceneProps = {
  /** Escritorio: poses de `shards.ts`. Móvil: `stage.mobile` desproyectado a la profundidad de cada pose (L3). */
  layout: "desktop" | "mobile";
  /** Id del fragmento señalado (hover o foco de su enlace), o "". */
  highlightId: string;
  /** Congela flotación e inclinación. */
  paused: boolean;
  /** El relevo ya ocurrió: la escena anima. Antes solo pinta su primer fotograma, en reposo. */
  live: boolean;
  /** Escucha el giroscopio. */
  gyro: boolean;
  onReady: () => void;
  onFail: () => void;
  /** Desplazamiento en px del centro del fragmento respecto a su reposo: mueve el enlace. */
  onProject: (id: string, dx: number, dy: number) => void;
};

const DEG = Math.PI / 180;
const MAX_TILT = 6 * DEG;
const MAX_FLOAT = 0.08;
const GLOW_COLOR = "#9FB6FF";

/** Mismo generador que el vídeo (`video/src/geometry.ts`): el fondo de refracción debe salir idéntico. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entorno HDR de estudio: lo que el cristal refleja. Igual que `useStudioEnv` del vídeo. */
function buildEnv(gl: THREE.WebGLRenderer): THREE.Texture {
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

/** Fondo SOLO para la refracción (ver `Scene.tsx` del vídeo): el pase de transmisión refracta lo que hay detrás del cristal. */
function buildBackdrop(): THREE.MeshBasicMaterial {
  const B = GLASS_ENV.backdrop;
  const c = document.createElement("canvas");
  c.width = B.size;
  c.height = B.size;
  const g = c.getContext("2d")!;
  g.fillStyle = B.base;
  g.fillRect(0, 0, B.size, B.size);
  for (const b of B.blobs) {
    const rg = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    rg.addColorStop(0, `rgba(${b.rgb},${b.a})`);
    rg.addColorStop(1, `rgba(${b.rgb},0)`);
    g.fillStyle = rg;
    g.fillRect(0, 0, B.size, B.size);
  }
  const rnd = mulberry32(B.seed);
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < B.count; i++) {
    const { rgb, a } = B.beams[i % B.beams.length]!;
    g.save();
    g.translate(rnd() * B.size, rnd() * B.size);
    g.rotate(0.45 + (rnd() - 0.5) * 0.5);
    const w = 8 + rnd() * 34;
    const lg = g.createLinearGradient(-w, 0, w, 0);
    lg.addColorStop(0, `rgba(${rgb},0)`);
    lg.addColorStop(0.5, `rgba(${rgb},${a * (0.35 + rnd() * 0.65)})`);
    lg.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = lg;
    g.fillRect(-w, -700, w * 2, 1400);
    g.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(B.plane.repeat, B.plane.repeat);
  return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
}

function shardGeometry(s: Shard): THREE.ExtrudeGeometry {
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

/** El material del vídeo, uno por fragmento (el brillo es por fragmento). Con emisión 0 es idéntico. */
function glassMaterial(env: THREE.Texture): THREE.MeshPhysicalMaterial {
  const { attenuationColor, iridescenceThicknessRange, ...rest } = GLASS_MATERIAL;
  const m = new THREE.MeshPhysicalMaterial({
    ...rest,
    iridescenceThicknessRange: [...iridescenceThicknessRange],
    attenuationColor: new THREE.Color(attenuationColor),
    emissive: new THREE.Color(GLOW_COLOR),
    emissiveIntensity: 0,
  });
  m.envMap = env;
  return m;
}

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

function Content({ layout, highlightId, paused, live, gyro, onReady, onFail, onProject }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const assets = useMemo(() => {
    const env = buildEnv(gl);
    const backdrop = buildBackdrop();
    const geos = SHARDS.map((s) => shardGeometry(s));
    const rigs = SHARDS.map((s, i): Rig => {
      const { pose } = s;
      const group = new THREE.Group();
      group.position.set(pose.x, pose.y, pose.z);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.rx, pose.ry, pose.rz, GLASS.euler));
      group.quaternion.copy(q);
      const baseScale = s.scale * GLASS.radiusPerScale;
      group.scale.setScalar(baseScale);
      const mat = glassMaterial(env);
      group.add(new THREE.Mesh(geos[i]!, mat));
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
    return { env, backdrop, geos, rigs, lineMat };
  }, [gl]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(Math.max(LINES.length, LINES_MOBILE.length) * 6), 3));
    return g;
  }, []);

  // todo lo que se construyó a mano se libera al desmontar
  useEffect(() => {
    return () => {
      assets.env.dispose();
      assets.backdrop.map?.dispose();
      assets.backdrop.dispose();
      assets.geos.forEach((g) => g.dispose());
      assets.rigs.forEach((r) => r.mat.dispose());
      assets.lineMat.dispose();
      lineGeo.dispose();
    };
  }, [assets, lineGeo]);

  // un fallo de contexto (GPU perdida) devuelve el escenario estático
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    el.addEventListener("webglcontextlost", lost);
    return () => el.removeEventListener("webglcontextlost", lost);
  }, [gl, onFail]);

  // puntero y giroscopio: objetivo normalizado -1..1, amortiguado en el bucle
  const input = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      input.current.tx = clamp((e.clientX / window.innerWidth - 0.5) * 2, -1, 1);
      input.current.ty = clamp((e.clientY / window.innerHeight - 0.5) * 2, -1, 1);
    };
    const leave = () => {
      input.current.tx = 0;
      input.current.ty = 0;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  useEffect(() => {
    if (!gyro) return;
    const on = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      input.current.tx = clamp(e.gamma / 30, -1, 1);
      input.current.ty = clamp((e.beta - 45) / 30, -1, 1);
    };
    window.addEventListener("deviceorientation", on);
    return () => window.removeEventListener("deviceorientation", on);
  }, [gyro]);

  // con el bucle "demand", un cambio de disposición o de brillo pide su fotograma
  useEffect(() => {
    invalidate();
  }, [layout, highlightId, paused]);

  const clock = useRef({ t: 0, live: 0, frames: 0 });
  const scratch = useMemo(
    () => ({
      v: new THREE.Vector3(),
      b: new THREE.Vector3(),
      qa: new THREE.Quaternion(),
      qb: new THREE.Quaternion(),
      ex: new THREE.Euler(),
      pos: new Map<string, THREE.Vector3>(),
    }),
    [],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const c = clock.current;
    const aspect = size.width / Math.max(1, size.height);
    camera.updateMatrixWorld();

    if (live && !paused) {
      c.t += dt;
      c.live += dt;
    }
    // la animación entra suave: en el relevo todo está EXACTAMENTE en reposo
    const ramp = live ? smooth(clamp(c.live / 1.6, 0, 1)) : 0;
    const lineRamp = live ? smooth(clamp(c.live / 0.9, 0, 1)) : 0;

    const inp = input.current;
    if (!paused) {
      const k = 1 - Math.exp(-dt * 5);
      inp.x += (inp.tx - inp.x) * k;
      inp.y += (inp.ty - inp.y) * k;
    }

    let settling = false;
    for (const r of assets.rigs) {
      const p = r.shard.pose;
      // reposo: escritorio = pose; móvil = stage.mobile desproyectado a la profundidad de la pose
      const base = layout === "desktop" ? { x: p.x, y: p.y } : unproject(r.shard.stage.mobile.left, r.shard.stage.mobile.top, p.z, aspect);
      const fa = r.amp * ramp;
      const fy = Math.sin(c.t * r.speed + r.phase) * fa;
      const fx = Math.cos(c.t * r.speed * 0.7 + r.phase * 1.3) * fa * 0.5;
      // paralaje con el puntero: más cerca de la cámara, más se mueve
      const par = 0.06 * (p.z + 1.2) * ramp;
      r.group.position.set(base.x + fx + inp.x * par, base.y + fy - inp.y * par, p.z);

      // giro: inclinación de mundo (hasta 6 grados) por encima de la pose, más un vaivén mínimo
      scratch.ex.set(inp.y * MAX_TILT * ramp, inp.x * MAX_TILT * ramp, 0, "XYZ");
      scratch.qa.setFromEuler(scratch.ex);
      scratch.ex.set(
        Math.sin(c.t * r.speed * 0.8 + r.phase) * 0.035 * ramp,
        Math.cos(c.t * r.speed * 0.6 + r.phase) * 0.035 * ramp,
        Math.sin(c.t * r.speed * 0.5 + r.phase * 2) * 0.03 * ramp,
        "XYZ",
      );
      scratch.qb.setFromEuler(scratch.ex);
      r.group.quaternion.copy(scratch.qa).multiply(r.q).multiply(scratch.qb);

      // brillo y escala al señalar
      const target = highlightId === r.id ? 1 : 0;
      r.glow += (target - r.glow) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - r.glow) < 0.002) r.glow = target;
      else settling = true;
      r.mat.emissiveIntensity = r.glow * 0.85;
      r.group.scale.setScalar(r.baseScale * (1 + 0.08 * r.glow));

      scratch.pos.set(r.id, r.group.position);
      if (r.shard.target !== null) {
        // desplazamiento del enlace: proyección actual menos proyección del reposo
        scratch.b.set(base.x, base.y, p.z).project(camera);
        scratch.v.copy(r.group.position).project(camera);
        onProject(r.id, ((scratch.v.x - scratch.b.x) * size.width) / 2, (-(scratch.v.y - scratch.b.y) * size.height) / 2);
      }
    }

    // la constelación: del centro de un fragmento al del otro, con su pose actual
    const arr = lineGeo.attributes.position!.array as Float32Array;
    let n = 0;
    for (const [a, b] of layout === "desktop" ? LINES : LINES_MOBILE) {
      const pa = scratch.pos.get(a);
      const pb = scratch.pos.get(b);
      if (!pa || !pb) continue;
      arr.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], n * 6);
      n++;
    }
    lineGeo.setDrawRange(0, n * 2);
    lineGeo.attributes.position!.needsUpdate = true;
    assets.lineMat.opacity = 0.28 * lineRamp;
    // en pausa el bucle es "demand": el brillo que aún se asienta pide su siguiente fotograma
    if (settling) invalidate();

    // el primer fotograma se pinta justo después de esta llamada: avisar en el siguiente turno
    c.frames++;
    if (c.frames === 1) requestAnimationFrame(() => onReady());
  });

  const plane = GLASS_ENV.backdrop.plane;
  return (
    <>
      <mesh
        position={[...plane.pos]}
        scale={[plane.scale, plane.scale, 1]}
        material={assets.backdrop}
        onBeforeRender={(renderer) => {
          const inTransmission = renderer.getRenderTarget() !== null;
          assets.backdrop.colorWrite = inTransmission;
          assets.backdrop.depthWrite = inTransmission;
        }}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
      {GLASS_ENV.lights.map((l, i) =>
        l.type === "ambient" ? (
          <ambientLight key={i} intensity={l.intensity} color={l.color} />
        ) : l.type === "directional" ? (
          <directionalLight key={i} position={[...l.pos!]} intensity={l.intensity} color={l.color} />
        ) : (
          <pointLight key={i} position={[...l.pos!]} intensity={l.intensity} color={l.color} distance={0} decay={2} />
        ),
      )}
      {assets.rigs.map((r) => (
        <primitive key={r.id} object={r.group} dispose={null} />
      ))}
      <lineSegments geometry={lineGeo} material={assets.lineMat} frustumCulled={false} renderOrder={-1} />
    </>
  );
}

export default function ConstellationScene(props: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true }}
      frameloop={props.live && !props.paused ? "always" : "demand"}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Content {...props} />
    </Canvas>
  );
}
