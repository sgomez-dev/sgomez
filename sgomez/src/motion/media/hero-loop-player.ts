import { LG_QUERY } from "@/lib/three/gate";
import { MOTION_ATTR } from "@/motion/boot";
import { needsOpaqueVideo } from "@/chapters/lost/media";
import { HERO_LOOP_SRC } from "@/lib/hero-loop";
import { releaseVideo } from "./release";

export type HeroLoopHandle = { setPaused(p: boolean): void; dispose(): void };

/**
 * Reproductor del bucle del hero, sin React. Se carga con `import()` tras `load` y un hueco ocioso, y solo por debajo de lg
 * (ver HeroLoop). El `<video>` NO se añade al documento: una vez pintado, Chrome lo cuenta como candidato a LCP aunque tenga
 * opacity 0 (medido: el LCP móvil simulado pasaba de 3,3 s a 6,5 s). Sus fotogramas se copian a un `<canvas>` visible, que no
 * es candidato. Cruzar a lg o quitar el movimiento lo retira.
 */
export function startHeroLoop(root: HTMLElement, cb: { label: string; onLive(): void; onOff(): void }): HeroLoopHandle {
  const html = document.documentElement;
  const lg = matchMedia(LG_QUERY);
  const allowed = () => html.getAttribute(MOTION_ATTR) === "on" && !lg.matches;
  const opaque = needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints);
  let intersecting = false;
  let userPaused = false;
  let gone = false;
  let raf = 0;
  let live = false;
  /** Hay una copia a lienzo ya pedida (por rvfc o rAF) y sin ejecutar. */
  let pending = false;
  let btn: HTMLButtonElement | null = null;

  const v = document.createElement("video");
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  const rvfc = (v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;

  const teardown = () => {
    gone = true;
    io.disconnect();
    mo.disconnect();
    lg.removeEventListener("change", check);
    document.removeEventListener("visibilitychange", sync);
    cancelAnimationFrame(raf);
    // El botón se va con el bucle: nunca queda un control enfocable dentro del `aria-hidden` de HeroLoop.
    btn?.remove();
    btn = null;
    canvas.remove();
    releaseVideo(v);
  };
  const stop = () => {
    if (gone) return;
    teardown();
    cb.onOff();
  };
  /** «Pausar movimiento» (spec §6: el bucle dura más de 5 s). Mismo aspecto que el del cristal en vivo. */
  const pauseButton = () => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.style.pointerEvents = "auto";
    b.className =
      "absolute right-0 top-full z-10 mt-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/[0.16] bg-[rgba(11,13,20,0.8)] px-4 py-2 text-[length:var(--step--1)] font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--light-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
    const icon = (paused: boolean) =>
      `<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" class="mr-2 fill-current"><path d="${paused ? "M4 2.5v11l9-5.5z" : "M3.5 2h3v12h-3zm6 0h3v12h-3z"}"/></svg>`;
    b.innerHTML = icon(false);
    b.append(cb.label);
    b.addEventListener("click", () => {
      userPaused = !userPaused;
      b.setAttribute("aria-pressed", String(userPaused));
      b.querySelector("svg")!.outerHTML = icon(userPaused);
      sync();
    });
    return b;
  };
  const check = () => !allowed() && stop();
  const sync = () => {
    if (gone) return;
    if (intersecting && !document.hidden && !userPaused) v.play().catch(() => {});
    else v.pause();
  };
  const next = (fn: () => void) => {
    pending = true;
    const run = () => {
      pending = false;
      fn();
    };
    if (rvfc) rvfc.call(v, run);
    else raf = requestAnimationFrame(run);
  };
  /** Una sola espera, fuera de la cadena de copias a lienzo. */
  const afterFrame = (fn: () => void) => {
    if (rvfc) rvfc.call(v, fn);
    else requestAnimationFrame(fn);
  };
  const tick = () => {
    if (gone) return;
    ctx?.clearRect(0, 0, 720, 720);
    ctx?.drawImage(v, 0, 0, 720, 720);
    // En pausa el respaldo con rAF se para (no hay fotogramas nuevos que copiar); `play` lo reanuda.
    if (!v.paused) next(tick);
  };

  v.muted = true;
  v.defaultMuted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = "none";
  v.disablePictureInPicture = true;
  v.setAttribute("disableremoteplayback", "");
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("data-hero-loop-canvas", "");
  canvas.className = `pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 group-data-[hero-loop=live]:opacity-100 ${opaque ? "mix-blend-screen" : ""}`;
  const list = opaque ? ([["video/mp4", HERO_LOOP_SRC.mp4]] as const) : ([["video/webm", HERO_LOOP_SRC.webm], ["video/mp4", HERO_LOOP_SRC.mp4]] as const);
  const last = list
    .map(([type, url]) => {
      const s = document.createElement("source");
      s.src = url;
      s.type = type;
      v.appendChild(s);
      return s;
    })
    .pop()!;
  v.addEventListener("play", () => {
    root.setAttribute("data-playing", "true");
    if (live && !pending && !gone) next(tick);
  });
  v.addEventListener("pause", () => root.setAttribute("data-playing", "false"));
  v.addEventListener(
    "playing",
    () => {
      live = true;
      tick();
      // el primer fotograma ya está en el lienzo cuando se enciende
      afterFrame(() => {
        if (gone) return;
        root.appendChild((btn = pauseButton()));
        cb.onLive();
      });
    },
    { once: true },
  );
  last.addEventListener("error", stop, { once: true });
  v.addEventListener("error", stop, { once: true });
  root.appendChild(canvas);

  const io = new IntersectionObserver(([e]) => {
    intersecting = !!e?.isIntersecting;
    sync();
  });
  io.observe(root);
  document.addEventListener("visibilitychange", sync);
  const mo = new MutationObserver(check);
  mo.observe(html, { attributes: true, attributeFilter: [MOTION_ATTR] });
  lg.addEventListener("change", check);

  return {
    setPaused(p) {
      userPaused = p;
      sync();
    },
    dispose() {
      if (!gone) teardown();
    },
  };
}
