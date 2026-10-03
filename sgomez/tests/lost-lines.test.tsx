import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import LostStage from "@/chapters/lost/LostStage";

const css = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

describe("líneas del 404", () => {
  const html = renderToStaticMarkup(<LostStage lang="en" />);
  it("las dos svg de líneas tienen su propia marca y no la de lo estático", () => {
    expect(html.match(/<svg[^>]*data-lost-lines=""/g)).toHaveLength(2);
    expect(html).not.toMatch(/<svg[^>]*data-lost-static[^>]*viewBox="0 0 100 100"/);
  });
  it("se van y vuelven con fundido y se retiran sin transición cuando la escena pinta las suyas", () => {
    expect(css).toMatch(/\[data-lost-lines="out"\] \[data-lost-lines\] \{ opacity: 0; \}/);
    expect(css).toMatch(/\[data-lost-lines="in"\] \[data-lost-lines\] \{ opacity: 1;/);
    expect(css).toMatch(/\[data-lost-cover="scene"\] \[data-lost-lines\] \{ opacity: 0; transition: none; \}/);
  });
});
