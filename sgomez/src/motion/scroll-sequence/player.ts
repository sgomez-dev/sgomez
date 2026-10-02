import { gatingPasses } from "@/chapters/lost/media";
import type { GlassEnv } from "@/lib/three/gate";
import { framePath, type SequenceManifest, type SizeKey } from "./manifest";

/** Marca para el test de pesos: este módulo es el chunk perezoso del reproductor. */
export const PLAYER_MARK = "sgomez-scroll-sequence";

/** Un fotograma de cada COARSE_STEP se descarga primero: con eso solo ya hay una imagen razonable en cualquier punto. */
export const COARSE_STEP = 4;
const CONCURRENCY = 6;
const MAX_DPR = 1.5;
/** Fotogramas decodificados a cada lado del actual. Con la ventana entera hay como mucho 2 * WINDOW + 1 `ImageBitmap` vivos. */
export const WINDOW = 8;
/** Decodificaciones a la vez: cada `ImageBitmap` en vuelo cuenta como vivo para el tope de la ventana. */
const DECODE_CONCURRENCY = 3;

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

/** Progreso de un capítulo alto: 0 cuando su borde superior llega arriba del viewport, 1 cuando su borde inferior llega abajo. */
export function chapterProgress(rect: { top: number; height: number }, viewportHeight: number): number {
  const span = rect.height - viewportHeight;
  // En una pantalla alta el capítulo cabe entero en el viewport y no hay recorrido pegajoso: se usa el de la sección.
  if (!(span > 0)) return sectionProgress(rect, viewportHeight);
  return Math.min(1, Math.max(0, -rect.top / span));
}

export function frameForProgress(progress: number, frames: number): number {
  if (frames <= 1 || !(progress > 0)) return 0;
  return Math.min(frames - 1, Math.round(Math.min(1, progress) * (frames - 1)));
}

/** Los fotogramas que han de estar decodificados cuando el actual es `target`: de `target - WINDOW` a `target + WINDOW`, recortado a la secuencia. */
export function decodeWindow(target: number, frames: number): [number, number] {
  return [Math.max(0, target - WINDOW), Math.min(frames - 1, target + WINDOW)];
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
  /** Si se da, el progreso sale de este elemento (un capítulo alto con la caja pegajosa) y no de la propia caja. */
  track?: HTMLElement | null;
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
  // Se guardan los Blob comprimidos (toda la secuencia pesa 1,3 MB) y solo una ventana de ±WINDOW fotogramas alrededor del
  // actual está decodificada como ImageBitmap. Decodificar los 90 de 1600x900 eran unos 500 MB en escritorio y 130 en móvil.
  let blobs: (Blob | undefined)[] = new Array(manifest.frames);
  const bitmaps: (ImageBitmap | undefined)[] = new Array(manifest.frames);
  const decoding = new Set<number>();
  let decoded = 0;
  let decodedW = 0;
  /** Sube al soltar todo: una decodificación que empezó antes no debe dejar su ImageBitmap vivo. */
  let generation = 0;
  let target = 0;
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

  const closeBitmap = (i: number) => {
    bitmaps[i]?.close();
    bitmaps[i] = undefined;
    decoded--;
  };
  /** Cierra lo que ha salido de la ventana y decodifica lo que falta dentro de ella, del centro hacia fuera. */
  const pump = (w: number, h: number) => {
    if (decodedW !== w) {
      // Cambió el tamaño de pintado: lo decodificado a otro tamaño se tira y se vuelve a decodificar.
      for (let i = 0; i < bitmaps.length; i++) if (bitmaps[i]) closeBitmap(i);
      decodedW = w;
    }
    const [lo, hi] = decodeWindow(target, manifest.frames);
    for (let i = 0; i < bitmaps.length; i++) if (bitmaps[i] && (i < lo || i > hi)) closeBitmap(i);
    for (let d = 0; d <= WINDOW; d++) {
      for (const i of d === 0 ? [target] : [target - d, target + d]) {
        // El tope cuenta los que están decodificándose: nunca hay más de 2 * WINDOW + 1 vivos, ni siquiera un instante.
        if (decoding.size >= DECODE_CONCURRENCY || decoded + decoding.size >= 2 * WINDOW + 1) return;
        if (i < lo || i > hi || !blobs[i] || bitmaps[i] || decoding.has(i)) continue;
        void decode(i, w, h);
      }
    }
  };
  const decode = async (index: number, w: number, h: number) => {
    const blob = blobs[index]!;
    const gen = generation;
    decoding.add(index);
    try {
      const bmp = await createImageBitmap(blob, { resizeWidth: w, resizeHeight: h, resizeQuality: "high" });
      const [lo, hi] = decodeWindow(target, manifest.frames);
      if (disposed || gen !== generation || decodedW !== w || index < lo || index > hi || bitmaps[index]) return bmp.close();
      bitmaps[index] = bmp;
      decoded++;
    } catch {
      /* un fotograma perdido se cubre con el más cercano */
    } finally {
      decoding.delete(index);
      schedule();
    }
  };

  const draw = () => {
    raf = 0;
    if (disposed || !near) return;
    const [w, h] = fit();
    const has = (i: number) => bitmaps[i] !== undefined;
    const r = (o.track ?? root).getBoundingClientRect();
    const p = o.track ? chapterProgress(r, innerHeight) : sectionProgress(r, innerHeight);
    target = frameForProgress(p, manifest.frames);
    pump(w, h);
    const idx = nearestLoaded(target, manifest.frames, has);
    if (idx < 0 || idx === lastDrawn) return;
    // Los fotogramas llevan alfa: sin borrar, cada pintado se acumula sobre el anterior y deja estelas.
    ctx.clearRect(0, 0, w, h);
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

  const load = async (index: number, signal: AbortSignal) => {
    try {
      const res = await fetch(framePath(sz, index), { signal });
      if (!res.ok) return;
      const blob = await res.blob();
      if (signal.aborted || disposed) return;
      blobs[index] = blob;
      schedule();
    } catch {
      /* un fotograma perdido se cubre con el más cercano; abortar es lo normal al salir */
    }
  };
  const start = () => {
    if (controller || disposed) return;
    const ac = (controller = new AbortController());
    const queue = loadOrder(manifest.frames).filter((i) => blobs[i] === undefined);
    let workers = CONCURRENCY;
    const worker = async () => {
      while (queue.length && !ac.signal.aborted) await load(queue.shift()!, ac.signal);
      if (--workers === 0 && !ac.signal.aborted && !blobs.some(Boolean) && !live) o.onFail();
    };
    for (let i = 0; i < CONCURRENCY; i++) void worker();
  };
  /** Fuera de la zona de carga se sueltan los Blob y las ImageBitmap; el lienzo se queda con lo último pintado. */
  const release = () => {
    controller?.abort();
    controller = null;
    for (let i = 0; i < bitmaps.length; i++) if (bitmaps[i]) closeBitmap(i);
    blobs = new Array(manifest.frames);
    generation++;
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
