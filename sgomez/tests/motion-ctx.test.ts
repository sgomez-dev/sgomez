import { afterEach, describe, expect, it, vi } from "vitest";
import { createCtx } from "@/motion/ctx";

afterEach(() => vi.unstubAllGlobals());

describe("ctx: tween numérico", () => {
  it("cuenta de 0 al valor, termina exacto y se puede parar", () => {
    let now = 0;
    const q: FrameRequestCallback[] = [];
    vi.stubGlobal("performance", { now: () => now });
    vi.stubGlobal("requestAnimationFrame", (f: FrameRequestCallback) => (q.push(f), q.length));
    vi.stubGlobal("cancelAnimationFrame", () => q.splice(0));
    const seen: number[] = [];
    const done = vi.fn();
    createCtx().count(0, 13, { duration: 100, onUpdate: (v) => seen.push(v), onDone: done });
    for (now = 50; q.length; now += 50) q.shift()!(now);
    expect(seen.at(-1)).toBe(13);
    expect(done).toHaveBeenCalled();
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    const stop = createCtx().count(0, 5, { duration: 100, onUpdate: () => {} });
    stop();
    expect(q).toHaveLength(0);
  });
});

describe("ctx: split", () => {
  function fakeEl(text: string) {
    const attrs: Record<string, string> = {};
    const original = [{ t: text }];
    const el = {
      attrs,
      kids: original as unknown[],
      childNodes: original,
      textContent: text,
      hasAttribute: (k: string) => k in attrs,
      setAttribute: (k: string, v: string) => (attrs[k] = v),
      removeAttribute: (k: string) => delete attrs[k],
      replaceChildren: (...c: unknown[]) => {
        el.kids = c.flat();
      },
    };
    return el;
  }
  function fakeDocument() {
    return {
      createDocumentFragment: () => {
        const a: unknown[] = [];
        return Object.assign(a, { append: (...x: unknown[]) => a.push(...x) });
      },
      createElement: () => {
        const attrs: Record<string, string> = {};
        const st: Record<string, string> = {};
        return { attrs, dataset: {} as Record<string, string>, style: { setProperty: (k: string, v: string) => (st[k] = v) }, setAttribute: (k: string, v: string) => (attrs[k] = v), textContent: "" };
      },
    };
  }
  it("conserva aria-label, marca las palabras y restaura el DOM", () => {
    vi.stubGlobal("document", fakeDocument());
    const el = fakeEl("Hola  mundo bonito");
    const original = el.childNodes;
    const { words, restore } = createCtx().split(el as unknown as HTMLElement, "word");
    expect(words).toHaveLength(3);
    expect(el.attrs["aria-label"]).toBe("Hola  mundo bonito");
    restore();
    expect(el.attrs["aria-label"]).toBeUndefined();
    expect(el.kids).toEqual(original);
  });
  it("respeta un aria-label previo", () => {
    vi.stubGlobal("document", fakeDocument());
    const el = fakeEl("a b");
    el.attrs["aria-label"] = "previo";
    createCtx().split(el as unknown as HTMLElement, "word").restore();
    expect(el.attrs["aria-label"]).toBe("previo");
  });
});

describe("ctx: puntero", () => {
  it("engancha pointerenter, pointermove y pointerleave; al parar quita los oyentes y vuelve a 0", () => {
    const on: Record<string, unknown> = {};
    const el = {
      addEventListener: (k: string, f: unknown) => (on[k] = f),
      removeEventListener: (k: string) => delete on[k],
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
    } as unknown as HTMLElement;
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("performance", { now: () => 0 });
    const onMove = vi.fn();
    const stop = createCtx().pointer(el, { onMove });
    expect(Object.keys(on).sort()).toEqual(["pointerenter", "pointerleave", "pointermove"]);
    stop();
    expect(Object.keys(on)).toEqual([]);
    expect(onMove).toHaveBeenLastCalledWith(0, 0);
  });
});
