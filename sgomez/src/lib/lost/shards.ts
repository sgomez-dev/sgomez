/**
 * Configuración compartida de los fragmentos del 404.
 *
 * SIN imports: ni React, ni Next, ni alias `@/`. El proyecto de Remotion
 * (render local del estallido) y la escena 3D en vivo importan ESTE fichero por
 * ruta relativa, y el 404 estático lo usa para colocar los enlaces. Los enlaces
 * en sí se resuelven en `shard-links.ts`, que sí depende del catálogo de rutas.
 */
export type ShardTarget = "home" | "about" | "work" | "openSource" | "contact" | "developers" | "agents";

export type Shard = {
  /** "s1"…"s12" */
  id: string;
  /** null = decorativo, sin enlace. */
  target: ShardTarget | null;
  /** Pose final en 3D, en unidades de mundo (cámara en z = 9, fov 35). */
  pose: { x: number; y: number; z: number; rx: number; ry: number; rz: number };
  /** Tamaño relativo, 0.4 a 1.4. */
  scale: number;
  /** Variante de paleta del degradado de cristal. */
  hue: "a" | "b" | "c";
  /**
   * Posición del CENTRO del fragmento, en % de la caja del escenario, para el
   * layout estático y la capa de enlaces. `mobile` es el escenario apilado bajo
   * el texto (caja de altura fija); `desktop` el escenario a pantalla completa.
   */
  stage: { desktop: { left: number; top: number }; mobile: { left: number; top: number } };
};

export const CAMERA = { fov: 35, position: [0, 0, 9] as const };

export const SHARDS: readonly Shard[] = [
  { id: "s1", target: "home", pose: { x: 1.45, y: -1.02, z: 0.3, rx: 0.4, ry: -0.5, rz: 0.5 }, scale: 0.8, hue: "a", stage: { desktop: { left: 66, top: 68 }, mobile: { left: 22, top: 64 } } },
  { id: "s2", target: "about", pose: { x: 2.27, y: 1.76, z: -0.2, rx: -0.3, ry: 0.6, rz: -0.7 }, scale: 0.7, hue: "b", stage: { desktop: { left: 75, top: 19 }, mobile: { left: 74, top: 15 } } },
  { id: "s3", target: "work", pose: { x: 1.09, y: 1.08, z: 0.6, rx: 0.2, ry: 0.3, rz: 0.45 }, scale: 1.0, hue: "a", stage: { desktop: { left: 62, top: 31 }, mobile: { left: 26, top: 14 } } },
  { id: "s4", target: "openSource", pose: { x: 3.27, y: 0.68, z: -0.4, rx: 0.5, ry: -0.2, rz: 1.0 }, scale: 0.85, hue: "c", stage: { desktop: { left: 86, top: 38 }, mobile: { left: 24, top: 36 } } },
  { id: "s5", target: "contact", pose: { x: 2.63, y: -0.57, z: 0.5, rx: -0.4, ry: 0.4, rz: -0.35 }, scale: 1.1, hue: "b", stage: { desktop: { left: 79, top: 60 }, mobile: { left: 50, top: 52 } } },
  { id: "s6", target: "developers", pose: { x: 3.81, y: -1.25, z: -0.3, rx: 0.3, ry: -0.6, rz: 0.8 }, scale: 0.75, hue: "c", stage: { desktop: { left: 92, top: 72 }, mobile: { left: 50, top: 73 } } },
  { id: "s7", target: "agents", pose: { x: 3.54, y: 1.87, z: 0.1, rx: -0.2, ry: 0.5, rz: -0.9 }, scale: 0.65, hue: "a", stage: { desktop: { left: 89, top: 17 }, mobile: { left: 76, top: 37 } } },
  { id: "s8", target: null, pose: { x: 0.73, y: 0.11, z: -0.6, rx: 0.6, ry: 0.1, rz: -0.9 }, scale: 0.5, hue: "b", stage: { desktop: { left: 58, top: 48 }, mobile: { left: 50, top: 29 } } },
  { id: "s9", target: null, pose: { x: 1.91, y: 0.17, z: 0.2, rx: -0.5, ry: -0.4, rz: 0.2 }, scale: 0.45, hue: "c", stage: { desktop: { left: 71, top: 47 }, mobile: { left: 78, top: 62 } } },
  { id: "s10", target: null, pose: { x: 4.18, y: -0.11, z: 0.4, rx: 0.2, ry: 0.7, rz: 0.6 }, scale: 0.4, hue: "a", stage: { desktop: { left: 94, top: 52 }, mobile: { left: 90, top: 47 } } },
  { id: "s11", target: null, pose: { x: 0.18, y: -1.48, z: -0.5, rx: -0.6, ry: 0.2, rz: -0.4 }, scale: 0.4, hue: "b", stage: { desktop: { left: 52, top: 76 }, mobile: { left: 86, top: 78 } } },
  { id: "s12", target: null, pose: { x: 1.82, y: -2.04, z: 0.1, rx: 0.3, ry: -0.3, rz: 0.7 }, scale: 0.5, hue: "c", stage: { desktop: { left: 70, top: 86 }, mobile: { left: 12, top: 80 } } },
];

/** Aristas de la constelación entre ids de fragmentos. */
export const LINES: readonly (readonly [string, string])[] = [
  ["s3", "s2"],
  ["s2", "s7"],
  ["s7", "s4"],
  ["s4", "s5"],
  ["s5", "s6"],
  ["s5", "s1"],
  ["s1", "s8"],
  ["s8", "s3"],
  ["s2", "s5"],
  ["s9", "s5"],
  ["s9", "s3"],
  ["s4", "s10"],
  ["s1", "s12"],
  ["s1", "s11"],
];

/**
 * Aristas del layout apilado (móvil): vecinos cercanos, casi planares. Cada
 * fragmento tiene grado 1 a 3 y ninguna arista pasa del 35% del escenario.
 */
export const LINES_MOBILE: readonly (readonly [string, string])[] = [
  ["s3", "s8"],
  ["s8", "s2"],
  ["s8", "s4"],
  ["s2", "s7"],
  ["s4", "s5"],
  ["s7", "s5"],
  ["s7", "s10"],
  ["s10", "s9"],
  ["s5", "s6"],
  ["s9", "s6"],
  ["s9", "s11"],
  ["s4", "s1"],
  ["s1", "s12"],
];

/**
 * ¿Existen los pósters renderizados (`public/media/404/constellation.webp` y
 * `constellation-mobile.webp`)? Constante a mano; un test la compara con el disco.
 * Es `true` desde que Task 3 commitea ambos pósters.
 */
export const HAS_POSTER = true;
