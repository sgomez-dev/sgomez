// Renderiza todos los medios del 404 con UN comando: `npm run render`.
// Todo corre en local (Chromium de Remotion + ffmpeg de Remotion + sharp). Sin nube.
//
//   npm run render            vídeos y pósters, a sgomez/public/media/404
//   npm run draft             10 fotogramas a video/out, para probar la tubería
//   npm run render -- --only=webm,mp4,posters
//   npm run render -- --only=build      secuencia de fotogramas del capítulo 03, a sgomez/public/media/build
//   npm run render -- --only=monogram   el logotipo de SkyQuetz que se forma (capítulo 07), a sgomez/public/media/skyquetz
//   npm run render -- --only=forgia     el logotipo de Forgia que se forma con el mismo cristal, a sgomez/public/media/forgia
//   npm run render -- --only=hero       el bucle del cristal del hero (móvil y horizontal), a sgomez/public/media/hero
//   npm run render -- --only=reels      un reel por proyecto destacado (capítulo 05), a sgomez/public/media/reels
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { PROJECTS } from "./projects.mjs";
import { copyFileSync } from "node:fs";

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
// Secuencia del capítulo 03 (BuildSequence): 90 fotogramas WebP con alfa. Presupuesto: <= 4 MB en escritorio, <= 1,5 MB en móvil.
const BUILD_WEBP = { quality: 70, alphaQuality: 70 };
const BUILD_POSTER_QUALITY = 78;
const buildMedia = resolve(root, "..", "sgomez", "public", "media", "build");

// Reels del capítulo 05 (ProjectReel): 960x540, 8 s a 30 fps, opacos, sin audio. Presupuesto: <= 600 KB cada fichero.
const REEL_WEBM_CRF = 52;
const REEL_MP4_CRF = 30;
const REEL_POSTER_QUALITY = 82;
const reelsMedia = resolve(root, "..", "sgomez", "public", "media", "reels");

// Capítulo 07 (SkyQuetzMonogram): 850x506 a 60 fps, 2,5 s. WebM con alfa y MP4 sobre negro para Safari. Presupuesto: <= 400 KB cada fichero.
const MONO_WEBM_CRF = 52;
const MONO_MP4_CRF = 24;
const monoMedia = resolve(root, "..", "sgomez", "public", "media", "skyquetz");

// Capítulo de Forgia (ForgiaReveal): 912x264 a 60 fps, 2,5 s, la misma línea de tiempo. Presupuesto: <= 400 KB cada fichero.
const FORGIA_WEBM_CRF = 52;
const FORGIA_MP4_CRF = 24;
const forgiaMedia = resolve(root, "..", "sgomez", "public", "media", "forgia");

// Bucle del hero (HeroLoop): 720x720 a 30 fps, 6 s. WebM con alfa y MP4 sobre negro. Presupuesto: <= 500 KB cada fichero.
const HERO_WEBM_CRF = 36;
const HERO_MP4_CRF = 22;
const heroMedia = resolve(root, "..", "sgomez", "public", "media", "hero");

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

if (want("build") && !draft) {
  let total = {};
  for (const [size, comp, w] of [["desktop", "BuildDesktop", 1200], ["mobile", "BuildMobile", 600]]) {
    const seq = join(tmp, `build-${size}`);
    rmSync(seq, { recursive: true, force: true });
    remotion(["render", entry, comp, seq, "--sequence", "--image-format=png", "--gl=angle"]);
    const dest = join(buildMedia, size);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    const pngs = readdirSync(seq).filter((f) => f.endsWith(".png")).sort();
    let bytes = 0;
    for (const [i, f] of pngs.entries()) {
      const out = join(dest, `${String(i + 1).padStart(4, "0")}.webp`);
      await sharp(join(seq, f)).webp({ ...BUILD_WEBP, effort: 6, smartSubsample: true }).toFile(out);
      bytes += statSync(out).size;
    }
    total[size] = bytes;
    console.log(`  build/${size}: ${pngs.length} fotogramas, ${(bytes / 1024).toFixed(0)} KB`);
    if (size === "desktop") {
      const out = join(buildMedia, "poster.webp");
      await sharp(join(seq, pngs[pngs.length - 1])).webp({ quality: BUILD_POSTER_QUALITY, alphaQuality: 90, effort: 6, smartSubsample: true }).toFile(out);
      sizes["build/poster.webp"] = out;
    }
  }
}

if (want("reels") && !draft) {
  mkdirSync(reelsMedia, { recursive: true });
  for (const { slug } of PROJECTS) {
    if (!existsSync(join(root, "public", "projects", slug, "top.png"))) {
      console.warn(`  reels/${slug}: sin capturas (node scripts/capture-projects.mjs), se omite`);
      continue;
    }
    const p = props(`reel-${slug}`, { slug });
    const webm = join(reelsMedia, `${slug}.webm`);
    const mp4 = join(reelsMedia, `${slug}.mp4`);
    remotion(["render", entry, "ProjectReel", webm, "--codec=vp9", "--pixel-format=yuv420p", "--image-format=png", `--crf=${REEL_WEBM_CRF}`, "--muted", p]);
    remotion(["render", entry, "ProjectReel", mp4, "--codec=h264", "--pixel-format=yuv420p", "--image-format=png", `--crf=${REEL_MP4_CRF}`, "--x264-preset=veryslow", "--muted", p]);
    // El póster es el fotograma 0: el vídeo arranca exactamente donde estaba la imagen.
    const png = join(tmp, `reel-${slug}.png`);
    remotion(["still", entry, "ProjectReel", png, "--frame=0", "--image-format=png", p]);
    const poster = join(reelsMedia, `${slug}.webp`);
    await sharp(png).webp({ quality: REEL_POSTER_QUALITY, effort: 6, smartSubsample: true }).toFile(poster);
    sizes[`reels/${slug}.webm`] = webm;
    sizes[`reels/${slug}.mp4`] = mp4;
    sizes[`reels/${slug}.webp`] = poster;
  }
}

if (want("monogram") && !draft) {
  mkdirSync(monoMedia, { recursive: true });
  // El último fotograma es la imagen de la página (la <img> de SkyQuetz.tsx): se usa el mismo fichero, sin copia versionada.
  mkdirSync(join(root, "public", "brand"), { recursive: true });
  copyFileSync(resolve(root, "..", "sgomez", "public", "brand", "skyquetz-logo.webp"), join(root, "public", "brand", "skyquetz-logo.webp"));
  const webm = join(monoMedia, "monogram.webm");
  const mp4 = join(monoMedia, "monogram.mp4");
  remotion(["render", entry, "SkyQuetzMonogram", webm, "--codec=vp9", "--pixel-format=yuva420p", "--image-format=png", `--crf=${MONO_WEBM_CRF}`, "--muted", "--gl=angle", props("mono-webm", { bg: "transparent" })]);
  remotion(["render", entry, "SkyQuetzMonogram", mp4, "--codec=h264", "--pixel-format=yuv420p", "--image-format=png", `--crf=${MONO_MP4_CRF}`, "--x264-preset=veryslow", "--muted", "--gl=angle", props("mono-mp4", { bg: BG })]);
  sizes["skyquetz/monogram.webm"] = webm;
  sizes["skyquetz/monogram.mp4"] = mp4;
}

if (want("forgia") && !draft) {
  mkdirSync(forgiaMedia, { recursive: true });
  // El último fotograma es la imagen de la página (la <img> de Forgia.tsx): se usa el mismo SVG, sin copia versionada.
  mkdirSync(join(root, "public", "brand"), { recursive: true });
  copyFileSync(resolve(root, "..", "sgomez", "public", "brand", "forgia-logo.svg"), join(root, "public", "brand", "forgia-logo.svg"));
  const webm = join(forgiaMedia, "reveal.webm");
  const mp4 = join(forgiaMedia, "reveal.mp4");
  remotion(["render", entry, "ForgiaReveal", webm, "--codec=vp9", "--pixel-format=yuva420p", "--image-format=png", `--crf=${FORGIA_WEBM_CRF}`, "--muted", "--gl=angle", props("forgia-webm", { bg: "transparent" })]);
  remotion(["render", entry, "ForgiaReveal", mp4, "--codec=h264", "--pixel-format=yuv420p", "--image-format=png", `--crf=${FORGIA_MP4_CRF}`, "--x264-preset=veryslow", "--muted", "--gl=angle", props("forgia-mp4", { bg: BG })]);
  sizes["forgia/reveal.webm"] = webm;
  sizes["forgia/reveal.mp4"] = mp4;
}

if (want("hero") && !draft) {
  mkdirSync(heroMedia, { recursive: true });
  const webm = join(heroMedia, "loop.webm");
  const mp4 = join(heroMedia, "loop.mp4");
  remotion(["render", entry, "HeroLoop", webm, "--codec=vp9", "--pixel-format=yuva420p", "--image-format=png", `--crf=${HERO_WEBM_CRF}`, "--muted", "--gl=angle", props("hero-webm", { bg: "transparent" })]);
  remotion(["render", entry, "HeroLoop", mp4, "--codec=h264", "--pixel-format=yuv420p", "--image-format=png", `--crf=${HERO_MP4_CRF}`, "--x264-preset=veryslow", "--muted", "--gl=angle", props("hero-mp4", { bg: BG })]);
  sizes["hero/loop.webm"] = webm;
  sizes["hero/loop.mp4"] = mp4;
}

console.log("\nTamaños:");
let videoTotal = 0;
for (const [name, p] of Object.entries(sizes)) {
  if (!existsSync(p)) continue;
  console.log(`  ${name.padEnd(28)} ${kb(p)} KB`);
  if (name.startsWith("shatter.")) videoTotal += statSync(p).size;
}
if (videoTotal) console.log(`  vídeos juntos (tope 1536 KB)  ${(videoTotal / 1024).toFixed(1)} KB`);
