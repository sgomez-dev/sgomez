import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const wf = readFileSync(join(process.cwd(), "..", ".github", "workflows", "indexnow.yml"), "utf8");

describe("IndexNow", () => {
  it("la clave del workflow se sirve en public/<clave>.txt con su propio valor", () => {
    const key = wf.match(/KEY: ([0-9a-f]{32})/)![1]!;
    const file = join(process.cwd(), "public", `${key}.txt`);
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file, "utf8")).toBe(key);
  });
  it("solo se dispara tras un despliegue de producción con éxito", () => {
    expect(wf).toMatch(/deployment_status\.state == 'success' && github\.event\.deployment\.environment == 'Production'/);
  });
});
