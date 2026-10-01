// Renderiza todos los medios del 404 con UN comando: `npm run render`.
// Todo corre en local (Chromium de Remotion + ffmpeg de Remotion + sharp). Sin nube.
//
//   npm run render            vídeos y pósters, a sgomez/public/media/404
//   npm run draft             10 fotogramas a video/out, para probar la tubería
//   npm run render -- --only=webm,mp4,posters
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const media = resolve(root, "..", "sgomez", "public", "media", "404");
const tmp = join(root, "out");
const entry = "src/index.ts";

// Ajustes de peso. Presupuesto: vídeos juntos <= 1,5 MB, cada webp <= 200 KB.
const WEBM_CRF = 40; // VP9 con alfa, menor número = más calidad
const MP4_CRF = 27; // H.264 sobre negro puro (screen en la página)
const WEBP_QUALITY = { "poster-end": 78 };
// Negro puro: en la página el MP4 se pinta con mix-blend-mode: screen, así que el negro es transparente.
const BG = "#000000";

const args = process.argv.slice(2);
const draft = args.includes("--draft");
const only = (args.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);
const want = (k) => only.length === 0 || only.includes(k);

mkdirSync(tmp, { recursive: true });
if (!draft) mkdirSync(media, { recursive: true });

function remotion(cliArgs) {
  const r = spawnSync("npx", ["remotion", ...cliArgs], { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`remotion ${cliArgs.join(" ")} falló con código ${r.status}`);
    process.exit(r.status ?? 1);
  }
}

function props(name, value) {
  const file = join(tmp, `props-${name}.json`);
  writeFileSync(file, JSON.stringify(value));
  return `--props=${file}`;
}

const frames = draft ? ["--frames=0-9"] : [];
const sizes = {};
const kb = (p) => (statSync(p).size / 1024).toFixed(1);

if (want("webm")) {
  const out = draft ? join(tmp, "draft.webm") : join(media, "shatter.webm");
  remotion(["render", entry, "Shatter404", out, "--codec=vp9", "--pixel-format=yuva420p", "--image-format=png", `--crf=${WEBM_CRF}`, "--muted", props("webm", { bg: "transparent" }), ...frames]);
  sizes["shatter.webm"] = out;
}

if (want("mp4")) {
  const out = draft ? join(tmp, "draft.mp4") : join(media, "shatter.mp4");
  remotion(["render", entry, "Shatter404", out, "--codec=h264", "--pixel-format=yuv420p", "--image-format=png", `--crf=${MP4_CRF}`, "--x264-preset=veryslow", "--muted", props("mp4", { bg: BG }), ...frames]);
  sizes["shatter.mp4"] = out;
}

// Póster final: still del último fotograma en PNG con alfa y recompresión a WebP con alfa (sin líneas, 1920x1080).
const stills = [
  { name: "poster-end", comp: "Shatter404", frame: 119, extra: [props("poster", { bg: "transparent" })] },
];

if (want("posters") && !draft) {
  for (const s of stills) {
    const png = join(tmp, `${s.name}.png`);
    remotion(["still", entry, s.comp, png, `--frame=${s.frame}`, "--image-format=png", ...s.extra]);
    const out = join(media, `${s.name}.webp`);
    await sharp(png).webp({ quality: WEBP_QUALITY[s.name], alphaQuality: 90, effort: 6, smartSubsample: true }).toFile(out);
    sizes[`${s.name}.webp`] = out;
  }
}

console.log("\nTamaños:");
let videoTotal = 0;
for (const [name, p] of Object.entries(sizes)) {
  if (!existsSync(p)) continue;
  console.log(`  ${name.padEnd(28)} ${kb(p)} KB`);
  if (name.startsWith("shatter.")) videoTotal += statSync(p).size;
}
if (videoTotal) console.log(`  vídeos juntos (tope 1536 KB)  ${(videoTotal / 1024).toFixed(1)} KB`);
