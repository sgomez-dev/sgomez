import { describe, expect, it, vi } from "vitest";
import { lifecycle, start } from "@/motion/runtime";
import type { Ctx, Registry } from "@/motion/types";

const ctx = {} as Ctx;
const flush = () => new Promise((r) => setTimeout(r, 0));

function fakeRoot(values: string[]) {
  const els = values.map((v) => ({ dataset: { motion: v }, matches: () => false }) as unknown as HTMLElement);
  return { els, root: { querySelectorAll: () => els } as unknown as ParentNode };
}

describe("runtime de movimiento", () => {
  it("engancha solo las entradas registradas, con su contexto, y las para todas", async () => {
    const stop = vi.fn();
    const run = vi.fn((...args: [HTMLElement, Ctx]) => {
      void args;
      return stop;
    });
    const { root } = fakeRoot(["count", "glass", "count"]);
    const halt = start(root, { count: { run } }, { ctx, supported: true });
    await flush();
    expect(run).toHaveBeenCalledTimes(2);
    expect(run.mock.calls[0]![1]).toBe(ctx);
    halt();
    expect(stop).toHaveBeenCalledTimes(2);
    halt();
    expect(stop).toHaveBeenCalledTimes(2);
  });
  it("una primitiva que lanza no apaga a las demás", async () => {
    const ok = vi.fn();
    const { root } = fakeRoot(["bad", "ok"]);
    const reg: Registry = {
      bad: {
        run: () => {
          throw new Error("x");
        },
      },
      ok: { run: ok },
    };
    expect(() => start(root, reg, { ctx, supported: true })).not.toThrow();
    await flush();
    expect(ok).toHaveBeenCalledTimes(1);
  });
  it("es idempotente por elemento: un segundo start sobre lo ya enganchado no lo repite", async () => {
    const run = vi.fn();
    const { root } = fakeRoot(["count"]);
    const a = start(root, { count: { run } }, { ctx, supported: true });
    start(root, { count: { run } }, { ctx, supported: true });
    await flush();
    expect(run).toHaveBeenCalledTimes(1);
    a();
  });
  it("carga cada primitiva con su load() y mezcla sus campos", async () => {
    const run = vi.fn();
    const load = vi.fn(async () => ({ run }));
    const { root } = fakeRoot(["count", "count"]);
    start(root, { count: { load } }, { ctx, supported: true })();
    await flush();
    expect(load).toHaveBeenCalledTimes(2);
  });
  it("sin animation-timeline usa fallback; con él, run", async () => {
    const run = vi.fn();
    const fallback = vi.fn();
    const reg: Registry = { x: { run, fallback } };
    start(fakeRoot(["x"]).root, reg, { ctx, supported: false })();
    await flush();
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();
    start(fakeRoot(["x"]).root, reg, { ctx, supported: true })();
    await flush();
    expect(run).toHaveBeenCalledTimes(1);
  });
  it("una entrada sin run ni fallback no pide el contexto ni falla", async () => {
    const { root } = fakeRoot(["empty"]);
    expect(() => start(root, { empty: {} }, { supported: true })()).not.toThrow();
    await flush();
  });
  it("una entrada fallbackOnly no carga su módulo donde hay animation-timeline", async () => {
    const load = vi.fn(async () => ({ fallback: vi.fn() }));
    start(fakeRoot(["x"]).root, { x: { fallbackOnly: true, load } }, { ctx, supported: true })();
    await flush();
    expect(load).not.toHaveBeenCalled();
  });
  it("los hooks de ciclo de vida corren y uno roto no frena a los demás", () => {
    const a = vi.fn();
    const off1 = lifecycle.on("ready", () => {
      throw new Error("x");
    });
    const off2 = lifecycle.on("ready", a);
    lifecycle.emit("ready");
    expect(a).toHaveBeenCalledTimes(1);
    off1();
    off2();
  });
  it("runExit espera a las animaciones de salida", async () => {
    let done = false;
    const off = lifecycle.exit(
      () =>
        new Promise<void>((r) =>
          setTimeout(() => {
            done = true;
            r();
          }, 5),
        ),
    );
    await lifecycle.runExit();
    expect(done).toBe(true);
    off();
  });
});
