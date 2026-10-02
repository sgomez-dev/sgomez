import { animate } from "motion/mini";
import { inView, scroll, spring, stagger } from "motion";
import type { Ctx } from "./types";
import { easeOutExpo, magneticOffset, springSettled, springStep, wordSpans } from "./math";

/** Un solo chunk con el motor. Solo lo pide el runtime cuando una primitiva lo necesita. */
export function createCtx(): Ctx {
  return {
    engine: { animate, spring, stagger },
    inView: (el, cb, opts) => inView(el, cb as never, opts as never) as () => void,
    scrollProgress: (target, opts, cb) => scroll(cb, { target, axis: opts.axis, offset: opts.offset as never }) as () => void,
    count(from, to, { duration = 1400, onUpdate, onDone }) {
      let raf = 0;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = (now - t0) / duration;
        onUpdate(Math.round(from + (to - from) * easeOutExpo(t)));
        if (t < 1) raf = requestAnimationFrame(tick);
        else onDone?.();
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    },
    split(el) {
      const original = [...el.childNodes];
      const text = el.textContent ?? "";
      const hadLabel = el.hasAttribute("aria-label");
      if (!hadLabel) el.setAttribute("aria-label", text);
      const words: HTMLElement[] = [];
      const frag = document.createDocumentFragment();
      let i = 0;
      for (const s of wordSpans(text)) {
        if (s.space) frag.append(s.word);
        else {
          const w = document.createElement("span");
          w.setAttribute("aria-hidden", "true");
          w.dataset.w = "";
          w.style.setProperty("--i", String(i++));
          w.textContent = s.word;
          words.push(w);
          frag.append(w);
        }
      }
      el.replaceChildren(frag);
      return {
        words,
        restore() {
          el.replaceChildren(...original);
          if (!hadLabel) el.removeAttribute("aria-label");
        },
      };
    },
    pointer(el, { strength = 12, onMove }) {
      let tx = 0;
      let ty = 0;
      let sx = { x: 0, v: 0 };
      let sy = { x: 0, v: 0 };
      let raf = 0;
      let last = 0;
      const frame = (now: number) => {
        const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
        last = now;
        sx = springStep(sx, tx, dt);
        sy = springStep(sy, ty, dt);
        onMove(sx.x, sy.x);
        raf = springSettled(sx, tx) && springSettled(sy, ty) ? 0 : requestAnimationFrame(frame);
      };
      const kick = () => {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      };
      // El rect se mide al entrar, con el elemento en reposo: si se midiera en cada movimiento incluiría el transform del propio imán y realimentaría.
      let rect = el.getBoundingClientRect();
      const enter = () => {
        rect = el.getBoundingClientRect();
      };
      const move = (e: PointerEvent) => {
        [tx, ty] = magneticOffset(e.clientX, e.clientY, rect, strength);
        kick();
      };
      const leave = () => {
        tx = ty = 0;
        kick();
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        cancelAnimationFrame(raf);
        onMove(0, 0);
      };
    },
  };
}
