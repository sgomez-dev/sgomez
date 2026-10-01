import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { SHARDS } from "../../sgomez/src/lib/lost/shards";
import { mulberry32, chipGeometry, crackGeometry, shardGeometry } from "./geometry";
import { buildChips, cells, chipState, crackFront, crackGlow, shardState, F_CRACK_END, GLASS_CENTER } from "./timeline";

/** Paleta del sitio. */
const PALETTE = { periwinkle: "#8FA8FF", mint: "#6EF0DC", indigo: "#5B6CFF", white: "#FFFFFF" };

/** Entorno HDR de estudio, con paneles de la paleta: es lo que el cristal refleja y refracta. */
function useStudioEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const env = new THREE.Scene();
    // Cúpula cónica con la paleta: lo que cada cara refleja depende de cuánto se inclina,
    // así que cada fragmento sale con otro matiz (el mismo lenguaje que el degradado cónico del sitio).
    const sphere = new THREE.SphereGeometry(30, 64, 32);
    const ring = ["#8FA8FF", "#FFFFFF", "#6EF0DC", "#5B6CFF", "#8FA8FF"].map((c) => new THREE.Color(c));
    const p = sphere.attributes.position!;
    const cols = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / 30;
      const y = p.getY(i) / 30;
      const z = p.getZ(i) / 30;
      const t = (Math.atan2(y, x) / (Math.PI * 2) + 0.5) * (ring.length - 1);
      const k = Math.min(ring.length - 2, Math.floor(t));
      const c = ring[k]!.clone().lerp(ring[k + 1]!, t - k);
      const lobe = 0.22 + 1.5 * Math.pow(Math.max(0, z), 6) + 0.4 * Math.pow(Math.max(0, -z), 2);
      c.multiplyScalar(lobe);
      cols.set([c.r, c.g, c.b], i * 3);
    }
    sphere.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    env.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (color: string, intensity: number, w: number, h: number, pos: [number, number, number]) => {
      const c = new THREE.Color(color).multiplyScalar(intensity);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(PALETTE.white, 14, 12, 6, [-8, 9, 10]);
    panel(PALETTE.periwinkle, 9, 14, 3, [10, 4, 6]);
    panel(PALETTE.mint, 12, 3, 16, [11, -2, 4]);
    panel(PALETTE.indigo, 12, 16, 4, [-6, -9, 7]);
    panel(PALETTE.mint, 7, 5, 5, [-12, 1, 3]);
    panel(PALETTE.white, 10, 4, 1.5, [2, 12, -6]);
    panel(PALETTE.periwinkle, 8, 9, 9, [0, 2, -14]);
    panel(PALETTE.white, 22, 1.6, 1.6, [6, 7, 12]);
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(env, 0.02).texture;
    pm.dispose();
    return tex;
  }, [gl]);
}

function useGlassMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#FFFFFF",
        transmission: 1,
        roughness: 0.08,
        iridescence: 1,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [180, 720],
        thickness: 1.2,
        ior: 1.7,
        dispersion: 0.6,
        attenuationColor: new THREE.Color(PALETTE.periwinkle),
        attenuationDistance: 2.5,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 1,
        envMapIntensity: 1.1,
      }),
    [],
  );
}

type CrackMats = { core: THREE.MeshBasicMaterial; halo: THREE.MeshBasicMaterial; haze: THREE.MeshBasicMaterial };
function useCrackMaterials(): CrackMats {
  return useMemo(() => {
    const mk = (color: string, opacity: number) =>
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    return { core: mk("#F2FFFC", 1), halo: mk(PALETTE.mint, 0.55), haze: mk(PALETTE.indigo, 0.4) };
  }, []);
}

function Shard({ index, frame, mode, geo, glass, cracks }: { index: number; frame: number; mode: "desktop" | "mobile"; geo: THREE.BufferGeometry; glass: THREE.Material; cracks: CrackMats }) {
  const st = shardState(index, frame, mode);
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
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const g = c.getContext("2d")!;
    g.fillStyle = "#0A1030";
    g.fillRect(0, 0, 1024, 1024);
    const blob = (x: number, y: number, r: number, rgb: string, a: number) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `rgba(${rgb},${a})`);
      rg.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = rg;
      g.fillRect(0, 0, 1024, 1024);
    };
    blob(240, 280, 380, "91,108,255", 0.65);
    blob(800, 220, 340, "110,240,220", 0.5);
    blob(720, 840, 420, "143,168,255", 0.6);
    // vigas de luz de bordes suaves: cada fragmento refracta un trozo distinto
    const beams: [string, number][] = [
      ["143,168,255", 0.8],
      ["110,240,220", 0.85],
      ["255,255,255", 0.75],
      ["91,108,255", 0.85],
      ["110,240,220", 0.6],
    ];
    const rnd = mulberry32(31);
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 30; i++) {
      const [rgb, a] = beams[i % beams.length]!;
      g.save();
      g.translate(rnd() * 1024, rnd() * 1024);
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
    tex.repeat.set(1.7, 1.7);
    return new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  }, []);
}

/** Todo el cristal roto: 12 fragmentos y escombro. `frame` en 0 a 119. */
export function ShatterScene({ frame, mode = "desktop", showChips = true }: { frame: number; mode?: "desktop" | "mobile"; showChips?: boolean }) {
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

  return (
    <>
      <mesh
        position={[2, 0, -5]}
        scale={[18, 18, 1]}
        material={backdropMat}
        onBeforeRender={(renderer) => {
          const inTransmission = renderer.getRenderTarget() !== null;
          backdropMat.colorWrite = inTransmission;
          backdropMat.depthWrite = inTransmission;
        }}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-3, 5, 7]} intensity={2.2} color={PALETTE.white} />
      <pointLight position={[6, -2, 3]} intensity={40} color={PALETTE.mint} distance={0} decay={2} />
      <pointLight position={[-2, -4, 4]} intensity={45} color={PALETTE.indigo} distance={0} decay={2} />
      <pointLight position={[2, 4, 3]} intensity={30} color={PALETTE.periwinkle} distance={0} decay={2} />
      {flash > 0.01 ? <pointLight position={[GLASS_CENTER.x, GLASS_CENTER.y, 1.2]} intensity={260 * flash} color={PALETTE.mint} decay={2} /> : null}
      {SHARDS.map((s, i) => (
        <Shard key={s.id} index={i} frame={frame} mode={mode} geo={geos[i]!} glass={glass} cracks={cracks} />
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
