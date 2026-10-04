import { useEffect, useMemo, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CAMERA, GLASS_LIVE, SHARDS } from "../../sgomez/src/lib/lost/shards";
import { shardGeometry } from "./geometry";
import { cells } from "./timeline";
import { RefractionPlane, StudioLights, useGlassMaterial, useRefractionBackdrop, useStudioEnv } from "./Scene";
import { type Layout, flash, glassOpacity, logoReveal, monoShardState } from "./monogram-timeline";

const SOFT_BACKDROP = { ...GLASS_LIVE.backdrop, count: 0 };

type BackdropPlane = { pos: readonly [number, number, number]; scale: number };

function GlassScene({ frame, layout, flashColor, plane }: { frame: number; layout: Layout; flashColor: string; plane?: BackdropPlane }) {
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
      <RefractionPlane material={backdrop} pos={plane?.pos} scale={plane?.scale} />
      <StudioLights />
      {fl > 0.01 ? <pointLight position={[0, 0, 3]} intensity={140 * fl} color={flashColor} decay={2} /> : null}
      {SHARDS.map((s, i) => {
        const st = monoShardState(i, frame, layout);
        return <mesh key={s.id} geometry={geos[i]!} material={glass} position={st.pos} quaternion={st.q} scale={[st.scale * layout.sx, st.scale, st.scale]} />;
      })}
    </>
  );
}

/**
 * Disolución por umbral de ruido: el alfa de cada punto es 1 donde el ruido supera el umbral y 0 donde no, con un borde de
 * unos pocos fotogramas de gris. `remaining` (1 a 0) sube el umbral de 0 a más que el máximo del ruido, así la placa se
 * deshace en manchas que se abren y no se oscurece.
 */
function DissolveFilter({ remaining, baseFrequency }: { remaining: number; baseFrequency: string }) {
  const SLOPE = 6;
  const threshold = (1 - remaining) * 1.1 - 0.05;
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id="glass-dissolve" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={2} seed={11} result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="r" />
        <feComponentTransfer in="r" result="mask">
          <feFuncA type="linear" slope={SLOPE} intercept={(-SLOPE * threshold).toFixed(3)} />
        </feComponentTransfer>
        <feComposite in="SourceGraphic" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

export type GlassLogoRevealProps = {
  /** "transparent" para el WebM; negro puro para el MP4 de Safari (la página lo mezcla con `screen`). */
  bg: string;
  width: number;
  height: number;
  /** El logotipo de la página (en `video/public`, lo copia render.mjs) y su caja dentro del vídeo, en px. */
  logo: { src: string; x: number; y: number; w: number; h: number };
  /** Cómo se despliega la placa de cristal en el encuadre (ver `LAYOUT` en monogram-timeline). */
  layout: Layout;
  /** Color del destello cuando la placa se completa. */
  flashColor: string;
  /** Frecuencia del ruido de la disolución, a la escala del encuadre. */
  dissolveFrequency: string;
  /**
   * El fondo que refracta el cristal. Por omisión el del 404, que cubre un encuadre como el de SkyQuetz; uno más apaisado
   * necesita uno más grande: donde el cristal no tiene nada detrás que refractar sale blanco a media opacidad, un gris
   * sobre el negro de la página.
   */
  plane?: BackdropPlane;
  /** Lo que va encima del logotipo y se forma con él (la brasa apagada de Forgia). Coordenadas de la caja del logotipo. */
  overlay?: ReactNode;
};

/**
 * Los doce fragmentos del cristal del 404 llegan de lejos, se juntan en una placa, el logotipo se enfoca encima y la placa
 * se deshace en manchas. La línea de tiempo es la de monogram-timeline (2,5 s a 60 fps). Sin texto propio: el logotipo es
 * la imagen de la marca y el último fotograma es esa imagen, en su caja. Lo usan SkyQuetzMonogram y ForgiaReveal.
 */
export const GlassLogoReveal = ({ bg, width, height, logo, layout, flashColor, dissolveFrequency, plane, overlay }: GlassLogoRevealProps) => {
  const frame = useCurrentFrame();
  const g = glassOpacity(frame);
  const r = logoReveal(frame);
  return (
    <AbsoluteFill style={{ background: bg }}>
      {g < 1 ? <DissolveFilter remaining={g} baseFrequency={dissolveFrequency} /> : null}
      {g > 0.001 ? (
        <AbsoluteFill style={g < 1 ? { filter: "url(#glass-dissolve)" } : undefined}>
          <ThreeCanvas
            width={width}
            height={height}
            camera={{ fov: CAMERA.fov, position: [...CAMERA.position], near: 0.1, far: 60 }}
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          >
            <GlassScene frame={frame} layout={layout} flashColor={flashColor} plane={plane} />
          </ThreeCanvas>
        </AbsoluteFill>
      ) : null}
      {r > 0 ? (
        <div
          style={{
            position: "absolute",
            left: logo.x,
            top: logo.y,
            width: logo.w,
            height: logo.h,
            opacity: r,
            ...(r < 1 ? { filter: `blur(${((1 - r) * 9).toFixed(2)}px)`, transform: `scale(${(1 + 0.05 * (1 - r)).toFixed(4)})` } : {}),
          }}
        >
          <Img src={staticFile(logo.src)} style={{ position: "absolute", inset: 0, width: logo.w, height: logo.h }} />
          {overlay}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
