#!/usr/bin/env node
/**
 * Comprobación de cabeceras contra un despliegue real.
 *
 * Existe porque el fallo que vigila no se ve en local: en Vercel las páginas
 * prerenderizadas salen de la caché con el `Vary` que el builder guarda junto
 * al HTML, y solo la transformación de `vercel.json` le añade `Accept`. Con
 * `next start` esa capa no existe, así que ni vitest ni el e2e pueden verlo.
 *
 * Uso: node scripts/post-deploy-smoke.mjs https://sgomez-xxxx.vercel.app
 *
 * Las previews están protegidas. Con la variable VERCEL_AUTOMATION_BYPASS_SECRET
 * (Vercel, Settings, Deployment Protection, Protection Bypass for Automation)
 * cada petición lleva la cabecera `x-vercel-protection-bypass`.
 */

const base = (process.argv[2] ?? process.env.DEPLOY_URL ?? "").replace(/\/$/, "");
if (!base) {
  console.error("Falta la URL del despliegue.");
  process.exit(2);
}

const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const failures = [];
const check = (ok, message) => {
  console.log(`${ok ? "ok  " : "FAIL"} ${message}`);
  if (!ok) failures.push(message);
};

async function get(path, accept) {
  const headers = { accept };
  if (bypass) headers["x-vercel-protection-bypass"] = bypass;
  const response = await fetch(base + path, { headers, redirect: "manual" });
  const body = await response.text();
  return { status: response.status, headers: response.headers, body };
}

/** Tokens de Vary en minúsculas. fetch une las cabeceras repetidas con comas. */
const varyTokens = (headers) => (headers.get("vary") ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

// 1. HTML: dos peticiones por página, para ver la que se prerenderiza y la que sale de la caché.
for (const path of ["/", "/en", "/about", "/work/claude-canvas", "/llms.txt"]) {
  for (const round of [1, 2]) {
    const { status, headers } = await get(path, "text/html");
    const cache = headers.get("x-vercel-cache") ?? "-";
    const vary = varyTokens(headers);
    check(status === 200, `${path} (${round}, ${cache}) responde 200 (${status})`);
    check(vary.includes("accept"), `${path} (${round}, ${cache}) lleva Accept en Vary (${headers.get("vary")})`);
    if (path !== "/llms.txt") check(vary.includes("rsc"), `${path} (${round}, ${cache}) conserva RSC en Vary`);
  }
}

// 2. Markdown en la misma URL.
for (const path of ["/", "/about"]) {
  const { status, headers } = await get(path, "text/markdown");
  check(status === 200 && (headers.get("content-type") ?? "").startsWith("text/markdown"), `${path} en markdown (${status}, ${headers.get("content-type")})`);
  check(varyTokens(headers).includes("accept"), `${path} en markdown lleva Accept en Vary`);
}

// 3. Índice de la API en JSON.
for (const path of ["/api", "/api/v1"]) {
  const { status, headers, body } = await get(path, "application/json");
  let endpoints = 0;
  try {
    endpoints = JSON.parse(body).data.endpoints.length;
  } catch {
    endpoints = 0;
  }
  check(status === 200 && (headers.get("content-type") ?? "").startsWith("application/json"), `${path} es JSON 200 (${status})`);
  check(endpoints > 0, `${path} lista ${endpoints} operaciones`);
  check((headers.get("link") ?? "").includes('rel="service-desc"'), `${path} lleva Link service-desc`);
}

// 4. Catálogo RFC 9727.
{
  const { status, headers, body } = await get("/.well-known/api-catalog", "application/linkset+json");
  check(status === 200 && (headers.get("content-type") ?? "").startsWith("application/linkset+json"), `/.well-known/api-catalog (${status}, ${headers.get("content-type")})`);
  check(body.includes('"service-desc"') && body.includes('"service-doc"'), "el catálogo enlaza service-desc y service-doc");
}

// 5. Link de descubrimiento en la home y JSON-LD de las empresas.
{
  const { headers, body } = await get("/", "text/html");
  const link = headers.get("link") ?? "";
  check(link.includes('rel="service-desc"') && link.includes('rel="api-catalog"'), "la home lleva Link service-desc y api-catalog");
  check(body.includes('"@id":"https://sgomez.dev/#forgia-org"') && body.includes("wa.me/593984847671"), "el JSON-LD de Forgia lleva su contactPoint");
  check(body.includes("contacto@skyquetz.com"), "el JSON-LD de SkyQuetz lleva su contactPoint");
}

if (failures.length > 0) {
  console.error(`\n${failures.length} comprobaciones fallidas en ${base}`);
  process.exit(1);
}
console.log(`\nTodo correcto en ${base}`);
