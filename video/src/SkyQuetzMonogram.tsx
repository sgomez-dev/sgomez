import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CAMERA, GLASS_LIVE, SHARDS } from "../../sgomez/src/lib/lost/shards";
import { shardGeometry } from "./geometry";
import { cells } from "./timeline";
import { RefractionPlane, StudioLights, useGlassMaterial, useRefractionBackdrop, useStudioEnv } from "./Scene";
import { LAYOUT, MONO_H, MONO_W, flash, glassOpacity, logoReveal, monoShardState } from "./monogram-timeline";

const SOFT_BACKDROP = { ...GLASS_LIVE.backdrop, count: 0 };

function MonogramScene({ frame }: { frame: number }) {
  const gl = useThree((s) => s.gl);
  gl.toneMappingExposure = GLASS_LIVE.exposure;
  const envTex = useStudioEnv();
  const glass = useGlassMaterial(GLASS_LIVE.material);
  const backdrop = useRefractionBackdrop(SOFT_BACKDROP);
  const geos = useMemo(() => cells.map((c) => shardGeometry(c)), []);
  glass.envMap = envTex;
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);
  const fl = flash(frame);
  return (
    <>
      <RefractionPlane material={backdrop} />
      <StudioLights />
      {fl > 0.01 ? <pointLight position={[0, 0, 3]} intensity={140 * fl} color="#6EF0DC" decay={2} /> : null}
      {SHARDS.map((s, i) => {
        const st = monoShardState(i, frame);
        return <mesh key={s.id} geometry={geos[i]!} material={glass} position={st.pos} quaternion={st.q} scale={[st.scale * LAYOUT.sx, st.scale, st.scale]} />;
      })}
    </>
  );
}

/**
 * Disolución por umbral de ruido: el alfa de cada punto es 1 donde el ruido supera el umbral y 0 donde no, con un borde de
 * unos pocos fotogramas de gris. `remaining` (1 a 0) sube el umbral de 0 a más que el máximo del ruido, así la placa se
 * deshace en manchas que se abren y no se oscurece.
 */
function DissolveFilter({ remaining }: { remaining: number }) {
  const SLOPE = 6;
  const threshold = (1 - remaining) * 1.1 - 0.05;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id="glass-dissolve" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.0065 0.011" numOctaves={2} seed={11} result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="r" />
        <feComponentTransfer in="r" result="mask">
          <feFuncA type="linear" slope={SLOPE} intercept={(-SLOPE * threshold).toFixed(3)} />
        </feComponentTransfer>
        <feComposite in="SourceGraphic" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

export type MonogramProps = {
  /** "transparent" para el WebM y el póster; negro puro para el MP4 de Safari (la página lo mezcla con `screen`). */
  bg: string;
};

/** 850x506, 60 fps, 150 fotogramas. Sin texto propio: el logotipo es la imagen de la marca y el último fotograma es esa imagen. */
export const SkyQuetzMonogram = ({ bg }: MonogramProps) => {
  const frame = useCurrentFrame();
  const g = glassOpacity(frame);
  const r = logoReveal(frame);
  return (
    <AbsoluteFill style={{ background: bg }}>
      {g < 1 ? <DissolveFilter remaining={g} /> : null}
      {g > 0.001 ? (
        <AbsoluteFill style={g < 1 ? { filter: "url(#glass-dissolve)" } : undefined}>
          <ThreeCanvas
            width={MONO_W}
            height={MONO_H}
            camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          >
            <MonogramScene frame={frame} />
          </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {r > 0 ? (
        <Img
          src={staticFile("brand/skyquetz-logo.webp")}
          style={{
            position: "absolute",
            inset: 0,
            width: MONO_W,
            height: MONO_H,
            opacity: r,
            ...(r < 1 ? { filter: `blur(${((1 - r) * 9).toFixed(2)}px)`, transform: `scale(${(1 + 0.05 * (1 - r)).toFixed(4)})` } : {}),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
