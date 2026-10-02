import { describe, expect, it } from "vitest";
import { initialScripts, legacyScripts } from "../scripts/js-budget-lib.mjs";

const HTML = `<!DOCTYPE html><html><head>
<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/pre.js"/>
<script src="/_next/static/chunks/poly.js" noModule=""></script>
<script src="/_next/static/chunks/a.js" async=""></script>
<script src="/_next/static/chunks/b.js" async=""></script>
<script src="/_next/static/chunks/a.js" async=""></script>
<script>self.__next_f=[]</script>
</head></html>`;

describe("presupuesto de JS: lectura del HTML", () => {
  it("cuenta los scripts iniciales y los preload, sin duplicados ni inline", () => {
    expect(initialScripts(HTML)).toEqual(["/_next/static/chunks/pre.js", "/_next/static/chunks/a.js", "/_next/static/chunks/b.js"]);
  });
  it("el polyfill noModule no cuenta como inicial: va aparte", () => {
    expect(initialScripts(HTML)).not.toContain("/_next/static/chunks/poly.js");
    expect(legacyScripts(HTML)).toEqual(["/_next/static/chunks/poly.js"]);
  });
});
