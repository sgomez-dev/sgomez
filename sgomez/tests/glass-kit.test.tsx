import { describe, expect, it } from "vitest";
import { materialParams, slabGeometry, shardGeometry } from "@/three/glass-kit";
import { GLASS_MATERIAL, SHARDS } from "@/lib/lost/shards";
import { renderToStaticMarkup } from "react-dom/server";
import GlassPoster from "@/components/GlassPoster";
import { POSTER_SILHOUETTE } from "@/lib/lost/shards";

describe("glass-kit", () => {
  it("el perfil full es el material del 404 tal cual", () => {
    const p = materialParams("full");
    expect(p.transmission).toBe(GLASS_MATERIAL.transmission);
    expect(p.dispersion).toBe(GLASS_MATERIAL.dispersion);
  });
  it("el perfil lite quita la transmisión (sin pase de transmisión ni su shader)", () => {
    const p = materialParams("lite");
    expect(p.transmission).toBe(0);
    expect(p.dispersion).toBe(0);
    expect(p.iridescence).toBe(GLASS_MATERIAL.iridescence);
    expect(p.clearcoat).toBe(GLASS_MATERIAL.clearcoat);
  });
  it("las geometrías se construyen sin DOM", () => {
    const slab = slabGeometry();
    expect(slab.attributes.position!.count).toBeGreaterThan(100);
    expect(shardGeometry(SHARDS[0]!).attributes.position!.count).toBeGreaterThan(10);
    slab.dispose();
  });
  it("el cristal entero y el póster SVG comparten la misma silueta", () => {
    expect(renderToStaticMarkup(<GlassPoster />)).toContain(`d="${POSTER_SILHOUETTE.d}"`);
    const slab = slabGeometry();
    slab.computeBoundingBox();
    const b = slab.boundingBox!;
    // la caja del cristal (frontal) ronda el radio de GLASS: ni losa ni fragmento
    expect(b.max.x - b.min.x).toBeGreaterThan(2.4);
    expect(b.max.x - b.min.x).toBeLessThan(4);
    slab.dispose();
  });
});
