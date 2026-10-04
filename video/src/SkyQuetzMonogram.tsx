import { GlassLogoReveal } from "./GlassLogoReveal";
import { LAYOUT, MONO_H, MONO_W } from "./monogram-timeline";

export type MonogramProps = {
  /** "transparent" para el WebM y el póster; negro puro para el MP4 de Safari (la página lo mezcla con `screen`). */
  bg: string;
};

/** 850x506, 60 fps, 150 fotogramas: el logotipo de SkyQuetz (425x253 en la página) a doble tamaño, ocupando todo el vídeo. */
export const SkyQuetzMonogram = ({ bg }: MonogramProps) => (
  <GlassLogoReveal
    bg={bg}
    width={MONO_W}
    height={MONO_H}
    logo={{ src: "brand/skyquetz-logo.webp", x: 0, y: 0, w: MONO_W, h: MONO_H }}
    layout={LAYOUT}
    flashColor="#6EF0DC"
    dissolveFrequency="0.0065 0.011"
  />
);
