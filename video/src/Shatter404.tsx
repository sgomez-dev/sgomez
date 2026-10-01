import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CAMERA } from "../../sgomez/src/lib/lost/shards";
import { ShatterScene } from "./Scene";

export type ShatterProps = {
  /** "transparent" para el WebM; un color sólido para el MP4 de Safari. */
  bg: string;
};

/** 1920x1080, 60 fps, 120 frames. Sin texto: el «404» es DOM. */
export const Shatter404 = ({ bg }: ShatterProps) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg }}>
      <ThreeCanvas
        width={1920}
        height={1080}
        camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <ShatterScene frame={frame} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
