import { vi } from "vitest";

// next/image y next/link necesitan el runtime de Next; para renderToStaticMarkup
// basta con sus equivalentes planos.
vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority, ...p }: Record<string, unknown>) => <img data-priority={priority ? "true" : undefined} {...p} />,
}));
// imageProps (Portrait, SkyQuetz, LatestPosts): las props de un <img> normal, sin el optimizador.
vi.mock("@/lib/image-props", () => ({
  imageProps: ({ fill: _fill, priority: _priority, ...p }: Record<string, unknown>) => p,
}));
vi.mock("next/link", () => ({
  default: ({ prefetch: _prefetch, ...p }: Record<string, unknown>) => <a {...p} />,
}));
