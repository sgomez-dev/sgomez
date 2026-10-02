// Uso: npm run build && npm run budget. Lee el HTML prerenderizado de .next/server/app.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { chunkGraph, initialScripts, legacyScripts } from "./js-budget-lib.mjs";

export const BUDGET = { initialKB: 170, runtimeKB: 15 /* runtime + motor + primitivas. Medido 12,9 KB (10,6 de runtime y motor, 2,3 de los chunks de primitivas) mas unos 2 KB de margen */, glassClientKB: 4, glassWorkerKB: 250, cssKB: 18 /* linea base 9,7 KB (build limpia) redondeada a 10, mas 8 */ };
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
const queue = [...marked];
// Los chunks de las primitivas los pide el REGISTRO con import(), y el registro va en el JS inicial: no cuelgan del
// grafo del runtime y antes no se contaban (unos 2,7 KB). Se siembran desde el chunk que contiene el registro.
const registryChunks = files.filter((f) => f.endsWith(".js") && /"text-reveal"/.test(readFileSync(join(chunks, f), "utf8")) && /fallbackOnly/.test(readFileSync(join(chunks, f), "utf8")));
if (registryChunks.length === 0) { failed = true; console.error("  FALLA: no encuentro el chunk del registro; las primitivas no se estan contando"); }
for (const r of registryChunks) {
  const text = readFileSync(join(chunks, r), "utf8");
  // Solo los objetivos de import() (las rutas "static/chunks/x.js" que pasa a e.l), no todo chunk que el registro nombre.
  for (const [, g] of text.matchAll(/static\/chunks\/([\w.~-]+\.js)/g)) if (g !== r && files.includes(g)) queue.push(g);
}
const graph = chunkGraph(files.filter((f) => f.endsWith(".js")), queue, (f) => readFileSync(join(chunks, f), "utf8"), initialAll);
if (marked.length === 0) console.log("runtime de movimiento: todavia no existe");
else {
  const kb = [...graph].reduce((s, f) => s + gz(join(chunks, f)), 0);
  console.log(`runtime de movimiento: ${kb.toFixed(1)} KB gzip en ${graph.size} chunks`);
  for (const f of graph) console.log(`  ${gz(join(chunks, f)).toFixed(1).padStart(6)}  ${f}${marked.includes(f) ? "  (runtime)" : ""}`);
  if (kb > BUDGET.runtimeKB) { failed = true; console.error(`  SE PASA de ${BUDGET.runtimeKB} KB`); }
}

// Cristal: el cliente perezoso y el worker (three). El worker puede salir fuera de static/chunks: se busca en todo static/.
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const allJs = walk(join(NEXT, "static")).filter((f) => f.endsWith(".js"));
const byName = new Map(allJs.map((f) => [f.replaceAll("\\", "/").split("/").pop(), f]));
const text = (n) => readFileSync(byName.get(n), "utf8");
const names = [...byName.keys()];
// Turbopack emite cada worker como un chunk turbopack-worker-*.js y deja la lista de sus chunks (el modulo del worker, three y el
// runtime) en el chunk del CLIENTE, en una llamada `e.b(t,"static/chunks/turbopack-worker-x.js",[...chunks])`. De ahi se lee el peso.
const workerSet = new Set();
for (const n of names) {
  for (const [, entry, list] of text(n).matchAll(/"static\/chunks\/(turbopack-worker-[\w.~-]+\.js)",\[([^\]]*)\]/g)) {
    const members = [entry, ...[...list.matchAll(/static\/chunks\/([\w.~-]+\.js)/g)].map((m) => m[1])].filter((f) => byName.has(f) && !initialAll.has(f));
    if (members.some((f) => text(f).includes("sgomez-glass-worker"))) members.forEach((f) => workerSet.add(f));
  }
}
const clientSeeds = names.filter((n) => text(n).includes("sgomez-glass-client") && !workerSet.has(n));
for (const [label, seeds, exclude, limit] of [
  ["cliente del cristal", clientSeeds, new Set([...initialAll, ...workerSet]), BUDGET.glassClientKB],
  ["worker del cristal", [...workerSet], null, BUDGET.glassWorkerKB],
]) {
  if (seeds.length === 0) { console.log(`\n${label}: todavia no existe`); continue; }
  const g = exclude ? chunkGraph(names, seeds, text, exclude) : new Set(seeds);
  const kb = [...g].reduce((sum, n) => sum + gz(byName.get(n)), 0);
  console.log(`\n${label}: ${kb.toFixed(1)} KB gzip en ${g.size} chunks`);
  for (const n of g) console.log(`  ${gz(byName.get(n)).toFixed(1).padStart(6)}  ${n}`);
  if (kb > limit) { failed = true; console.error(`  SE PASA de ${limit} KB`); }
}

const css = files.filter((f) => f.endsWith(".css"));
const cssKB = css.reduce((s, f) => s + gz(join(chunks, f)), 0);
console.log(`\nCSS: ${cssKB.toFixed(1)} KB gzip en ${css.length} ficheros`);
if (BUDGET.cssKB > 0 && cssKB > BUDGET.cssKB) { failed = true; console.error(`  SE PASA de ${BUDGET.cssKB} KB`); }

process.exit(failed ? 1 : 0);
