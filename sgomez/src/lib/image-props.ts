import { getImgProps, type ImageProps } from "next/dist/shared/lib/get-img-props";
import defaultLoader from "next/dist/shared/lib/image-loader";

/**
 * Las props de un `<img>` normal con el srcset del optimizador de Next, para los componentes de servidor (Portrait,
 * SkyQuetz, LatestPosts). Es lo que hace `getImageProps` de `next/image`, pero importando `get-img-props` directamente:
 * `next/image` arrastra el componente de cliente `Image` (unos 7 KB gzip) al JS inicial aunque solo se use `getImageProps`.
 *
 * Usa un módulo interno de Next, así que Next está fijado a una versión exacta en package.json y
 * `tests/image-props.test.ts` comprueba que la salida sigue siendo la de `next/image`.
 */
export function imageProps(imgProps: ImageProps) {
  const { props } = getImgProps(imgProps, {
    defaultLoader,
    // Next lo sustituye al compilar por la configuración de `images`; sin él (vitest) valen los valores por defecto.
    imgConf: process.env.__NEXT_IMAGE_OPTS as never,
  });
  for (const [key, value] of Object.entries(props)) if (value === undefined) delete (props as Record<string, unknown>)[key];
  return props;
}
