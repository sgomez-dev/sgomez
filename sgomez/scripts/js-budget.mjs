// Uso: npm run build && npm run budget. Lee el HTML prerenderizado de .next/server/app.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { initialScripts, legacyScripts } from "./js-budget-lib.mjs";

export const BUDGET = { initialKB: 170, runtimeKB: 6, cssKB: 18 /* línea base 9,7 KB (build limpia) redondeada a 10, más 8 */ };
const ROUTES = { "/": "es.html", "/en": "en.html", "404 (molde es)": "es/perdido.html", "404 (molde en)": "en/perdido.html" };
const NEXT = join(process.cwd(), ".next");
const gz = (file) => gzipSync(readFileSync(file)).length / 1024;
const disk = (src) => join(NEXT, src.replace(/^\/_next\//, ""));
let failed = false;

for (const [route, file] of Object.entries(ROUTES)) {
  const html = readFileSync(join(NEXT, "server", "app", file), "utf8");
  const rows = initialScripts(html).map((src) => [src, gz(disk(src))]).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, kb]) => s + kb, 0);
  const legacy = legacyScripts(html).reduce((s, src) => s + gz(disk(src)), 0);
  console.log(`\n${route}: ${total.toFixed(1)} KB gzip iniciales (${rows.length} scripts); polyfill noModule aparte: ${legacy.toFixed(1)} KB`);
  for (const [src, kb] of rows) console.log(`  ${kb.toFixed(1).padStart(6)}  ${src}`);
  if (total > BUDGET.initialKB) { failed = true; console.error(`  SE PASA de ${BUDGET.initialKB} KB`); }
}

const chunks = join(NEXT, "static", "chunks");
const files = existsSync(chunks) ? readdirSync(chunks) : [];
const runtime = files.filter((f) => f.endsWith(".js") && readFileSync(join(chunks, f), "utf8").includes("sgomez-motion-runtime"));
if (runtime.length === 0) console.log("\nruntime de movimiento: todavía no existe");
else {
  const kb = runtime.reduce((s, f) => s + gz(join(chunks, f)), 0);
  console.log(`\nruntime de movimiento: ${kb.toFixed(1)} KB gzip (${runtime.join(", ")})`);
  if (kb > BUDGET.runtimeKB) { failed = true; console.error(`  SE PASA de ${BUDGET.runtimeKB} KB`); }
}

const css = files.filter((f) => f.endsWith(".css"));
const cssKB = css.reduce((s, f) => s + gz(join(chunks, f)), 0);
console.log(`\nCSS: ${cssKB.toFixed(1)} KB gzip en ${css.length} ficheros`);
if (BUDGET.cssKB > 0 && cssKB > BUDGET.cssKB) { failed = true; console.error(`  SE PASA de ${BUDGET.cssKB} KB`); }

process.exit(failed ? 1 : 0);
