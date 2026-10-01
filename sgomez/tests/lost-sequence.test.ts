import { describe, expect, it } from "vitest";
import { next, step, initial, type Phase, type Event } from "@/chapters/lost/sequence";
import { needsOpaqueVideo, gatingPasses, isSoftwareRenderer } from "@/chapters/lost/media";
import es from "@/i18n/dictionaries/es";
import en from "@/i18n/dictionaries/en";

const ctx = (sceneReady = false, videoEnded = false) => ({ sceneReady, videoEnded });

describe("next(): máquina de estados de la secuencia", () => {
  it("empieza en static y motionAllowed pasa a video", () => {
    expect(initial().phase).toBe("static");
    expect(next("static", "motionAllowed", ctx())).toBe("video");
  });
  it("videoEnded con la escena lista pasa a scene", () => {
    expect(next("video", "videoEnded", ctx(true, true))).toBe("scene");
  });
  it("videoEnded con la escena sin lista se queda en video (póster final) y sceneReady la libera", () => {
    expect(next("video", "videoEnded", ctx(false, true))).toBe("video");
    expect(next("video", "sceneReady", ctx(true, true))).toBe("scene");
  });
  it("sceneReady con el vídeo aún en marcha espera", () => {
    expect(next("video", "sceneReady", ctx(true, false))).toBe("video");
  });
  it("videoFailed deja el layout estático y pasa a scene cuando esté lista", () => {
    expect(next("video", "videoFailed", ctx(false))).toBe("static");
    expect(next("static", "sceneReady", ctx(true))).toBe("scene");
    expect(next("video", "videoFailed", ctx(true))).toBe("scene");
  });
  it("sin vídeo (móvil): static + sceneReady va directo a scene", () => {
    expect(next("static", "sceneReady", ctx(true))).toBe("scene");
  });
  it("sceneFailed vuelve a static desde cualquier fase y es final", () => {
    for (const p of ["static", "video", "scene", "idle"] as Phase[]) {
      expect(next(p, "sceneFailed", ctx(true, true))).toBe("static");
    }
    expect(next("static", "sceneReady", { ...ctx(true), failed: true })).toBe("static");
    expect(next("video", "videoEnded", { ...ctx(true, true), failed: true })).toBe("static");
  });
  it("pause y resume no cambian de fase", () => {
    for (const p of ["static", "video", "scene", "idle"] as Phase[]) {
      expect(next(p, "pause", ctx(true))).toBe(p);
      expect(next(p, "resume", ctx(true))).toBe(p);
    }
  });
  it("settled lleva scene a idle", () => {
    expect(next("scene", "settled", ctx(true))).toBe("idle");
    expect(next("video", "settled", ctx(true))).toBe("video");
  });
  it("eventos que no tocan a la fase la dejan como está", () => {
    expect(next("idle", "videoEnded", ctx(true))).toBe("idle");
    expect(next("scene", "videoFailed", ctx(true))).toBe("scene");
    expect(next("static", "videoEnded", ctx(false))).toBe("static");
  });
});

describe("step(): estado completo (fase, pausa, banderas)", () => {
  const run = (events: Event[]) => events.reduce(step, initial());
  it("vídeo termina ANTES que la escena: se queda en video hasta sceneReady", () => {
    let s = run(["motionAllowed", "videoEnded"]);
    expect(s.phase).toBe("video");
    s = step(s, "sceneReady");
    expect(s.phase).toBe("scene");
  });
  it("la escena está lista ANTES de que acabe el vídeo", () => {
    let s = run(["motionAllowed", "sceneReady"]);
    expect(s.phase).toBe("video");
    s = step(s, "videoEnded");
    expect(s.phase).toBe("scene");
  });
  it("la escena falla tras el vídeo: static y sin retorno", () => {
    let s = run(["motionAllowed", "videoEnded", "sceneFailed"]);
    expect(s.phase).toBe("static");
    s = step(step(s, "sceneReady"), "videoEnded");
    expect(s.phase).toBe("static");
  });
  it("pausa y reanuda sin perder la fase", () => {
    let s = run(["motionAllowed", "pause"]);
    expect(s).toMatchObject({ phase: "video", paused: true });
    s = step(s, "resume");
    expect(s).toMatchObject({ phase: "video", paused: false });
  });
  it("en móvil no hay fase de vídeo: static, sceneReady, scene, idle", () => {
    const seen = ["sceneReady", "settled"].reduce<Phase[]>((acc, e) => [...acc, step({ ...initial(), phase: acc[acc.length - 1]!, sceneReady: acc.length > 1 }, e as Event).phase], ["static"]);
    expect(seen).not.toContain("video");
    expect(run(["sceneReady", "settled"]).phase).toBe("idle");
  });
});

describe("media y gating", () => {
  const ua = {
    chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    safari: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    iphoneChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1",
    firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
    edge: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  };
  it("Safari (también el de iOS con otro nombre) usa MP4; el resto, WebM con alfa", () => {
    expect(needsOpaqueVideo(ua.safari, 0)).toBe(true);
    expect(needsOpaqueVideo(ua.iphoneChrome, 5)).toBe(true);
    expect(needsOpaqueVideo(ua.chrome, 0)).toBe(false);
    expect(needsOpaqueVideo(ua.edge, 0)).toBe(false);
    expect(needsOpaqueVideo(ua.firefox, 0)).toBe(false);
  });
  it("gating: WebGL2, sin reduced-motion, sin Save-Data y 4 núcleos o más", () => {
    const ok = { webgl2: true, reducedMotion: false, saveData: false, cores: 8 };
    expect(gatingPasses(ok)).toBe(true);
    expect(gatingPasses({ ...ok, webgl2: false })).toBe(false);
    expect(gatingPasses({ ...ok, reducedMotion: true })).toBe(false);
    expect(gatingPasses({ ...ok, saveData: true })).toBe(false);
    expect(gatingPasses({ ...ok, cores: 2 })).toBe(false);
    expect(gatingPasses({ ...ok, cores: undefined })).toBe(true);
    expect(gatingPasses({ ...ok, software: true })).toBe(false);
    expect(isSoftwareRenderer("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)")).toBe(true);
    expect(isSoftwareRenderer("ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)")).toBe(false);
  });
});

describe("diccionarios", () => {
  it("pause, resume y gyro existen en los dos idiomas", () => {
    for (const d of [es, en]) {
      expect(d.lost.pause.length).toBeGreaterThan(3);
      expect(d.lost.resume.length).toBeGreaterThan(3);
      expect(d.lost.gyro.length).toBeGreaterThan(3);
    }
    expect(es.lost.pause).toBe("Pausar movimiento");
    expect(en.lost.pause).toBe("Pause motion");
  });
});
