import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CAMERA, GLASS, GLASS_LIVE, slabOutlinePoints } from "../../sgomez/src/lib/lost/shards";
import { RefractionPlane, StudioLights, useGlassMaterial, useRefractionBackdrop, useStudioEnv } from "./Scene";
import { LAYERS, VIEW, slabState } from "./build-timeline";

/** Fondo de refracción suave: el de `GLASS_LIVE` sin haces, que son lo que troceaba las placas en bandas. */
const SOFT_BACKDROP = { ...GLASS_LIVE.backdrop, count: 0 };

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
  const backdrop = useRefractionBackdrop(SOFT_BACKDROP);
  const geo = useSlabGeometry();
  glass.envMap = envTex;
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <>
      <RefractionPlane material={backdrop} />
      {/* Con la cámara elevada, las placas de abajo refractan el suelo: sin este plano se veía el gris del pase de transmisión. */}
      <RefractionPlane material={backdrop} pos={[0, -9, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={70} />
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
        camera={{ fov: CAMERA.fov, position: [0, Math.sin(VIEW.elevation) * VIEW.distance, Math.cos(VIEW.elevation) * VIEW.distance], near: 0.1, far: 80 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <BuildScene frame={frame} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
