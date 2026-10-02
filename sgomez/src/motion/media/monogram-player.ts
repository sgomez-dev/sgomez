import { MOTION_ATTR } from "@/motion/boot";
import { needsOpaqueVideo } from "@/chapters/lost/media";
import { MONOGRAM_SRC } from "@/lib/monogram";

/**
 * Reproductor del logotipo de SkyQuetz, sin React. Se carga con `import()` cuando el logotipo está a un viewport (ver
 * MonogramReveal). Precarga el vídeo, lo reproduce UNA vez cuando está listo y la mitad del logotipo está a la vista, y al
 * acabar (o si falla, o si se quita el movimiento) lo retira y devuelve el relevo a la `<img>`. Safari: solo el MP4.
 */
export function startMonogram(root: HTMLElement, cb: { onPlaying(): void; onDone(): void; onOff(): void }): { dispose(): void } {
  const html = document.documentElement;
  const on = () => html.getAttribute(MOTION_ATTR) === "on";
  let ready = false;
  let visible = false;
  let started = false;
  let gone = false;

  const opaque = needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints);
  const v = document.createElement("video");
  const finish = (cbEnd: () => void) => {
    if (gone) return;
    gone = true;
    seen.disconnect();
    mo.disconnect();
    v.pause();
    v.remove();
    cbEnd();
  };
  const tryPlay = () => {
    if (gone || started || !ready || !visible || !on()) return;
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
  v.className = `pointer-events-none absolute inset-0 h-full w-full opacity-0 group-data-[monogram=playing]:opacity-100 ${opaque ? "mix-blend-screen" : ""}`;
  const list = opaque ? ([["video/mp4", MONOGRAM_SRC.mp4]] as const) : ([["video/webm", MONOGRAM_SRC.webm], ["video/mp4", MONOGRAM_SRC.mp4]] as const);
  const last = list
    .map(([type, url]) => {
      const s = document.createElement("source");
      s.src = url;
      s.type = type;
      v.appendChild(s);
      return s;
    })
    .pop()!;
  v.addEventListener("canplaythrough", () => ((ready = true), tryPlay()), { once: true });
  // La <img> se oculta solo cuando ya hay un fotograma pintado, para que no haya un hueco.
  v.addEventListener("playing", () => !gone && cb.onPlaying(), { once: true });
  v.addEventListener("ended", () => finish(cb.onDone), { once: true });
  last.addEventListener("error", () => finish(cb.onOff), { once: true });
  v.addEventListener("error", () => finish(cb.onOff), { once: true });
  root.appendChild(v);
  v.load();

  const seen = new IntersectionObserver(
    ([e]) => {
      visible = !!e?.isIntersecting;
      tryPlay();
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
      v.pause();
      v.remove();
    },
  };
}
