import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CAMERA, GLASS, GLASS_LIVE, slabOutlinePoints } from "../../sgomez/src/lib/lost/shards";
import { RefractionPlane, StudioLights, useGlassMaterial, useRefractionBackdrop, useStudioEnv } from "./Scene";
import { LAYERS, slabState } from "./build-timeline";

/** Losa con la silueta redondeada del póster, extruida como la escena en vivo (`slabGeometry` de glass-kit). */
function useSlabGeometry() {
  return useMemo(() => {
    const k = GLASS.slabRadius;
    const B = GLASS.bevel;
    const shape = new THREE.Shape(slabOutlinePoints().map(([x, y]) => new THREE.Vector2(x, y)));
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
  }, []);
}

export function BuildScene({ frame }: { frame: number }) {
  const gl = useThree((s) => s.gl);
  // El ACES con la exposición del cristal del hero, para que case con el póster.
  gl.toneMappingExposure = GLASS_LIVE.exposure;
  const envTex = useStudioEnv();
  const glass = useGlassMaterial(GLASS_LIVE.material);
  const backdrop = useRefractionBackdrop(GLASS_LIVE.backdrop);
  const geo = useSlabGeometry();
  glass.envMap = envTex;
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <>
      <RefractionPlane material={backdrop} />
      <StudioLights />
      {Array.from({ length: LAYERS }, (_, i) => {
        const st = slabState(i, frame);
        return <mesh key={i} geometry={geo} material={glass} position={st.pos} quaternion={st.q} scale={st.scale} />;
      })}
    </>
  );
}

export type BuildProps = { width: number; height: number };

/** 90 fotogramas a 30 fps. Fondo transparente, sin texto: la lista de capas es DOM. */
export const BuildSequence = ({ width, height }: BuildProps) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <BuildScene frame={frame} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
