import { preload } from "react-dom";
import { imageProps } from "@/lib/image-props";

/**
 * Retrato del hero (es el LCP, de ahí `priority`). Desde la v4 es una foto 4:5 en su ventana de Santander, recortada
 * para que no se vea la pantalla del portátil. Va en un marco de porcelana en relieve (el padre pone tamaño y sitio).
 */
/**
 * Ancho real del retrato en cada diseño del hero (el 76 % del cuadro del cristal): 244 px en móvil, 236 px como
 * máximo en horizontal corto (`sl`) y hasta 425 px desde `lg`. Van en píxeles y no en `vw`: la precarga y la
 * imagen evalúan `vw` sobre viewports distintos en un móvil real, eligen candidatos distintos y el retrato (el LCP)
 * se descargaba dos veces.
 */
export const PORTRAIT_SIZES = "(min-width:1024px) 425px, (min-width:700px) and (max-height:500px) 236px, 244px";

export default function Portrait({ alt, className = "" }: { alt: string; className?: string }) {
  // Un <img> normal y no <Image>: sin el componente de cliente de next/image en el JS inicial (unos 7 KB). <Image priority>
  // precargaba la imagen; aquí se hace a mano con los mismos srcset y sizes, y con fetchPriority="high".
  const props = imageProps({
    src: "/Santiago_Gómez_de_la_Torre_Romero.jpg",
    alt,
    width: 1080,
    height: 1350,
    priority: true,
    fetchPriority: "high",
    sizes: PORTRAIT_SIZES,
  });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high" });
  return (
    <div data-motion="portrait" className={`aspect-[4/5] rounded-[30px] bg-[color:var(--bg)] p-2.5 shadow-[16px_16px_40px_var(--lo),-16px_-16px_40px_var(--hi)] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- imageProps ya trae el srcset del optimizador */}
      <img {...props} alt={alt} className="h-full w-full rounded-[22px] object-cover object-[50%_30%]" />
    </div>
  );
}
