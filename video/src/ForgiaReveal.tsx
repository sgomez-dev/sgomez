import { FORGIA_REVEAL } from "../../sgomez/src/lib/monogram";
import { GlassLogoReveal } from "./GlassLogoReveal";
import type { Layout } from "./monogram-timeline";

/**
 * La placa de Forgia: tan alta como la de SkyQuetz (el encuadre tiene la misma cámara) y estirada al ancho del vídeo, que
 * es 3,45 veces su alto, hasta cubrir el logotipo. Las celdas se estiran con ella y siguen encajando.
 */
const LAYOUT_FORGIA: Layout = { sx: 4.2, scale: 1.3, shard: 0.99 };

export type ForgiaRevealProps = { bg: string };

/**
 * El logotipo de Forgia (FORGIA. con el punto dorado) que se forma con el cristal del 404, como el de SkyQuetz. Geometría
 * en `FORGIA_REVEAL` (sgomez/src/lib/monogram.ts). El destello es el oro caliente de la forja, no el menta de SkyQuetz.
 *
 * El punto lo tapa la brasa del DOM (`data-ember`): el vídeo la dibuja apagada encima del punto, igual que el primer
 * fotograma de `mo-heat-ember` (fondo `--forge-cold`, sin halo, escala 1), y al terminar el CSS la enciende. Así el
 * relevo no salta y la brasa sigue siendo del DOM, con su halo en px reales a cualquier tamaño.
 */
export const ForgiaReveal = ({ bg }: ForgiaRevealProps) => {
  const { video, logo, ember } = FORGIA_REVEAL;
  const d = ember.d * logo.w;
  return (
    <GlassLogoReveal
      bg={bg}
      width={video.w}
      height={video.h}
      logo={{ src: "brand/forgia-logo.svg", ...logo }}
      layout={LAYOUT_FORGIA}
      flashColor="#E8D5A8"
      dissolveFrequency="0.0055 0.02"
      plane={{ pos: [0, 0, -5], scale: 34 }}
      overlay={
        <div
          style={{
            position: "absolute",
            left: ember.cx * logo.w - d / 2,
            top: ember.cy * logo.h - d / 2,
            width: d,
            height: d,
            borderRadius: "50%",
            background: ember.cold,
          }}
        />
      }
    />
  );
};
