import { MOTION_ATTR } from "@/motion/boot";
import type { reelSources } from "@/lib/reels";

type Src = ReturnType<typeof reelSources>;

/**
 * Reproductor del reel de un proyecto, sin React. Se carga con `import()` solo cuando la ficha está a un viewport (ver
 * ProjectReel). Crea el `<video>` (`preload="none"`, mudo, en bucle) la primera vez que la caja entra en pantalla, lo
 * reproduce en pantalla y lo pausa fuera o con la pestaña oculta. Quitar el movimiento a mitad de visita lo retira.
 */
export function startReel(root: HTMLElement, src: Src, cb: { onLive(): void; onOff(): void }): { dispose(): void } {
  const html = document.documentElement;
  const on = () => html.getAttribute(MOTION_ATTR) === "on";
  let video: HTMLVideoElement | null = null;
  let intersecting = false;
  let gone = false;

  const stop = () => {
    if (gone) return;
    gone = true;
    io.disconnect();
    video?.pause();
    video?.remove();
    video = null;
    cb.onOff();
  };
  const make = () => {
    const v = document.createElement("video");
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "none";
    v.disablePictureInPicture = true;
    v.setAttribute("disableremoteplayback", "");
    v.setAttribute("aria-hidden", "true");
    v.tabIndex = -1;
    v.poster = src.poster;
    v.setAttribute("data-reel-video", "");
    v.className = "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-data-[reel=live]:opacity-100";
    const last = [["video/webm", src.webm], ["video/mp4", src.mp4]]
      .map(([type, url]) => {
        const s = document.createElement("source");
        s.src = url!;
        s.type = type!;
        v.appendChild(s);
        return s;
      })
      .pop()!;
    v.addEventListener("playing", () => !gone && cb.onLive(), { once: true });
    // Un fallo de la primera fuente solo hace probar la siguiente: se abandona cuando falla la última.
    last.addEventListener("error", stop, { once: true });
    v.addEventListener("error", stop, { once: true });
    root.appendChild(v);
    return v;
  };
  const sync = () => {
    if (gone) return;
    if (!intersecting || document.hidden || !on()) return void video?.pause();
    if (!video) video = make();
    video.play().catch(() => {});
  };
  const io = new IntersectionObserver(([e]) => {
    intersecting = !!e?.isIntersecting;
    sync();
  });
  io.observe(root);
  document.addEventListener("visibilitychange", sync);
  const mo = new MutationObserver(() => !on() && stop());
  mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
  return {
    dispose() {
      gone = true;
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video?.pause();
      video?.remove();
    },
  };
}
