import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { CAMERA, SHARDS, LINES, LINES_MOBILE } from "../../sgomez/src/lib/lost/shards";
import { ShatterScene } from "./Scene";
import { F_LAST, finalPose } from "./timeline";

/**
 * Pósters de la constelación: pose final de los 12 fragmentos y sus líneas.
 * Sin texto. El póster de escritorio es el fotograma 119 del vídeo más las
 * líneas; el móvil usa `stage.mobile` y `LINES_MOBILE`.
 */

function Constellation({ mode, width, height }: { mode: "desktop" | "mobile"; width: number; height: number }) {
  const aspect = width / height;
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, aspect, 0.1, 60);
  camera.position.set(...CAMERA.position);
  camera.updateMatrixWorld();
  // % del póster de cada fragmento, proyectado desde su pose real: línea y cristal coinciden
  const pct = (i: number) => {
    const ndc = finalPose(i, mode).pos.clone().project(camera);
    return { x: (ndc.x * 0.5 + 0.5) * 100, y: (1 - (ndc.y * 0.5 + 0.5)) * 100 };
  };
  const byId = new Map(SHARDS.map((s, i) => [s.id, i]));
  const lines = mode === "desktop" ? LINES : LINES_MOBILE;
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width={width} height={height} style={{ position: "absolute", inset: 0 }} fill="none">
        {lines.map(([a, b]) => {
          const p = pct(byId.get(a)!);
          const q = pct(byId.get(b)!);
          return <line key={`${a}${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#8FA8FF" strokeOpacity={0.3} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <ThreeCanvas width={width} height={height} camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}>
        <ShatterScene frame={F_LAST} mode={mode} showChips={false} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
}

export const ConstellationDesktop = () => <Constellation mode="desktop" width={1920} height={1080} />;
export const ConstellationMobile = () => <Constellation mode="mobile" width={900} height={1200} />;
