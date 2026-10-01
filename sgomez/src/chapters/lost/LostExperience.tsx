"use client";

import { Component, useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState, type ComponentType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { initial, step, type Event } from "./sequence";
import { gatingPasses, isSoftwareRenderer, needsOpaqueVideo, VIDEO_SRC } from "./media";
import type { SceneProps } from "@/three/ConstellationScene";

/**
 * La experiencia del 404 encima del escenario estático. Es el ÚNICO componente
 * cliente nuevo de la página y solo recibe cadenas: el callback que mueve los
 * enlaces vive aquí dentro, donde están a la vez la escena y los `<a>`.
 *
 * Secuencia (ver `sequence.ts`):
 *  - escritorio: estático, vídeo del estallido, escena 3D viva. El vídeo acaba en
 *    el MISMO fotograma que `poster-end.webp`; la escena (ya construida y con su
 *    primer fotograma pintado) toma el relevo en reposo y se invisibiliza el vídeo.
 *  - móvil: sin vídeo (L5), estático y, cuando la escena está lista, fundido a ella.
 *  - sin WebGL2, con reduced-motion, con Save-Data, con pocos núcleos, sin JS o si
 *    el chunk 3D no carga: el escenario estático completo, con los mismos enlaces.
 */

type Props = {
  lang: string;
  pause: string;
  gyro: string;
};

type VideoState = "idle" | "playing" | "ended" | "error";

const LG = "(min-width: 64rem)";

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function probeWebGL2(): { ok: boolean; software: boolean } {
  try {
    const c = document.createElement("canvas");
    const g = c.getContext("webgl2");
    if (!g) return { ok: false, software: false };
    const info = g.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(g.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    g.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software: isSoftwareRenderer(name) };
  } catch {
    return { ok: false, software: false };
  }
}

type NavigatorExtras = Navigator & { connection?: { saveData?: boolean } };

function readGate() {
  const nav = navigator as NavigatorExtras;
  const gl = probeWebGL2();
  // Solo para pruebas: un init-script pone este indicador para ejercitar la ruta 3D aunque el Chromium de CI pinte por software.
  const forced = (window as { __LOST_FORCE_GATE__?: boolean }).__LOST_FORCE_GATE__ === true;
  return {
    webgl2: gl.ok,
    software: forced ? false : gl.software,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: nav.connection?.saveData === true,
    cores: typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 ? nav.hardwareConcurrency : undefined,
  };
}

type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export default function LostExperience({ lang, pause, gyro }: Props) {
  const [s, dispatch] = useReducer(step, undefined, initial);
  const send = useCallback((e: Event) => dispatch(e), []);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const anchors = useRef(new Map<string, HTMLElement>());

  const [enabled, setEnabled] = useState(false);
  const [desktop, setDesktop] = useState(false);
  // El vídeo se decide UNA vez, al pasar la puerta: nunca se reactiva después.
  const [videoWanted, setVideoWanted] = useState(false);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const videoStateRef = useRef<VideoState>("idle");
  const [opaque, setOpaque] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [videoState, setVideoStateRaw] = useState<VideoState>("idle");
  const setVideoState = useCallback((v: VideoState | ((p: VideoState) => VideoState)) => {
    const n = typeof v === "function" ? v(videoStateRef.current) : v;
    videoStateRef.current = n;
    setVideoStateRaw(n);
  }, []);
  const [videoGone, setVideoGone] = useState(false);
  const [coverScene, setCoverScene] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [gyroOn, setGyroOn] = useState(false);
  const [needsGyroButton, setNeedsGyroButton] = useState(false);
  const [fromVideo, setFromVideo] = useState(false);

  const stage = () => root.current?.closest<HTMLElement>('[data-stage="lost"]') ?? null;

  /** Apaga el vídeo para siempre: lo para, lo desmonta y avisa a la secuencia. */
  const killVideo = useCallback(() => {
    video.current?.pause();
    setVideoState("error");
    setVideoGone(true);
  }, [setVideoState]);

  // 1. Puerta de entrada: nada de esto corre en el servidor ni sin JS.
  useEffect(() => {
    if (!gatingPasses(readGate())) return;
    const lg = matchMedia(LG);
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(true);
    setDesktop(lg.matches);
    setVideoWanted(lg.matches);
    setLayer(root.current?.closest("section")?.querySelector<HTMLElement>("[data-lost-layer]") ?? null);
    setOpaque(needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints));
    if (lg.matches) dispatch("motionAllowed");

    const onLg = () => {
      setDesktop(lg.matches);
      // cruzar el breakpoint con el vídeo sin terminar: se abandona, sin reactivarlo después
      if (videoStateRef.current === "idle" || videoStateRef.current === "playing") {
        killVideo();
        dispatch("videoFailed");
      }
    };
    // quien activa reduced-motion a mitad de visita: sin vídeo ni escena, escenario estático
    const onRm = () => {
      if (!rm.matches) return;
      killVideo();
      dispatch("sceneFailed");
    };
    lg.addEventListener("change", onLg);
    rm.addEventListener("change", onRm);

    const ori = typeof DeviceOrientationEvent !== "undefined" ? (DeviceOrientationEvent as IOSOrientation) : null;
    if (ori) {
      if (typeof ori.requestPermission === "function") setNeedsGyroButton(matchMedia("(pointer: coarse)").matches);
      else if (matchMedia("(pointer: coarse)").matches) setGyroOn(true);
    }
    return () => {
      lg.removeEventListener("change", onLg);
      rm.removeEventListener("change", onRm);
    };
  }, [killVideo]);

  // 2. El chunk 3D se carga EN PARALELO con el vídeo. Si no llega, escenario estático.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    import("@/three/ConstellationScene")
      .then((m) => !cancelled && setScene(() => m.default))
      .catch(() => !cancelled && send("sceneFailed"));
    return () => {
      cancelled = true;
    };
  }, [enabled, send]);

  // 3. El vídeo: la fuente se elige aquí (Safari no puede decidirlo con el orden de <source>).
  const wantsVideo = enabled && videoWanted;
  const showVideo = wantsVideo && !videoGone && !(s.failed && videoState !== "playing");
  const src = opaque ? VIDEO_SRC.mp4 : VIDEO_SRC.webm;
  useEffect(() => {
    const v = video.current;
    if (!v || !wantsVideo) return;
    let off = false;
    const fail = () => {
      if (off || videoStateRef.current !== "idle") return;
      killVideo();
      send("videoFailed");
    };
    // si en 8 s no ha llegado a reproducir, se abandona (play() ya quita `paused`, por eso se mira el estado)
    const timeout = window.setTimeout(fail, 8000);
    v.play().catch(fail);
    return () => {
      off = true;
      window.clearTimeout(timeout);
    };
  }, [wantsVideo, src, send, killVideo]);

  // pausa: el vídeo y la escena se congelan
  useEffect(() => {
    const v = video.current;
    if (!v || videoState !== "playing") return;
    if (s.paused) v.pause();
    else v.play().catch(() => {});
  }, [s.paused, videoState]);

  // 4. Qué cubre a la capa estática
  const scenePhase = s.phase === "scene" || s.phase === "idle";
  const videoCover = videoState === "playing" ? "video" : videoState === "ended" && !s.failed ? "video-end" : "";
  const cover = coverScene && scenePhase ? "scene" : videoCover;

  useLayoutEffect(() => {
    const el = stage();
    if (!el) return;
    el.dataset.lostPhase = s.phase;
    if (cover) el.dataset.lostCover = cover;
    else delete el.dataset.lostCover;
    if (s.paused) el.dataset.lostPaused = "";
    else delete el.dataset.lostPaused;
  }, [s.phase, cover, s.paused]);

  // relevo: el vídeo desaparece cuando el lienzo ya pintó; sin vídeo, fundido de 200 ms y luego se retira lo estático
  useEffect(() => {
    if (!scenePhase) return;
    const viaVideo = videoState === "ended" || videoState === "playing";
    setFromVideo(viaVideo);
    if (viaVideo) {
      setCoverScene(true);
      const r1 = requestAnimationFrame(() => requestAnimationFrame(() => setVideoGone(true)));
      const t = window.setTimeout(() => send("settled"), 300);
      return () => {
        cancelAnimationFrame(r1);
        window.clearTimeout(t);
      };
    }
    const t1 = window.setTimeout(() => setCoverScene(true), 220);
    const t2 = window.setTimeout(() => send("settled"), 450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // solo reacciona al paso a escena
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenePhase]);

  // si la escena falla, el escenario estático vuelve entero y los enlaces a su sitio
  useEffect(() => {
    if (!s.failed) return;
    setScene(null);
    setCoverScene(false);
    anchors.current.forEach((a) => (a.style.transform = ""));
    setHighlight("");
  }, [s.failed]);

  // 5. Los enlaces SON los `<a>` del escenario: se localizan una vez y se mueven con transform
  useEffect(() => {
    const el = stage();
    if (!el || !enabled) return;
    const map = anchors.current;
    el.querySelectorAll<HTMLElement>("a[data-shard-id]").forEach((a) => map.set(a.dataset.shardId!, a));
    const idOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>("a[data-shard-id]")?.dataset.shardId ?? "" : "");
    const on = (e: globalThis.Event) => setHighlight(idOf(e.target));
    const off = (e: globalThis.Event) => {
      if (idOf(e.target)) setHighlight("");
    };
    el.addEventListener("pointerover", on);
    el.addEventListener("pointerout", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("pointerover", on);
      el.removeEventListener("pointerout", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      map.forEach((a) => (a.style.transform = ""));
      map.clear();
    };
  }, [enabled]);

  const onProject = useCallback((id: string, dx: number, dy: number) => {
    const a = anchors.current.get(id);
    if (a) a.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
  }, []);
  const onReady = useCallback(() => send("sceneReady"), [send]);
  const onFail = useCallback(() => send("sceneFailed"), [send]);

  const askGyro = async () => {
    try {
      const r = await (DeviceOrientationEvent as IOSOrientation).requestPermission?.();
      if (r === "granted") setGyroOn(true);
    } catch {
      /* sin permiso: se queda con el puntero */
    }
    setNeedsGyroButton(false);
  };

  const motion = s.phase !== "static" && !s.failed;
  const layout = desktop ? "desktop" : "mobile";
  const canvasVisible = scenePhase && !s.failed;

  const videoEl = showVideo ? (
        <video
          ref={video}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          data-lost-video={opaque ? "mp4" : "webm"}
          className="absolute inset-0 hidden h-full w-full object-fill lg:block"
          style={{
            mixBlendMode: opaque ? "screen" : undefined,
            opacity: videoState === "idle" || videoState === "error" ? 0 : 1,
          }}
          onPlaying={(e) => {
            const v = e.currentTarget;
            const go = () => setVideoState((p) => (p === "idle" ? "playing" : p));
            if (videoStateRef.current === "error") return;
            // el primer fotograma ya pintado, para no dejar un hueco entre póster y vídeo
            if ("requestVideoFrameCallback" in v) (v as HTMLVideoElement).requestVideoFrameCallback(go);
            else go();
          }}
          onEnded={() => {
            if (videoStateRef.current === "error") return;
            setVideoState("ended");
            send("videoEnded");
          }}
          onError={() => {
            if (videoStateRef.current === "error") return;
            killVideo();
            send("videoFailed");
          }}
        />
  ) : null;
  const canvasEl = Scene && !s.failed ? (
        <div
          data-lost-canvas=""
          className="absolute inset-0"
          style={{ opacity: canvasVisible ? 1 : 0, transition: fromVideo ? "none" : "opacity 200ms ease-out" }}
        >
          <Boundary onError={onFail}>
            <Scene
              layout={layout}
              highlightId={highlight}
              paused={s.paused}
              live={scenePhase}
              gyro={gyroOn}
              onReady={onReady}
              onFail={onFail}
              onProject={onProject}
            />
          </Boundary>
        </div>
  ) : null;

  // L8: en escritorio vídeo y lienzo viven en una capa hermana del escenario (sin transform ni z-index) y pintan bajo el texto.
  const inLayer = layer !== null && desktop;
  const media = (
    <>
      {videoEl}
      {canvasEl}
    </>
  );

  return (
    <div ref={root} lang={lang} className="pointer-events-none absolute inset-0">
      {inLayer ? createPortal(media, layer) : media}

      {motion ? (
        <div className="pointer-events-auto absolute bottom-2 right-2 z-20 flex flex-wrap justify-end gap-2">
          {needsGyroButton && scenePhase ? (
            <button type="button" onClick={askGyro} className={BTN}>
              {gyro}
            </button>
          ) : null}
          <button type="button" aria-pressed={s.paused} onClick={() => send(s.paused ? "resume" : "pause")} className={BTN}>
            <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" className="mr-2 fill-current">
              {s.paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2h3v12h-3zm6 0h3v12h-3z" />}
            </svg>
            {pause}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const BTN =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/[0.16] bg-[rgba(11,13,20,0.8)] px-4 py-2 text-[length:var(--step--1)] font-medium text-[color:var(--text)] transition-colors hover:border-[color:var(--light-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
