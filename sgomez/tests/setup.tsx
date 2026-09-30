import { vi } from "vitest";

// next/image y next/link necesitan el runtime de Next; para renderToStaticMarkup
// basta con sus equivalentes planos.
vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority, ...p }: Record<string, unknown>) => <img data-priority={priority ? "true" : undefined} {...p} />,
}));
vi.mock("next/link", () => ({
  default: ({ prefetch: _prefetch, ...p }: Record<string, unknown>) => <a {...p} />,
}));
