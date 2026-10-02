import { gatingPasses } from "@/chapters/lost/media";
import type { GlassEnv } from "@/lib/three/gate";
import { framePath, type SequenceManifest, type SizeKey } from "./manifest";

/** Marca para el test de pesos: este módulo es el chunk perezoso del reproductor. */
export const PLAYER_MARK = "sgomez-scroll-sequence";

/** Un fotograma de cada COARSE_STEP se descarga primero: con eso solo ya hay una imagen razonable en cualquier punto. */
export const COARSE_STEP = 4;
const CONCURRENCY = 6;
const MAX_DPR = 2;

/** Movimiento permitido, sin Save-Data y un equipo capaz. A diferencia del cristal no exige lg ni OffscreenCanvas: hay tamaño móvil. */
export function sequenceGatePasses(e: GlassEnv): boolean {
  return e.motionOn && gatingPasses({ webgl2: true, software: false, reducedMotion: e.reducedMotion, saveData: e.saveData, cores: e.cores, deviceMemory: e.deviceMemory });
}

/** Orden de descarga: 0, 4, 8... (y el último, para que el final también quede cubierto), después el resto en orden. */
export function loadOrder(frames: number): number[] {
  const first: number[] = [];
  for (let i = 0; i < frames; i += COARSE_STEP) first.push(i);
  if (frames > 0 && first[first.length - 1] !== frames - 1) first.push(frames - 1);
  const seen = new Set(first);
  const rest: number[] = [];
  for (let i = 0; i < frames; i++) if (!seen.has(i)) rest.push(i);
  return [...first, ...rest];
}

/** Progreso de la caja por el viewport: 0 cuando su borde superior toca el inferior del viewport, 1 cuando su borde inferior toca el superior. */
export function sectionProgress(rect: { top: number; height: number }, viewportHeight: number): number {
  const span = viewportHeight + rect.height;
  if (!(span > 0)) return 0;
  return Math.min(1, Math.max(0, (viewportHeight - rect.top) / span));
}

export function frameForProgress(progress: number, frames: number): number {
  if (frames <= 1 || !(progress > 0)) return 0;
  return Math.min(frames - 1, Math.round(Math.min(1, progress) * (frames - 1)));
}

/** El fotograma ya cargado más cercano al pedido (a igualdad, el anterior). -1 si no hay ninguno. */
export function nearestLoaded(target: number, frames: number, has: (i: number) => boolean): number {
  for (let d = 0; d < frames; d++) {
    if (target - d >= 0 && has(target - d)) return target - d;
    if (target + d < frames && has(target + d)) return target + d;
  }
  return -1;
}

export type PlayerOptions = {
  /** La caja con la proporción de la secuencia: de ella salen el tamaño y el progreso de scroll. */
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  manifest: SequenceManifest;
  size: SizeKey;
  /** Se pintó el primer fotograma. */
  onLive(): void;
  /** No se pudo cargar ni un fotograma. */
  onFail(): void;
};

export function createPlayer(o: PlayerOptions): { dispose(): void } {
  const { root, canvas, manifest, size } = o;
  const sz = manifest.sizes[size];
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    o.onFail();
    return { dispose() {} };
  }
  let bitmaps: (ImageBitmap | undefined)[] = new Array(manifest.frames);
  let controller: AbortController | null = null;
  let near = false;
  let lastDrawn = -1;
  let live = false;
  let disposed = false;
  let raf = 0;

  /** Tamaño del lienzo en píxeles de dispositivo, sin pasar del fotograma. Asignar width/height borra el lienzo. */
  const fit = () => {
    const r = root.getBoundingClientRect();
    const w = Math.max(1, Math.min(Math.round(r.width * Math.min(devicePixelRatio || 1, MAX_DPR)), sz.w));
    const h = Math.max(1, Math.round((w * sz.h) / sz.w));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      lastDrawn = -1;
    }
    return [w, h] as const;
  };

  const draw = () => {
    raf = 0;
    if (disposed || !near) return;
    const [w, h] = fit();
    const has = (i: number) => bitmaps[i] !== undefined;
    const r = root.getBoundingClientRect();
    const idx = nearestLoaded(frameForProgress(sectionProgress(r, innerHeight), manifest.frames), manifest.frames, has);
    if (idx < 0 || idx === lastDrawn) return;
    ctx.drawImage(bitmaps[idx]!, 0, 0, w, h);
    lastDrawn = idx;
    canvas.dataset.frame = String(idx + 1);
    if (!live) {
      live = true;
      o.onLive();
    }
  };
  const schedule = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(draw);
  };

  const load = async (index: number, signal: AbortSignal, w: number, h: number) => {
    try {
      const res = await fetch(framePath(sz, index), { signal });
      if (!res.ok) return;
      // Se decodifica ya al tamaño de pintado: 90 fotogramas de 1600x900 sin reducir serían unos 500 MB.
      const bmp = await createImageBitmap(await res.blob(), { resizeWidth: w, resizeHeight: h, resizeQuality: "high" });
      if (signal.aborted || disposed) return bmp.close();
      bitmaps[index] = bmp;
      schedule();
    } catch {
      /* un fotograma perdido se cubre con el más cercano; abortar es lo normal al salir */
    }
  };
  const start = () => {
    if (controller || disposed) return;
    const ac = (controller = new AbortController());
    const [w, h] = fit();
    const queue = loadOrder(manifest.frames).filter((i) => bitmaps[i] === undefined);
    let workers = CONCURRENCY;
    const worker = async () => {
      while (queue.length && !ac.signal.aborted) await load(queue.shift()!, ac.signal, w, h);
      if (--workers === 0 && !ac.signal.aborted && !bitmaps.some(Boolean) && !live) o.onFail();
    };
    for (let i = 0; i < CONCURRENCY; i++) void worker();
  };
  /** Fuera de la zona de carga se sueltan las ImageBitmap; el lienzo se queda con lo último pintado. */
  const release = () => {
    controller?.abort();
    controller = null;
    for (const b of bitmaps) b?.close();
    bitmaps = new Array(manifest.frames);
    lastDrawn = -1;
  };

  const io = new IntersectionObserver(
    ([e]) => {
      near = !!e?.isIntersecting;
      if (near) {
        start();
        schedule();
      } else release();
    },
    { rootMargin: "100% 0px" },
  );
  io.observe(root);
  addEventListener("scroll", schedule, { passive: true });
  const ro = new ResizeObserver(schedule);
  ro.observe(root);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      io.disconnect();
      ro.disconnect();
      release();
    },
  };
}
