import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { SHARDS, GLASS_MATERIAL, GLASS_ENV } from "../../sgomez/src/lib/lost/shards";
import { mulberry32, chipGeometry, crackGeometry, shardGeometry } from "./geometry";
import { buildChips, cells, chipState, crackFront, crackGlow, shardState, F_CRACK_END, GLASS_CENTER } from "./timeline";

/**
 * Todo lo que define el aspecto del cristal (material, entorno, luces, fondo de
 * refracción) vive en `shards.ts` (GLASS_MATERIAL y GLASS_ENV): aquí solo se
 * construye con three.js. La escena 3D en vivo debe construir lo mismo desde ahí.
 */

const MINT = "#6EF0DC";
const INDIGO = "#5B6CFF";

/** Entorno HDR de estudio: es lo que el cristal refleja. */
function useStudioEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const env = new THREE.Scene();
    const { dome, panels } = GLASS_ENV;
    // Cúpula cónica: lo que cada cara refleja depende de cuánto se inclina, así que
    // cada fragmento sale con otro matiz (el degradado cónico del sitio).
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
    return tex;
  }, [gl]);
}

function useGlassMaterial() {
  return useMemo(() => {
    const { attenuationColor, iridescenceThicknessRange, ...rest } = GLASS_MATERIAL;
    return new THREE.MeshPhysicalMaterial({
      ...rest,
      iridescenceThicknessRange: [...iridescenceThicknessRange],
      attenuationColor: new THREE.Color(attenuationColor),
    });
  }, []);
}

type CrackMats = { core: THREE.MeshBasicMaterial; halo: THREE.MeshBasicMaterial; haze: THREE.MeshBasicMaterial };
function useCrackMaterials(): CrackMats {
  return useMemo(() => {
    const mk = (color: string, opacity: number) =>
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    return { core: mk("#F2FFFC", 1), halo: mk(MINT, 0.55), haze: mk(INDIGO, 0.4) };
  }, []);
}

function Shard({ index, frame, geo, glass, cracks }: { index: number; frame: number; geo: THREE.BufferGeometry; glass: THREE.Material; cracks: CrackMats }) {
  const st = shardState(index, frame);
  const glow = crackGlow(frame);
  const front = crackFront(frame);
  const cell = cells[index]!;
  const crackGeos = useMemo(() => {
    if (glow < 0.01) return null;
    return { core: crackGeometry(cell, front, 0.007), halo: crackGeometry(cell, front, 0.022), haze: crackGeometry(cell, front, 0.06) };
  }, [cell, front, glow]);
  return (
    <group position={st.pos} quaternion={st.q} scale={st.scale}>
      <mesh geometry={geo} material={glass} />
      {crackGeos ? (
        <>
          <mesh geometry={crackGeos.haze} material={cracks.haze} renderOrder={3} />
          <mesh geometry={crackGeos.halo} material={cracks.halo} renderOrder={4} />
          <mesh geometry={crackGeos.core} material={cracks.core} renderOrder={5} />
        </>
      ) : null}
    </group>
  );
}

/**
 * Fondo SOLO para la refracción. El pase de transmisión de three refracta lo que
 * hay detrás del cristal; con el lienzo transparente eso sería un gris plano. Este
 * plano se dibuja únicamente en el render target de transmisión (colorWrite falso
 * en el pase principal), así que el vídeo sigue siendo transparente.
 */
function useRefractionBackdrop() {
  return useMemo(() => {
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
    // vigas de luz de bordes suaves: cada fragmento refracta un trozo distinto
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
  }, []);
}

/** Todo el cristal roto: 12 fragmentos y escombro. `frame` en 0 a 119. */
export function ShatterScene({ frame, showChips = true }: { frame: number; showChips?: boolean }) {
  const envTex = useStudioEnv();
  const glass = useGlassMaterial();
  const cracks = useCrackMaterials();
  const geos = useMemo(() => cells.map((c) => shardGeometry(c)), []);
  const chipGeo = useMemo(() => chipGeometry(), []);
  const chips = useMemo(() => buildChips(), []);

  const glow = crackGlow(frame);
  cracks.core.opacity = Math.min(1, glow);
  cracks.halo.opacity = Math.min(1, 0.6 * glow);
  cracks.haze.opacity = Math.min(1, 0.4 * glow);

  glass.envMap = envTex;
  const backdropMat = useRefractionBackdrop();

  const flash = frame >= F_CRACK_END ? Math.max(0, Math.exp(-(frame - F_CRACK_END) / 5)) : 0;
  const plane = GLASS_ENV.backdrop.plane;

  return (
    <>
      <mesh
        position={[...plane.pos]}
        scale={[plane.scale, plane.scale, 1]}
        material={backdropMat}
        onBeforeRender={(renderer) => {
          const inTransmission = renderer.getRenderTarget() !== null;
          backdropMat.colorWrite = inTransmission;
          backdropMat.depthWrite = inTransmission;
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
      {flash > 0.01 ? <pointLight position={[GLASS_CENTER.x, GLASS_CENTER.y, 1.2]} intensity={260 * flash} color={MINT} decay={2} /> : null}
      {SHARDS.map((s, i) => (
        <Shard key={s.id} index={i} frame={frame} geo={geos[i]!} glass={glass} cracks={cracks} />
      ))}
      {showChips
        ? chips.map((c, i) => {
            const st = chipState(c, frame);
            if (!st || st.scale < 0.002) return null;
            return <mesh key={i} geometry={chipGeo} material={glass} position={st.pos} quaternion={st.q} scale={st.scale} />;
          })
        : null}
    </>
  );
}
