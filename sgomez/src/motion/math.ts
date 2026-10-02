const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Ease-out expo: arranca rápido y se posa. Exacto en los extremos. */
export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : t <= 0 ? 0 : 1 - 2 ** (-10 * clamp01(t));
}

/** Parte un texto en palabras y huecos sin perder ni un carácter. */
export function wordSpans(text: string): { word: string; space: boolean }[] {
  return (text.match(/\s+|[^\s]+/g) ?? []).map((w) => ({ word: w, space: /^\s+$/.test(w) }));
}

export type Spring1D = { x: number; v: number };

/** Un paso de muelle amortiguado (Euler semiimplícito). Conserva la velocidad: es la inercia. */
export function springStep(s: Spring1D, target: number, dt: number, stiffness = 170, damping = 22): Spring1D {
  const v = s.v + (-stiffness * (s.x - target) - damping * s.v) * dt;
  return { x: s.x + v * dt, v };
}

export function springSettled(s: Spring1D, target: number, eps = 0.01): boolean {
  return Math.abs(s.x - target) < eps && Math.abs(s.v) < eps;
}

/** Desplazamiento de un imán: el puntero relativo al centro, recortado a `strength` px. */
export function magneticOffset(px: number, py: number, rect: { left: number; top: number; width: number; height: number }, strength: number): [number, number] {
  const nx = (px - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
  const ny = (py - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
  const c = (n: number) => Math.max(-1, Math.min(1, n)) * strength;
  return [c(nx), c(ny)];
}
