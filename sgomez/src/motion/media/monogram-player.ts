import { MOTION_ATTR } from "@/motion/boot";
import { needsOpaqueVideo } from "@/chapters/lost/media";
import { FORGIA_REVEAL, MONOGRAM_SRC, forgiaVideoBox } from "@/lib/monogram";
import { releaseVideo } from "./release";

/**
 * Reproductor del logotipo que se forma con cristal (SkyQuetz y Forgia), sin React. La `<img>` de Forgia lleva
 * `data-reveal="forgia"`: su vídeo es más grande que la imagen (ver FORGIA_REVEAL) y se coloca con `forgiaVideoBox`.
 * El de SkyQuetz cubre la imagen justa. Se carga con `import()` cuando el logotipo está a un viewport (ver
 * MonogramReveal). Precarga el vídeo y lo reproduce UNA vez cuando la mitad del logotipo está a la vista (sin esperar a
 * `canplaythrough`, que en iOS puede no llegar: se llama a `play()` y arranca cuando tenga datos), y al
 * acabar (o si falla, o si se quita el movimiento) lo suelta y devuelve el relevo a la `<img>`. Safari: solo el MP4.
 *
 * El `<video>` no entra en el documento hasta `playing`: un `<video>` con opacity 0 que pinta su primer fotograma cuenta como
 * candidato a LCP (ver hero-loop-player.ts), y antes de empezar no hay nada que enseñar. Suelto reproduce igual.
 */
/**
 * El navegador redondea por su lado la posición de la `<img>` y la del `<video>` al pintarlos. El vídeo de
 * Forgia empieza unos 24 px por encima de la imagen y 16 a la izquierda (no enteros), así que los dos redondeos pueden
 * separar el logotipo del vídeo y el de la imagen un píxel CSS entero, que se ve como un salto en el relevo. Se mueve el
 * vídeo (menos de un píxel) a un píxel CSS entero, a la distancia redondeada de la imagen. Medido en Chromium a 1440 y
 * a 375: el error baja de 2 o 3 píxeles de pantalla a 1 como mucho (ver forgia-reveal en docs/superpowers/progress).
 */
function snap(v: HTMLVideoElement, img: HTMLImageElement | null) {
  if (!img) return;
  const i = img.getBoundingClientRect();
  const b = v.getBoundingClientRect();
  const at = (iv: number, vv: number) => Math.round(iv) - Math.round(iv - vv) - vv;
  v.style.translate = `${at(i.left, b.left).toFixed(3)}px ${at(i.top, b.top).toFixed(3)}px`;
}

export function startMonogram(root: HTMLElement, cb: { onPlaying(): void; onDone(): void; onOff(): void }): { dispose(): void } {
  const html = document.documentElement;
  const on = () => html.getAttribute(MOTION_ATTR) === "on";
  let started = false;
  let gone = false;

  const opaque = needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints);
  const forgia = root.querySelector("img[data-reveal]")?.getAttribute("data-reveal") === "forgia";
  const src = forgia ? FORGIA_REVEAL : MONOGRAM_SRC;
  const v = document.createElement("video");
  const finish = (cbEnd: () => void) => {
    if (gone) return;
    gone = true;
    seen.disconnect();
    mo.disconnect();
    releaseVideo(v);
    cbEnd();
  };
  const play = () => {
    if (gone || started || !on()) return;
    started = true;
    v.play().catch(() => finish(cb.onOff));
  };
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.disablePictureInPicture = true;
  v.setAttribute("disableremoteplayback", "");
  v.setAttribute("aria-hidden", "true");
  v.tabIndex = -1;
  v.setAttribute("data-monogram-video", "");
  v.className = `pointer-events-none absolute inset-0 h-full w-full max-w-none opacity-0 group-data-[monogram=playing]:opacity-100 ${opaque ? "mix-blend-screen" : ""}`;
  if (forgia) Object.assign(v.style, forgiaVideoBox());
  const list = opaque ? ([["video/mp4", src.mp4]] as const) : ([["video/webm", src.webm], ["video/mp4", src.mp4]] as const);
  const last = list
    .map(([type, url]) => {
      const s = document.createElement("source");
      s.src = url;
      s.type = type;
      v.appendChild(s);
      return s;
    })
    .pop()!;
  // Entra en el documento ya con un fotograma decodificado y la <img> se oculta un fotograma después, para que no haya un hueco.
  v.addEventListener(
    "playing",
    () => {
      if (gone) return;
      root.appendChild(v);
      if (forgia) snap(v, root.querySelector("img"));
      const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
      const shown = () => !gone && cb.onPlaying();
      if (rvfc) rvfc.call(v, shown);
      else requestAnimationFrame(shown);
    },
    { once: true },
  );
  v.addEventListener("ended", () => finish(cb.onDone), { once: true });
  last.addEventListener("error", () => finish(cb.onOff), { once: true });
  v.addEventListener("error", () => finish(cb.onOff), { once: true });
  v.load();

  const seen = new IntersectionObserver(
    ([e]) => {
      if (e?.isIntersecting) play();
    },
    { threshold: 0.5 },
  );
  seen.observe(root);
  const mo = new MutationObserver(() => !on() && finish(cb.onOff));
  mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
  return {
    dispose() {
      gone = true;
      seen.disconnect();
      mo.disconnect();
      releaseVideo(v);
    },
  };
}
