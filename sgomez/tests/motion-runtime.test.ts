import { describe, expect, it, vi } from "vitest";
import { start } from "@/motion/runtime";

function fakeRoot(values: string[]) {
  const els = values.map((v) => ({ dataset: { motion: v } }) as unknown as HTMLElement);
  return { els, root: { querySelectorAll: () => els } as unknown as ParentNode };
}

describe("runtime de movimiento", () => {
  it("engancha solo las primitivas registradas y las para todas", () => {
    const stop = vi.fn();
    const count = vi.fn(() => stop);
    const { root } = fakeRoot(["count", "glass", "count"]);
    const halt = start(root, { count });
    expect(count).toHaveBeenCalledTimes(2);
    halt();
    expect(stop).toHaveBeenCalledTimes(2);
    halt();
    expect(stop).toHaveBeenCalledTimes(2);
  });
  it("una primitiva que lanza no apaga a las demás", () => {
    const ok = vi.fn();
    const { root } = fakeRoot(["bad", "ok"]);
    expect(() => start(root, { bad: () => { throw new Error("x"); }, ok })).not.toThrow();
    expect(ok).toHaveBeenCalledTimes(1);
  });
});
