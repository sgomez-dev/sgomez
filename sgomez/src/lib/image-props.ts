import type { ImageProps } from "next/dist/shared/lib/get-img-props";
import { getImageProps } from "next/dist/shared/lib/image-external-get-image-props";

/**
 * Las props de un `<img>` normal con el srcset del optimizador de Next, para los componentes de servidor (Portrait,
 * SkyQuetz, LatestPosts). Es `getImageProps` de `next/image`, pero importado desde su propio módulo: `next/image`
 * arrastra el componente de cliente `Image` (unos 7 KB gzip) al JS inicial aunque solo se use `getImageProps`.
 *
 * Usa un módulo interno de Next, así que Next está fijado a una versión exacta en package.json y
 * `tests/image-props.test.ts` comprueba que la salida sigue siendo la de `next/image`.
 */
export function imageProps(imgProps: ImageProps) {
  return getImageProps(imgProps).props;
}
