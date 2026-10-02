import { MOTION_ATTR } from "@/motion/boot";
import type { reelSources } from "@/lib/reels";
import { releaseVideo } from "./release";

type Src = ReturnType<typeof reelSources>;

/**
 * Reproductor del reel de un proyecto, sin React. Se carga con `import()` solo con puntero fino y hover (ver ProjectReel).
 * El reel solo se reproduce a petición (WCAG 2.2.2): con `pointerenter` o `focusin` de la ficha. El `<video>` se crea en la
 * primera interacción (`preload="none"`, mudo, en bucle); al salir se pausa y vuelve al fotograma 0, sin destruirlo. En táctil,
 * con movimiento reducido o con Save-Data este módulo no llega a cargarse y solo hay póster.
 */
export function startReel(root: HTMLElement, src: Src, cb: { onLive(): void; onOff(): void }): { dispose(): void } {
  const html = document.documentElement;
  const on = () => html.getAttribute(MOTION_ATTR) === "on";
  // La ficha entera es un enlace: el hover y el foco de cualquiera de sus partes cuentan. En la página del caso, el propio reel.
  const card: HTMLElement = root.closest("a") ?? root;
  let video: HTMLVideoElement | null = null;
  let gone = false;

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
  const play = () => {
    if (gone || !on() || document.hidden) return;
    video ??= make();
    video.play().catch(() => {});
  };
  /** Pausa y vuelve al fotograma 0 (el del póster) sin destruir el vídeo: la siguiente vez arranca al instante. */
  const rest = () => {
    if (!video) return;
    video.pause();
    if (video.readyState > 0) video.currentTime = 0;
  };
  const leave = (e: Event) => {
    // focusout hacia otro elemento de la misma ficha no es salir
    const to = (e as FocusEvent).relatedTarget as Node | null;
    if (e.type === "focusout" && to && card.contains(to)) return;
    rest();
  };
  const hidden = () => document.hidden && rest();
  function stop() {
    if (gone) return;
    teardown();
    cb.onOff();
  }
  function teardown() {
    gone = true;
    mo.disconnect();
    card.removeEventListener("pointerenter", play);
    card.removeEventListener("focusin", play);
    card.removeEventListener("pointerleave", leave);
    card.removeEventListener("focusout", leave);
    document.removeEventListener("visibilitychange", hidden);
    if (video) releaseVideo(video);
    video = null;
  }
  card.addEventListener("pointerenter", play);
  card.addEventListener("focusin", play);
  card.addEventListener("pointerleave", leave);
  card.addEventListener("focusout", leave);
  document.addEventListener("visibilitychange", hidden);
  // El puntero o el foco pueden haber entrado en la ficha antes de que este módulo terminara de cargar.
  if (card.matches(":hover") || card.contains(document.activeElement)) play();
  const mo = new MutationObserver(() => !on() && stop());
  mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
  return {
    dispose() {
      if (!gone) teardown();
    },
  };
}
