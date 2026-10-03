import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CAMERA, GLASS_LIVE } from "../../sgomez/src/lib/lost/shards";
import { RefractionPlane, StudioLights, useGlassMaterial, useRefractionBackdrop, useStudioEnv } from "./Scene";
import { useSlabGeometry } from "./BuildSequence";
import { HERO_SIZE, heroPose } from "./hero-timeline";

function HeroScene({ frame }: { frame: number }) {
  const gl = useThree((s) => s.gl);
  gl.toneMappingExposure = GLASS_LIVE.exposure;
  const envTex = useStudioEnv();
  const glass = useGlassMaterial(GLASS_LIVE.material);
  const backdrop = useRefractionBackdrop(GLASS_LIVE.backdrop);
  const geo = useSlabGeometry();
  glass.envMap = envTex;
  useEffect(() => () => geo.dispose(), [geo]);
  const st = heroPose(frame);
  return (
    <>
      <RefractionPlane material={backdrop} />
      <StudioLights />
      <mesh geometry={geo} material={glass} position={st.pos} quaternion={st.q} scale={st.scale} />
    </>
  );
}

export type HeroLoopProps = {
  /** "transparent" para el WebM y el fotograma 0; negro puro para el MP4 de Safari (la página lo mezcla con `screen`). */
  bg: string;
};

/** 720x720, 30 fps, 180 fotogramas, bucle perfecto. Sin texto. */
export const HeroLoop = ({ bg }: HeroLoopProps) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas
        width={HERO_SIZE}
        height={HERO_SIZE}
        camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <HeroScene frame={frame} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
