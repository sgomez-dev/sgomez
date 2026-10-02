import { describe, expect, it } from "vitest";
import { summarize, markdownTable } from "../scripts/lcp-report-lib.mjs";

const LHR = {
  finalDisplayedUrl: "http://localhost:3000/",
  audits: {
    "largest-contentful-paint": { numericValue: 9976 },
    "total-blocking-time": { numericValue: 993 },
    "first-contentful-paint": { numericValue: 2877 },
    "largest-contentful-paint-element": {
      details: { items: [{ items: [{ node: { snippet: '<h1 data-motion="text-reveal" class="x">' } }] }, { items: [{ phase: "TTFB", timing: 451 }, { phase: "Render Delay", timing: 9526 }] }] },
    },
    metrics: { details: { items: [{ observedFirstContentfulPaint: 1161, observedLargestContentfulPaint: 1161, observedDomContentLoaded: 165, observedLoad: 500 }] } },
    "bootup-time": { details: { items: [{ url: "http://localhost:3000/_next/static/chunks/a.js", total: 991, scripting: 943 }] } },
    "mainthread-work-breakdown": { details: { items: [{ group: "styleLayout", duration: 824 }] } },
  },
};

describe("informe de LCP", () => {
  it("resume el LHR", () => {
    const s = summarize(LHR);
    expect(s.element).toMatch(/^<h1/);
    expect(s.phases["Render Delay"]).toBe(9526);
    expect(s.observed).toEqual({ fcp: 1161, lcp: 1161, dcl: 165, load: 500 });
    expect(s.bootup[0]).toEqual(["/_next/static/chunks/a.js", 943]);
  });
  it("la tabla Markdown lleva una fila por LHR", () => {
    expect(markdownTable([summarize(LHR), summarize(LHR)]).trim().split("\n")).toHaveLength(4);
  });
});
