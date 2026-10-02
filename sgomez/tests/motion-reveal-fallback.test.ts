import { describe, expect, it, vi } from "vitest";
import { revealOnEnter, supportsScrollTimeline } from "@/motion/reveal-fallback";

describe("respaldo de revelado (sin animation-timeline)", () => {
  it("detecta el soporte con CSS.supports", () => {
    expect(supportsScrollTimeline({ supports: () => true })).toBe(true);
    expect(supportsScrollTimeline({ supports: () => false })).toBe(false);
    expect(supportsScrollTimeline(undefined)).toBe(false);
  });

  function setup(inView: boolean) {
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    const el = { getBoundingClientRect: () => ({ top: inView ? 100 : 5000, bottom: inView ? 200 : 5100 }), animate } as unknown as HTMLElement;
    let cb: IntersectionObserverCallback = () => {};
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    const observe = vi.fn();
    class IO {
      constructor(c: IntersectionObserverCallback) { cb = c; }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    }
    return { el, animate, observe, fire: (e: HTMLElement) => cb([{ isIntersecting: true, target: e } as unknown as IntersectionObserverEntry], {} as IntersectionObserver), IO, disconnect, unobserve };
  }

  it("no toca lo que ya está en pantalla al engancharse", () => {
    const s = setup(true);
    const stop = revealOnEnter([s.el], { IO: s.IO as unknown as typeof IntersectionObserver, vh: 800 });
    expect(s.observe).not.toHaveBeenCalled();
    stop();
  });
  it("anima una vez, con translate (nunca opacity), al entrar un elemento que estaba fuera", () => {
    const s = setup(false);
    revealOnEnter([s.el], { IO: s.IO as unknown as typeof IntersectionObserver, vh: 800 });
    s.fire(s.el);
    expect(s.animate).toHaveBeenCalledTimes(1);
    const keyframes = (s.animate.mock.calls[0] as unknown as [Record<string, unknown>[]])[0];
    expect(JSON.stringify(keyframes)).not.toMatch(/opacity|filter/);
    expect(s.unobserve).toHaveBeenCalled();
  });
  it("el parado cancela y desconecta", () => {
    const s = setup(false);
    const stop = revealOnEnter([s.el], { IO: s.IO as unknown as typeof IntersectionObserver, vh: 800 });
    stop();
    expect(s.disconnect).toHaveBeenCalled();
  });
});
