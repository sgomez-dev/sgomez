// Fecha real del último cambio de contenido de cada página, desde git (spec §8.4), nunca la del build.
// Uso: node scripts/content-dates.mjs          escribe src/lib/routing/content-dates.json
//      node scripts/content-dates.mjs --check  falla si el JSON no está al día (lo corre el CI)
// Vercel no tiene la historia completa: lee el JSON commiteado. Se usa la fecha de autor (no cambia al hacer
// rebase) y un fichero con cambios sin commitear cuenta como modificado hoy, para que el JSON y su commit casen.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** De qué ficheros sale el CONTENIDO de cada página. El diseño (capítulos, CSS) no cambia la fecha. */
export const SOURCES = {
  "/": ["src/app/content/index.tsx", "src/lib/api/data.ts", "src/i18n/dictionaries"],
  "/about": ["src/lib/content/pages.ts", "src/app/content/index.tsx"],
  "/contact": ["src/lib/content/pages.ts", "src/lib/contact"],
  "/developers": ["src/lib/content/pages.ts", "src/lib/api"],
  "/privacy": ["src/lib/content/pages.ts"],
};

const OUT = join("src", "lib", "routing", "content-dates.json");
const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
const today = new Date().toISOString().slice(0, 10);

function dateOf(paths) {
  if (git("status", "--porcelain", "--", ...paths)) return today;
  // La fecha de autor en UTC (%at), como `today`: con %as salía en la zona del autor y un commit hecho de
  // madrugada en Madrid quedaba «en el futuro» para el test y para el sitemap.
  const at = git("log", "-1", "--format=%at", "--", ...paths);
  const d = at ? new Date(Number(at) * 1000).toISOString().slice(0, 10) : "";
  if (!d) throw new Error(`sin historia en git para ${paths.join(", ")}: ¿checkout superficial? (fetch-depth: 0)`);
  return d;
}

// Solo al ejecutarlo: el test importa SOURCES sin escribir nada.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const dates = Object.fromEntries(Object.entries(SOURCES).map(([route, paths]) => [route, dateOf(paths)]));
  const json = JSON.stringify(dates, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    const cur = readFileSync(OUT, "utf8");
    if (cur !== json) {
      console.error(`content-dates.json no está al día. Ejecuta: node scripts/content-dates.mjs\nesperado:\n${json}actual:\n${cur}`);
      process.exit(1);
    }
    console.log("content-dates.json al día");
  } else {
    writeFileSync(OUT, json);
    console.log(json);
  }
}
