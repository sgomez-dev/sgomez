import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

for (const path of ["/", "/en", "/about", "/en/contact", "/developers", "/no-existe", "/en/no-existe"]) {
  test(`axe WCAG 2 A/AA sin violaciones en ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const summary = violations.map((v) => `${v.id} (${v.impact}) ${v.nodes[0]?.target.join(" ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
