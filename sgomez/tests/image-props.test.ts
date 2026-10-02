import { describe, expect, it, vi } from "vitest";

/**
 * `imageProps` usa el módulo interno `get-img-props` de Next para no arrastrar el componente de cliente de `next/image`
 * al JS inicial. Si una actualización de Next cambia su salida, este test lo dice: tiene que ser la de `getImageProps`.
 */
describe("imageProps", () => {
  it("da las mismas props que getImageProps de next/image", async () => {
    const { imageProps } = await vi.importActual<typeof import("@/lib/image-props")>("@/lib/image-props");
    const { getImageProps } = await vi.importActual<typeof import("next/image")>("next/image");
    const input = { src: "/Retrato.png", alt: "x", width: 1080, height: 1080, priority: true, sizes: "224px" } as const;
    const mine = imageProps({ ...input });
    const theirs = getImageProps({ ...input }).props;
    expect(mine).toEqual(theirs);
    expect(mine.srcSet).toContain("/_next/image?url=%2FRetrato.png&w=640&q=75 640w");
  });

  it("con fill pasa el estilo de caja absoluta", async () => {
    const { imageProps } = await vi.importActual<typeof import("@/lib/image-props")>("@/lib/image-props");
    const p = imageProps({ src: "/a.png", alt: "", fill: true, sizes: "100vw" });
    expect(p.style).toMatchObject({ position: "absolute", width: "100%", height: "100%" });
    expect(p).not.toHaveProperty("fill");
  });
});
