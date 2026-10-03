import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ORIGIN, SHOT, camMid, camTop, midWeight, type Cam } from "./reel-timeline";

export type ReelProps = { slug: string };

const shot = (slug: string, name: "top" | "mid", cam: Cam, opacity: number) => (
  <Img
    src={staticFile(`projects/${slug}/${name}.png`)}
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: SHOT.w,
      height: SHOT.h,
      opacity,
      transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`,
      transform: `translate3d(0, ${cam.ty}px, 0) scale(${cam.scale})`,
    }}
  />
);

/** Reel de un proyecto: capturas reales de su URL pública, nada inventado y sin texto. 960x540, 8 s a 30 fps. */
export const ProjectReel = ({ slug }: ReelProps) => {
  const frame = useCurrentFrame();
  const w = midWeight(frame);
  return (
    <AbsoluteFill style={{ background: "#05060a", overflow: "hidden" }}>
      {shot(slug, "top", camTop(frame), 1)}
      {w > 0 ? shot(slug, "mid", camMid(frame), w) : null}
    </AbsoluteFill>
  );
};
