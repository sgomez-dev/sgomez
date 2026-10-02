"use client";

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { initial, step, type Event } from "./sequence";
import { needsOpaqueVideo, VIDEO_SRC } from "./media";
import { LG_QUERY, glassGatePasses, readGlassEnv } from "@/lib/three/gate";
import { PROJECTED_IDS, type ToWorker } from "@/three/protocol";

/**
 * La experiencia del 404 encima del escenario estático. Es el ÚNICO componente
 * cliente nuevo de la página y solo recibe cadenas. La escena vive en el worker del
 * cristal (`glass-client`): aquí solo hay postMessage, y el mensaje con los
 * desplazamientos de los fragmentos mueve los `<a>`, que están en este hilo.
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
};

type VideoState = "idle" | "playing" | "ended" | "error";

type Handle = { resize(w: number, h: number, dpr: number): void; visible(v: boolean): void; send(m: ToWorker): void; dispose(): void };
type Client = typeof import("@/three/glass-client");

export default function LostExperience({ lang, pause }: Props) {
  const [s, dispatch] = useReducer(step, undefined, initial);
  const send = useCallback((e: Event) => dispatch(e), []);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const anchors = useRef(new Map<string, HTMLElement>());

  const [enabled, setEnabled] = useState(false);
  // El vídeo se decide UNA vez, al pasar la puerta: nunca se reactiva después.
  const [videoWanted, setVideoWanted] = useState(false);
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const videoStateRef = useRef<VideoState>("idle");
  const [opaque, setOpaque] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const client = useRef<Client | null>(null);
  const glass = useRef<Handle | null>(null);
  const latest = useRef<ToWorker>({ type: "lost", live: false, highlightId: "", linesOn: false });
  const pausedRef = useRef(false);
  const [videoState, setVideoStateRaw] = useState<VideoState>("idle");
  const setVideoState = useCallback((v: VideoState | ((p: VideoState) => VideoState)) => {
    const n = typeof v === "function" ? v(videoStateRef.current) : v;
    videoStateRef.current = n;
    setVideoStateRaw(n);
  }, []);
  const [videoGone, setVideoGone] = useState(false);
  const [coverScene, setCoverScene] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [fromVideo, setFromVideo] = useState(false);
  const [linesBack, setLinesBack] = useState(false);
  const [videoFading, setVideoFading] = useState(false);

  const stage = () => root.current?.closest<HTMLElement>('[data-stage="lost"]') ?? null;

  /** Apaga el vídeo para siempre: lo para, lo desmonta y avisa a la secuencia. */
  const killVideo = useCallback(() => {
    video.current?.pause();
    setVideoState("error");
    setVideoGone(true);
  }, [setVideoState]);

  // 1. Puerta de entrada: nada de esto corre en el servidor ni sin JS. Por debajo de lg la puerta falla: escenario estático
  // (sin worker, sin lienzo). La sonda de WebGL2 y de renderizador por software la hace el worker; su fallo llega como `fail`.
  useEffect(() => {
    const lg = matchMedia(LG_QUERY);
    if (!glassGatePasses(readGlassEnv())) return;
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(true);
    setVideoWanted(true);
    // la capa se decide UNA vez
    setLayer(root.current?.closest("section")?.querySelector<HTMLElement>("[data-lost-layer]") ?? null);
    setOpaque(needsOpaqueVideo(navigator.userAgent, navigator.maxTouchPoints));
    dispatch("motionAllowed");

    // cruzar a móvil tras la puerta: la capa queda oculta, así que escenario estático
    const onLg = () => {
      if (lg.matches) return;
      killVideo();
      dispatch("sceneFailed");
    };
    // quien activa reduced-motion a mitad de visita: sin vídeo ni escena, escenario estático
    const onRm = () => {
      if (!rm.matches) return;
      killVideo();
      dispatch("sceneFailed");
    };
    lg.addEventListener("change", onLg);
    rm.addEventListener("change", onRm);
    return () => {
      lg.removeEventListener("change", onLg);
      rm.removeEventListener("change", onRm);
    };
  }, [killVideo]);

  // 2. El worker del cristal se monta en PARALELO con el vídeo, tras `load` y un hueco ocioso. El `<canvas>` lo crea y lo quita este
  // efecto (solo puede pasar una vez a `transferControlToOffscreen` y StrictMode ejecuta los efectos dos veces). Si no llega o
  // falla, escenario estático.
  useEffect(() => {
    if (!enabled || !host) return;
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    let el: HTMLCanvasElement | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let sendVisible = () => {};
    const load = () => {
      import("@/three/glass-client")
        .then((c) => {
          if (cancelled) return;
          client.current = c;
          const canvas = document.createElement("canvas");
          canvas.setAttribute("aria-hidden", "true");
          canvas.className = "absolute inset-0 h-full w-full";
          host.appendChild(canvas);
          el = canvas;
          const r = host.getBoundingClientRect();
          const h = c.mountGlass(
            canvas,
            { id: "lost", width: Math.round(r.width), height: Math.round(r.height), dpr: devicePixelRatio, force: (window as { __LOST_FORCE_GATE__?: boolean }).__LOST_FORCE_GATE__ === true },
            (m) => {
              if (m.type === "ready") send("sceneReady");
              else if (m.type === "project") {
                for (let i = 0; i < PROJECTED_IDS.length; i++) {
                  const a = anchors.current.get(PROJECTED_IDS[i]!);
                  if (a) a.style.transform = `translate3d(${m.offsets[2 * i]!.toFixed(1)}px,${m.offsets[2 * i + 1]!.toFixed(1)}px,0)`;
                }
              } else send("sceneFailed");
            },
          );
          glass.current = h;
          c.setPaused(pausedRef.current);
          h.send(latest.current);
          ro = new ResizeObserver(([e]) => e && h.resize(Math.round(e.contentRect.width), Math.round(e.contentRect.height), devicePixelRatio));
          ro.observe(host);
          let intersecting = true;
          sendVisible = () => h.visible(intersecting && !document.hidden);
          io = new IntersectionObserver(([e]) => {
            intersecting = !!e?.isIntersecting;
            sendVisible();
          });
          io.observe(host);
          document.addEventListener("visibilitychange", sendVisible);
        })
        .catch(() => !cancelled && send("sceneFailed"));
    };
    const schedule = () => {
      if (typeof requestIdleCallback === "function") idle = requestIdleCallback(load, { timeout: 3000 });
      else timer = window.setTimeout(load, 300);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle && typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", sendVisible);
      ro?.disconnect();
      io?.disconnect();
      glass.current?.dispose();
      glass.current = null;
      el?.remove();
    };
  }, [enabled, host, send]);

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
    if (videoState === "playing") el.dataset.lostLines = linesBack ? "in" : "out";
    else delete el.dataset.lostLines;
  }, [s.phase, cover, s.paused, videoState, linesBack]);

  // relevo: el vídeo se funde en 300 ms sobre el lienzo, que ya pinta los mismos fragmentos en el mismo sitio (medido en la
  // Task 8: sin salto de posición, pero el 3D sale un 22 % más brillante y un corte seco se veía como un fogonazo);
  // sin vídeo, fundido de 200 ms y luego se retira lo estático
  useEffect(() => {
    if (!scenePhase) return;
    const viaVideo = videoState === "ended" || videoState === "playing";
    setFromVideo(viaVideo);
    if (viaVideo) {
      setCoverScene(true);
      const r1 = requestAnimationFrame(() => requestAnimationFrame(() => setVideoFading(true)));
      const gone = window.setTimeout(() => setVideoGone(true), 360);
      const t = window.setTimeout(() => send("settled"), 380);
      return () => {
        cancelAnimationFrame(r1);
        window.clearTimeout(gone);
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

  // si la escena falla, el escenario estático vuelve entero y los enlaces a su sitio (sin lienzo, el efecto 2 desmonta el worker)
  useEffect(() => {
    if (!s.failed) return;
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

  // El estado del 404 para el worker. `linesOn` ya vale desde el primer mensaje del relevo (no espera al `fromVideo` enganchado), para
  // que no haya un fotograma con las líneas a 0 entre los dos.
  const linesOn = fromVideo || (scenePhase && (videoState === "ended" || videoState === "playing"));
  useEffect(() => {
    latest.current = { type: "lost", live: scenePhase, highlightId: highlight, linesOn };
    glass.current?.send(latest.current);
  }, [scenePhase, highlight, linesOn]);
  // la pausa del 404 es la única de su página: se comparte con el cliente del cristal
  useEffect(() => {
    pausedRef.current = s.paused;
    client.current?.setPaused(s.paused);
  }, [s.paused]);

  const motion = s.phase !== "static" && !s.failed;
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
            opacity: videoState === "idle" || videoState === "error" || videoFading ? 0 : 1,
            transition: videoFading ? "opacity 300ms ease-out" : undefined,
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration - v.currentTime <= 0.45) setLinesBack(true);
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
  const canvasEl =
    enabled && !s.failed ? (
      <div
        ref={setHost}
        data-lost-canvas=""
        className="absolute inset-0"
        style={{ opacity: canvasVisible ? 1 : 0, transition: fromVideo ? "none" : "opacity 200ms ease-out" }}
      />
    ) : null;

  // L8: en escritorio vídeo y lienzo viven en una capa hermana del escenario (sin transform ni z-index) y pintan bajo el texto.
  const inLayer = layer !== null;
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
