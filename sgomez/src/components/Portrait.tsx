import { preload } from "react-dom";
import { imageProps } from "@/lib/image-props";

/**
 * Retrato del hero (es el LCP, de ahí `priority`). La foto actual es un recorte
 * sobre un círculo azul marino y es provisional: la máscara radial deja el pelo
 * y la cara intactos y disuelve el borde del círculo, de modo que se lee como
 * un halo intencional en vez de un disco recortado.
 */
/**
 * Ancho real del retrato en cada diseño del hero (el 70 % del cuadro del
 * cristal): 224 px en móvil, 217 px como máximo en horizontal corto (`sl`) y
 * entre 260 y 325 px desde `lg`. Van en píxeles y no en `vw`: la precarga y la
 * imagen evalúan `vw` sobre viewports distintos en un móvil real, eligen
 * candidatos distintos y el retrato (el LCP) se descargaba dos veces.
 */
export const PORTRAIT_SIZES = "(min-width:1024px) 325px, (min-width:700px) and (max-height:500px) 217px, 224px";

export default function Portrait({ alt, className = "" }: { alt: string; className?: string }) {
  // Un <img> normal y no <Image>: sin el componente de cliente de next/image en el JS inicial (unos 7 KB). <Image priority>
  // precargaba la imagen; aquí se hace a mano con los mismos srcset y sizes, y con fetchPriority="high".
  const props = imageProps({
    src: "/Santiago_Gómez_de_la_Torre_Romero.png",
    alt,
    width: 1080,
    height: 1080,
    priority: true,
    fetchPriority: "high",
    sizes: PORTRAIT_SIZES,
  });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high" });
  return (
    <div
      data-motion="portrait"
      className={`aspect-square ${className}`}
      style={{
        WebkitMaskImage: "radial-gradient(closest-side, #000 76%, transparent 89%)",
        maskImage: "radial-gradient(closest-side, #000 76%, transparent 89%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- imageProps ya trae el srcset del optimizador */}
      <img {...props} className="h-full w-full object-contain" style={{ ...props.style, filter: "saturate(.9) contrast(1.05)" }} />
    </div>
  );
}
