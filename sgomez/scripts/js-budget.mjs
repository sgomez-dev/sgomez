// Uso: npm run build && npm run budget. Lee el HTML prerenderizado de .next/server/app.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { initialScripts, legacyScripts } from "./js-budget-lib.mjs";

export const BUDGET = { initialKB: 170, runtimeKB: 15 /* runtime + motor + primitivas. Medido 12,9 KB (10,6 de runtime y motor, 2,3 de los chunks de primitivas) mas unos 2 KB de margen */, cssKB: 18 /* linea base 9,7 KB (build limpia) redondeada a 10, mas 8 */ };
const ROUTES = {};
for (const l of ["es", "en"]) {
  ROUTES[l === "es" ? "/" : "/en"] = `${l}.html`;
  for (const page of ["about", "contact", "developers", "privacy"]) ROUTES[`/${l}/${page}`] = `${l}/${page}.html`;
  ROUTES[`404 (molde ${l})`] = `${l}/perdido.html`;
}
const NEXT = join(process.cwd(), ".next");
const gz = (file) => gzipSync(readFileSync(file)).length / 1024;
const disk = (src) => join(NEXT, src.replace(/^\/_next\//, ""));
let failed = false;
const INITIAL = [];

for (const [route, file] of Object.entries(ROUTES)) {
  const html = readFileSync(join(NEXT, "server", "app", file), "utf8");
  INITIAL.push(...initialScripts(html));
  const rows = initialScripts(html).map((src) => [src, gz(disk(src))]).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, kb]) => s + kb, 0);
  const legacy = legacyScripts(html).reduce((s, src) => s + gz(disk(src)), 0);
  console.log(`\n${route}: ${total.toFixed(1)} KB gzip iniciales (${rows.length} scripts); polyfill noModule aparte: ${legacy.toFixed(1)} KB`);
  for (const [src, kb] of rows) console.log(`  ${kb.toFixed(1).padStart(6)}  ${src}`);
  if (total > BUDGET.initialKB) { failed = true; console.error(`  SE PASA de ${BUDGET.initialKB} KB`); }
}

const chunks = join(NEXT, "static", "chunks");
const files = existsSync(chunks) ? readdirSync(chunks) : [];
// Runtime = el chunk con la marca + todos los chunks que su grafo de imports referencia por nombre,
// menos lo que ya va en el JS inicial de alguna ruta.
const initialAll = new Set(INITIAL.map((src) => src.split("/").pop()));
const marked = files.filter((f) => f.endsWith(".js") && readFileSync(join(chunks, f), "utf8").includes("sgomez-motion-runtime"));
const graph = new Set();
const queue = [...marked];
// Los chunks de las primitivas los pide el REGISTRO con import(), y el registro va en el JS inicial: no cuelgan del
// grafo del runtime y antes no se contaban (unos 2,7 KB). Se siembran desde el chunk que contiene el registro.
const registryChunks = files.filter((f) => f.endsWith(".js") && /"text-reveal"/.test(readFileSync(join(chunks, f), "utf8")) && /fallbackOnly/.test(readFileSync(join(chunks, f), "utf8")));
if (registryChunks.length === 0) { failed = true; console.error("  FALLA: no encuentro el chunk del registro; las primitivas no se estan contando"); }
for (const r of registryChunks) {
  const text = readFileSync(join(chunks, r), "utf8");
  for (const g of files) if (g.endsWith(".js") && g !== r && text.includes(g)) queue.push(g);
}
while (queue.length) {
  const f = queue.pop();
  if (graph.has(f) || initialAll.has(f)) continue;
  graph.add(f);
  const text = readFileSync(join(chunks, f), "utf8");
  for (const g of files) if (g.endsWith(".js") && g !== f && text.includes(g)) queue.push(g);
}
if (marked.length === 0) console.log("runtime de movimiento: todavia no existe");
else {
  const kb = [...graph].reduce((s, f) => s + gz(join(chunks, f)), 0);
  console.log(`runtime de movimiento: ${kb.toFixed(1)} KB gzip en ${graph.size} chunks`);
  for (const f of graph) console.log(`  ${gz(join(chunks, f)).toFixed(1).padStart(6)}  ${f}${marked.includes(f) ? "  (runtime)" : ""}`);
  if (kb > BUDGET.runtimeKB) { failed = true; console.error(`  SE PASA de ${BUDGET.runtimeKB} KB`); }
}

const css = files.filter((f) => f.endsWith(".css"));
const cssKB = css.reduce((s, f) => s + gz(join(chunks, f)), 0);
console.log(`\nCSS: ${cssKB.toFixed(1)} KB gzip en ${css.length} ficheros`);
if (BUDGET.cssKB > 0 && cssKB > BUDGET.cssKB) { failed = true; console.error(`  SE PASA de ${BUDGET.cssKB} KB`); }

process.exit(failed ? 1 : 0);
