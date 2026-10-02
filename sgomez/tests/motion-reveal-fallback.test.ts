import { describe, expect, it, vi } from "vitest";
import { revealOnEnter } from "@/motion/reveal-fallback";
import { needsRuntime, supportsScrollTimeline } from "@/motion/registry";

describe("detección de soporte", () => {
  it("usa CSS.supports", () => {
    expect(supportsScrollTimeline({ supports: () => true })).toBe(true);
    expect(supportsScrollTimeline({ supports: () => false })).toBe(false);
    expect(supportsScrollTimeline(undefined)).toBe(false);
  });
  it("no pide el runtime si no hay nada que hacer", () => {
    const root = (hasReveal: boolean, motion: string[]) =>
      ({ querySelectorAll: () => motion.map((m) => ({ dataset: { motion: m } })), querySelector: () => (hasReveal ? {} : null) }) as unknown as ParentNode;
    expect(needsRuntime(root(true, ["text-reveal"]), {}, true)).toBe(false);
    expect(needsRuntime(root(true, ["text-reveal"]), {}, false)).toBe(true);
    expect(needsRuntime(root(false, ["text-reveal"]), {}, false)).toBe(false);
    expect(needsRuntime(root(false, ["count"]), { count: {} }, true)).toBe(true);
  });
});

describe("respaldo de revelado (sin animation-timeline)", () => {
  function setup(top: number) {
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    const props: Record<string, string> = {};
    const style = {
      set clipPath(v: string) {
        props["clip-path"] = v;
      },
      set translate(v: string) {
        props["translate"] = v;
      },
      removeProperty(k: string) {
        delete props[k];
      },
    };
    const el = { getBoundingClientRect: () => ({ top, bottom: top + 100 }), animate, style } as unknown as HTMLElement;
    let cb: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    class IO {
      constructor(c: IntersectionObserverCallback) {
        cb = c;
      }
      observe = observe;
      unobserve = unobserve;
      disconnect = disconnect;
    }
    return {
      el,
      props,
      animate,
      observe,
      unobserve,
      disconnect,
      IO: IO as unknown as typeof IntersectionObserver,
      fire: () => cb([{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver),
    };
  }

  it("no toca lo que ya está en pantalla", () => {
    const s = setup(100);
    revealOnEnter([s.el], { IO: s.IO, vh: 800 })();
    expect(s.observe).not.toHaveBeenCalled();
    expect(s.props).toEqual({});
  });
  it("esconde de antemano lo de abajo (sin parpadeo), con clip-path y translate, nunca opacity", () => {
    const s = setup(5000);
    revealOnEnter([s.el], { IO: s.IO, vh: 800 });
    expect(s.observe).toHaveBeenCalledTimes(1);
    expect(Object.keys(s.props).sort()).toEqual(["clip-path", "translate"]);
  });
  it("al entrar anima una vez y quita los estilos en línea", () => {
    const s = setup(5000);
    revealOnEnter([s.el], { IO: s.IO, vh: 800 });
    s.fire();
    expect(s.animate).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(s.animate.mock.calls[0])).not.toMatch(/opacity|filter/);
    expect(s.unobserve).toHaveBeenCalled();
    expect(s.props).toEqual({});
  });
  it("el parado desconecta y deja los estilos limpios aunque no haya entrado", () => {
    const s = setup(5000);
    const stop = revealOnEnter([s.el], { IO: s.IO, vh: 800 });
    stop();
    expect(s.disconnect).toHaveBeenCalled();
    expect(s.props).toEqual({});
  });
});
