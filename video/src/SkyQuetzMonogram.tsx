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
      {g > 0.001 ? (
        <AbsoluteFill style={{ opacity: g }}>
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
