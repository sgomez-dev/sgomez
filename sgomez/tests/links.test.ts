import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(path.join(dir, d.name)) : d.name.endsWith(".tsx") ? [path.join(dir, d.name)] : []));
}

describe("<Link> sin prefetch", () => {
  it("todo <Link> declara prefetch={false}", () => {
    for (const f of files("src")) {
      const src = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
      for (const m of src.matchAll(/<Link\b[^>]*>/g)) expect(m[0], f).toMatch(/prefetch=\{false\}/);
    }
  });
});
