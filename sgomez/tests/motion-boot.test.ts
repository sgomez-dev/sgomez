import { describe, expect, it } from "vitest";
import { MOTION_ATTR, MOTION_BOOT_SCRIPT, motionStateFor } from "@/motion/boot";

function runBoot(opts: { reduce: boolean; saveData?: boolean }) {
  const attrs: Record<string, string> = {};
  let listener: (() => void) | undefined;
  const mql = { matches: opts.reduce, addEventListener: (_: string, fn: () => void) => (listener = fn) };
  const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  const navigator = { connection: opts.saveData ? { saveData: true } : undefined };
  new Function("document", "matchMedia", "navigator", MOTION_BOOT_SCRIPT)(document, () => mql, navigator);
  return { attrs, mql, fire: () => listener?.() };
}

describe("estado del movimiento", () => {
  it("motionStateFor", () => {
    expect(motionStateFor({ reducedMotion: false, saveData: false })).toBe("on");
    expect(motionStateFor({ reducedMotion: true, saveData: false })).toBe("off");
    expect(motionStateFor({ reducedMotion: false, saveData: true })).toBe("off");
  });
  it("el script del head pone el atributo antes del primer pintado", () => {
    expect(runBoot({ reduce: false }).attrs[MOTION_ATTR]).toBe("on");
    expect(runBoot({ reduce: true }).attrs[MOTION_ATTR]).toBe("off");
    expect(runBoot({ reduce: false, saveData: true }).attrs[MOTION_ATTR]).toBe("off");
  });
  it("sigue los cambios de prefers-reduced-motion", () => {
    const b = runBoot({ reduce: false });
    b.mql.matches = true;
    b.fire();
    expect(b.attrs[MOTION_ATTR]).toBe("off");
  });
  it("no rompe la página si matchMedia no existe", () => {
    expect(() => new Function("document", "matchMedia", "navigator", MOTION_BOOT_SCRIPT)({}, undefined, {})).not.toThrow();
  });
  it("es pequeño", () => expect(MOTION_BOOT_SCRIPT.length).toBeLessThan(400));
});
