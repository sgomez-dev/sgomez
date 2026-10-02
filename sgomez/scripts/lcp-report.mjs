// Uso: npm run lcp:report -- .lighthouseci [otra carpeta...]. Lee los lhr-*.json y resume el LCP.
import { readFileSync, readdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { summarize, markdownTable } from "./lcp-report-lib.mjs";

const dirs = process.argv.slice(2);
for (const dir of dirs.length ? dirs : [".lighthouseci"]) {
  const rows = readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f)).map((f) => summarize(JSON.parse(readFileSync(join(dir, f), "utf8"))));
  const md = `\n### ${dir}\n\n${markdownTable(rows)}`;
  console.log(md);
  for (const r of rows) console.log(r.url, "main thread:", JSON.stringify(r.mainThread), "bootup:", JSON.stringify(r.bootup));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
