/* eslint-disable react-hooks/immutability -- los objetos de three.js son imperativos: se construyen una vez y se mutan en el bucle de render */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, invalidate } from "@react-three/fiber";
import { CAMERA, GLASS, GLASS_ENV, LINES, LINES_MOBILE, SHARDS, unproject, type Shard } from "@/lib/lost/shards";
import { buildBackdrop, buildEnv, glassMaterial, shardGeometry } from "./glass-kit";

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
  /** La escena entra tras el vídeo: sus líneas empiezan ya encendidas. */
  linesOn: boolean;
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

type Assets = { env: THREE.Texture; backdrop: THREE.MeshBasicMaterial; geos: THREE.ExtrudeGeometry[]; rigs: Rig[]; lineMat: THREE.LineBasicMaterial };

const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

function buildAssets(env: THREE.Texture, backdrop: THREE.MeshBasicMaterial): Assets {
  const geos = SHARDS.map((s) => shardGeometry(s));
  const rigs = SHARDS.map((s, i): Rig => {
    const { pose } = s;
    const group = new THREE.Group();
    group.position.set(pose.x, pose.y, pose.z);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.rx, pose.ry, pose.rz, GLASS.euler));
    group.quaternion.copy(q);
    const baseScale = s.scale * GLASS.radiusPerScale;
    group.scale.setScalar(baseScale);
    const mat = glassMaterial(env, "full", GLOW_COLOR);
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
}

/** Todo lo que se construyó a mano se libera al desmontar. */
function disposeAssets(a: Assets) {
  a.env.dispose();
  a.backdrop.map?.dispose();
  a.backdrop.dispose();
  a.geos.forEach((g) => g.dispose());
  a.rigs.forEach((r) => r.mat.dispose());
  a.lineMat.dispose();
}

function Content({ layout, highlightId, paused, live, linesOn, gyro, onReady, onFail, onProject }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  const scene = useThree((s) => s.scene);
  const [assets, setAssets] = useState<Assets | null>(null);
  const [ready, setReady] = useState(false);

  // Construcción FUERA del render y troceada (PMREM, fondo, geometrías) para no formar una tarea larga; después se compilan los shaders
  // antes del primer fotograma y de `onReady`.
  useEffect(() => {
    let off = false;
    (async () => {
      await yieldToMain();
      const env = buildEnv(gl);
      await yieldToMain();
      const backdrop = buildBackdrop((w, h) => Object.assign(document.createElement("canvas"), { width: w, height: h }));
      await yieldToMain();
      const built = buildAssets(env, backdrop);
      if (off) return disposeAssets(built);
      setAssets(built);
    })().catch(() => !off && onFail());
    return () => {
      off = true;
    };
  }, [gl, onFail]);

  useEffect(() => {
    if (!assets) return;
    let off = false;
    (async () => {
      await Promise.resolve();
      await gl.compileAsync(scene, camera);
      if (!off) setReady(true);
    })().catch(() => !off && onFail());
    return () => {
      off = true;
    };
  }, [assets, gl, scene, camera, onFail]);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(Math.max(LINES.length, LINES_MOBILE.length) * 6), 3));
    return g;
  }, []);

  // todo lo que se construyó a mano se libera al desmontar
  useEffect(() => {
    return () => {
      if (assets) disposeAssets(assets);
    };
  }, [assets]);
  useEffect(() => () => lineGeo.dispose(), [lineGeo]);

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
  }, [layout, highlightId, paused, ready]);

  // Bucle a demanda: solo hay fotogramas mientras la escena es visible, la pestaña está activa, hay animación y a un máximo de 30 fps.
  useEffect(() => {
    if (!ready || !live || paused) return;
    let visible = true;
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (t - last >= 33) {
        last = t;
        invalidate();
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      kick();
    });
    io.observe(gl.domElement);
    document.addEventListener("visibilitychange", kick);
    kick();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ready, live, paused, gl]);

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
    if (!assets || !ready) return;
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
    const lineRamp = linesOn ? 1 : live ? smooth(clamp(c.live / 0.9, 0, 1)) : 0;

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
  if (!assets) return null;
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
      dpr={[1, 1.25]}
      camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: true }}
      frameloop="demand"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Content {...props} />
    </Canvas>
  );
}
