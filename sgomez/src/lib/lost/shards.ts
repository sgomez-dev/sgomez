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
   * Posición del CENTRO del fragmento en el escenario apilado de móvil, en % de la
   * caja (autorada, L3). En escritorio no se escribe a mano: sale de `project(pose, 16/9)`.
   */
  stage: { mobile: { left: number; top: number } };
  /** Contorno de la celda de Voronoi normalizado a radio máx. 1, antihorario, centrado en su centroide. Lo escribe `video/scripts/bake-geometry.mjs`. */
  outline: readonly (readonly [number, number])[];
  /** Sitio de la celda en el cristal entero (centro y radio en unidades del cristal). Solo lo usa el vídeo. */
  cell: { cx: number; cy: number; r: number };
};

export const CAMERA = { fov: 35, position: [0, 0, 9] as const };

/** Caja del escenario de escritorio: 16:9 fija. Las posiciones de escritorio salen de proyectar `pose` en ella. */
export const STAGE_ASPECT_DESKTOP = 16 / 9;

/**
 * Geometría del cristal, única fuente para el vídeo (Remotion) y la escena en vivo.
 * Unidades de mundo; el contorno de cada fragmento (`outline`) está normalizado a
 * radio 1 y se escala por `scale * radiusPerScale`. Euler en orden XYZ (three.js).
 */
export const GLASS = {
  slabRadius: 1.55,
  /** Contorno del cristal entero: n lados, radio * (1 + suma de a * sin(k * t + fase)). */
  slabOutline: { n: 72, waves: [[3, 0.07, 1], [5, 0.04, 2]] as readonly (readonly [number, number, number])[] },
  /** Grosor del prisma en unidades normalizadas (antes de escalar). */
  depth: 0.2,
  bevel: { thickness: 0.035, size: 0.03, offset: -0.03, segments: 3 },
  radiusPerScale: 0.42,
  euler: "XYZ",
} as const;

/** Todos los parámetros de MeshPhysicalMaterial del cristal. */
export const GLASS_MATERIAL = {
  color: "#FFFFFF",
  transmission: 1,
  roughness: 0.08,
  iridescence: 1,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [180, 720] as readonly [number, number],
  thickness: 1.2,
  ior: 1.7,
  dispersion: 0.6,
  attenuationColor: "#8FA8FF",
  attenuationDistance: 2.5,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
  specularIntensity: 1,
  envMapIntensity: 1.1,
} as const;

/** Entorno que refleja y refracta el cristal: cúpula cónica, paneles, luces y fondo de refracción. */
export const GLASS_ENV = {
  dome: {
    radius: 30,
    ring: ["#8FA8FF", "#FFFFFF", "#6EF0DC", "#5B6CFF", "#8FA8FF"] as readonly string[],
    /** lobe = base + front * max(0,z)^frontPow + back * max(0,-z)^backPow, con z la componente hacia cámara. */
    lobe: { base: 0.22, front: 1.5, frontPow: 6, back: 0.4, backPow: 2 },
  },
  panels: [
    { color: "#FFFFFF", intensity: 14, w: 12, h: 6, pos: [-8, 9, 10] },
    { color: "#8FA8FF", intensity: 9, w: 14, h: 3, pos: [10, 4, 6] },
    { color: "#6EF0DC", intensity: 12, w: 3, h: 16, pos: [11, -2, 4] },
    { color: "#5B6CFF", intensity: 12, w: 16, h: 4, pos: [-6, -9, 7] },
    { color: "#6EF0DC", intensity: 7, w: 5, h: 5, pos: [-12, 1, 3] },
    { color: "#FFFFFF", intensity: 10, w: 4, h: 1.5, pos: [2, 12, -6] },
    { color: "#8FA8FF", intensity: 8, w: 9, h: 9, pos: [0, 2, -14] },
    { color: "#FFFFFF", intensity: 22, w: 1.6, h: 1.6, pos: [6, 7, 12] },
  ] as readonly { color: string; intensity: number; w: number; h: number; pos: readonly [number, number, number] }[],
  lights: [
    { type: "ambient", color: "#FFFFFF", intensity: 0.25 },
    { type: "directional", color: "#FFFFFF", intensity: 2.2, pos: [-3, 5, 7] },
    { type: "point", color: "#6EF0DC", intensity: 40, pos: [6, -2, 3] },
    { type: "point", color: "#5B6CFF", intensity: 45, pos: [-2, -4, 4] },
    { type: "point", color: "#8FA8FF", intensity: 30, pos: [2, 4, 3] },
  ] as readonly { type: "ambient" | "directional" | "point"; color: string; intensity: number; pos?: readonly [number, number, number] }[],
  /** Fondo solo para la refracción (se dibuja en el pase de transmisión, no en el lienzo). */
  backdrop: {
    seed: 31,
    size: 1024,
    base: "#0A1030",
    blobs: [
      { x: 240, y: 280, r: 380, rgb: "91,108,255", a: 0.65 },
      { x: 800, y: 220, r: 340, rgb: "110,240,220", a: 0.5 },
      { x: 720, y: 840, r: 420, rgb: "143,168,255", a: 0.6 },
    ] as readonly { x: number; y: number; r: number; rgb: string; a: number }[],
    beams: [
      { rgb: "143,168,255", a: 0.8 },
      { rgb: "110,240,220", a: 0.85 },
      { rgb: "255,255,255", a: 0.75 },
      { rgb: "91,108,255", a: 0.85 },
      { rgb: "110,240,220", a: 0.6 },
    ] as readonly { rgb: string; a: number }[],
    count: 30,
    plane: { pos: [2, 0, -5] as readonly [number, number, number], scale: 18, repeat: 1.7 },
  },
} as const;

export const SHARDS: readonly Shard[] = [
  {
    id: "s1", target: "home", pose: { x: 1.45, y: -1.02, z: 0.3, rx: 0.4, ry: -0.5, rz: 0.5 }, scale: 0.8, hue: "a",
    stage: { mobile: { left: 22, top: 64 } },
    outline: /*b:s1*/[[0.7059, 0.0023], [0.6358, 0.1807], [0.0035, 0.6047], [-0.5828, 0.5532], [-0.9129, 0.3358], [-0.8524, 0.1946], [-0.7623, 0.0497], [-0.652, -0.081], [-0.5258, -0.1967], [-0.3884, -0.2985], [-0.2432, -0.3886], [-0.0926, -0.4692], [0.0628, -0.5416], [0.2233, -0.6049], [0.3893, -0.6563], [0.5606, -0.6912], [0.7115, -0.7027]]/*e*/,
    cell: /*c:s1*/{ cx: -0.5977, cy: -1.0618, r: 0.8128 }/*e*/,
  },
  {
    id: "s2", target: "about", pose: { x: 2.27, y: 1.76, z: -0.2, rx: -0.3, ry: 0.6, rz: -0.7 }, scale: 0.7, hue: "b",
    stage: { mobile: { left: 74, top: 15 } },
    outline: /*b:s2*/[[0.5167, -0.7825], [0.6338, 0.5494], [0.0581, 0.9891], [-0.9623, -0.2719], [-0.9512, -0.296], [0.3305, -0.8685]]/*e*/,
    cell: /*c:s2*/{ cx: 0.135, cy: 0.3741, r: 0.5695 }/*e*/,
  },
  {
    id: "s3", target: "work", pose: { x: 1.09, y: 1.08, z: 0.6, rx: 0.2, ry: 0.3, rz: 0.45 }, scale: 1.0, hue: "a",
    stage: { mobile: { left: 26, top: 14 } },
    outline: /*b:s3*/[[0.3428, -0.8033], [0.6409, 0.426], [0.6309, 0.4477], [-0.1888, 0.8632], [-0.5003, 0.8659], [-0.4122, -0.8695]]/*e*/,
    cell: /*c:s3*/{ cx: -0.8112, cy: -0.0633, r: 0.6312 }/*e*/,
  },
  {
    id: "s4", target: "openSource", pose: { x: 3.27, y: 0.68, z: -0.4, rx: 0.5, ry: -0.2, rz: 1.0 }, scale: 0.85, hue: "c",
    stage: { mobile: { left: 24, top: 36 } },
    outline: /*b:s4*/[[0.9996, -0.0281], [0.5845, 0.3417], [-0.1432, 0.6157], [-0.2793, 0.5529], [-0.7977, -0.4663], [-0.7246, -0.6523]]/*e*/,
    cell: /*c:s4*/{ cx: 0.5409, cy: -0.5515, r: 0.7795 }/*e*/,
  },
  {
    id: "s5", target: "contact", pose: { x: 2.63, y: -0.57, z: 0.5, rx: -0.4, ry: 0.4, rz: -0.35 }, scale: 1.1, hue: "b",
    stage: { mobile: { left: 50, top: 52 } },
    outline: /*b:s5*/[[0.7876, 0.5405], [-0.5203, 0.067], [-0.5159, -0.4907], [-0.497, -0.4921], [-0.3587, -0.482], [-0.2241, -0.4492], [-0.097, -0.3943], [0.0193, -0.3202], [0.1234, -0.2319], [0.2156, -0.1358], [0.2989, -0.0382], [0.3776, 0.0562], [0.4567, 0.1448], [0.5406, 0.2278], [0.6317, 0.3082], [0.7297, 0.3903], [0.8311, 0.4792], [0.8607, 0.5091]]/*e*/,
    cell: /*c:s5*/{ cx: 0.5107, cy: -1.1287, r: 1.0276 }/*e*/,
  },
  {
    id: "s6", target: "developers", pose: { x: 3.81, y: -1.25, z: -0.3, rx: 0.3, ry: -0.6, rz: 0.8 }, scale: 0.75, hue: "c",
    stage: { mobile: { left: 50, top: 73 } },
    outline: /*b:s6*/[[0.5325, 0.8108], [-0.4522, 0.6951], [-0.5632, -0.5684], [0.3818, -0.9242]]/*e*/,
    cell: /*c:s6*/{ cx: 0.7673, cy: 0.2697, r: 0.6003 }/*e*/,
  },
  {
    id: "s7", target: "agents", pose: { x: 3.54, y: 1.87, z: 0.1, rx: -0.2, ry: 0.5, rz: -0.9 }, scale: 0.65, hue: "a",
    stage: { mobile: { left: 76, top: 37 } },
    outline: /*b:s7*/[[0.7103, -0.4244], [0.9571, -0.2894], [0.9327, -0.2623], [0.8072, -0.1294], [0.6793, -0.0014], [0.5462, 0.1204], [0.405, 0.2329], [0.2538, 0.332], [0.0924, 0.4135], [-0.0774, 0.4749], [-0.2525, 0.5159], [-0.4298, 0.5389], [-0.6069, 0.5484], [-0.7829, 0.5498], [-0.8357, 0.5492], [-0.552, -0.1759], [-0.1017, -0.5199]]/*e*/,
    cell: /*c:s7*/{ cx: 0.5699, cy: 1.0654, r: 0.7279 }/*e*/,
  },
  {
    id: "s8", target: null, pose: { x: 0.73, y: 0.11, z: -0.6, rx: 0.6, ry: 0.1, rz: -0.9 }, scale: 0.5, hue: "b",
    stage: { mobile: { left: 50, top: 29 } },
    outline: /*b:s8*/[[-0.2667, -0.601], [-0.0402, -0.6029], [0.8485, 0.5291], [0.7349, 0.5277], [0.5811, 0.5253], [0.4216, 0.5194], [0.2569, 0.5046], [0.0897, 0.4745], [-0.0746, 0.4226], [-0.2287, 0.3447], [-0.3648, 0.239], [-0.476, 0.1076], [-0.5579, -0.0446], [-0.6093, -0.2102], [-0.633, -0.3814], [-0.6336, -0.4247]]/*e*/,
    cell: /*c:s8*/{ cx: -0.8955, cy: 1.0047, r: 0.8677 }/*e*/,
  },
  {
    id: "s9", target: null, pose: { x: 1.91, y: 0.17, z: 0.2, rx: -0.5, ry: -0.4, rz: 0.2 }, scale: 0.45, hue: "c",
    stage: { mobile: { left: 78, top: 62 } },
    outline: /*b:s9*/[[0.1608, -0.9839], [0.8472, 0.3658], [-0.3927, 0.9197], [-0.7124, -0.3985]]/*e*/,
    cell: /*c:s9*/{ cx: -0.1756, cy: -0.3358, r: 0.5886 }/*e*/,
  },
  {
    id: "s10", target: null, pose: { x: 4.18, y: -0.11, z: 0.4, rx: 0.2, ry: 0.7, rz: 0.6 }, scale: 0.4, hue: "a",
    stage: { mobile: { left: 90, top: 47 } },
    outline: /*b:s10*/[[0.4818, -0.1299], [0.4679, 0.0645], [0.4182, 0.2533], [0.3394, 0.4313], [0.2399, 0.5961], [0.1279, 0.7481], [0.0101, 0.8891], [-0.0862, 0.9963], [-0.3229, 0.8668], [-0.4421, -0.5056], [-0.0157, -0.8853], [0.0832, -0.9279], [0.1771, -0.8332], [0.2974, -0.6799], [0.3935, -0.5088], [0.4567, -0.3234]]/*e*/,
    cell: /*c:s10*/{ cx: 1.332, cy: 0.0986, r: 0.759 }/*e*/,
  },
  {
    id: "s11", target: null, pose: { x: 0.18, y: -1.48, z: -0.5, rx: -0.6, ry: 0.2, rz: -0.4 }, scale: 0.4, hue: "b",
    stage: { mobile: { left: 86, top: 78 } },
    outline: /*b:s11*/[[0.2581, -0.7335], [0.1823, 0.7593], [-0.2516, 0.9678], [-0.2534, 0.8184], [-0.2398, 0.6255], [-0.2202, 0.4426], [-0.2029, 0.2689], [-0.193, 0.1008], [-0.1913, -0.0663], [-0.1946, -0.2365], [-0.1963, -0.4122], [-0.1884, -0.5932], [-0.1632, -0.7766], [-0.1149, -0.9576], [-0.1077, -0.9744]]/*e*/,
    cell: /*c:s11*/{ cx: -1.2607, cy: -0.0739, r: 0.7337 }/*e*/,
  },
  {
    id: "s12", target: null, pose: { x: 1.82, y: -2.04, z: 0.1, rx: 0.3, ry: -0.3, rz: 0.7 }, scale: 0.5, hue: "c",
    stage: { mobile: { left: 12, top: 80 } },
    outline: /*b:s12*/[[-0.8457, -0.4622], [-0.1213, -0.8295], [0.6924, 0.176], [0.4033, 0.9151], [0.2777, 0.9137], [0.234, 0.9132]]/*e*/,
    cell: /*c:s12*/{ cx: -0.3264, cy: 0.8116, r: 0.7142 }/*e*/,
  },
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
 * ¿Existe `public/media/404/poster-end.webp` (último fotograma del vídeo, 1920x1080,
 * transparente, sin líneas)? Constante a mano; un test la compara con el disco.
 */
export const HAS_END_POSTER = true;

/*
 * Nota para quien elija las fuentes de vídeo (Task 4): Safari dice que reproduce VP9 en
 * WebM pero IGNORA su canal alfa. La selección NO puede apoyarse en poner el WebM primero.
 * Hay que detectar Safari, o encabezar con una fuente que solo Safari elija, y servirle
 * shatter.mp4 (negro puro) con mix-blend-mode: screen dentro de la caja del escenario.
 */

/** PRNG con semilla (mulberry32): el fondo de refracción del vídeo y el de la escena en vivo salen idénticos. Código literal, sin imports. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P3 = { x: number; y: number; z: number };

const tanHalf = (cam: typeof CAMERA) => Math.tan((cam.fov * Math.PI) / 360);

/** Proyecta un punto del mundo a % de una caja con ese aspect (ancho/alto). `unitPct`: % de ALTO de caja por unidad de mundo a esa profundidad. */
export function project(p: P3, aspect: number, cam: typeof CAMERA = CAMERA): { left: number; top: number; unitPct: number } {
  const d = cam.position[2] - p.z;
  const hh = d * tanHalf(cam);
  return {
    left: 50 + ((p.x - cam.position[0]) / (hh * aspect)) * 50,
    top: 50 - ((p.y - cam.position[1]) / hh) * 50,
    unitPct: 100 / (2 * hh),
  };
}

/** Inversa de `project` A LA PROFUNDIDAD z del propio fragmento (distancia 9 - z), no sobre el plano z = 0. */
export function unproject(left: number, top: number, z: number, aspect: number, cam: typeof CAMERA = CAMERA): { x: number; y: number } {
  const hh = (cam.position[2] - z) * tanHalf(cam);
  return {
    x: ((left - 50) / 50) * hh * aspect + cam.position[0],
    y: ((50 - top) / 50) * hh + cam.position[1],
  };
}

/**
 * Silueta del fragmento tal y como la ve la cámara: casco convexo de las caras
 * frontal y trasera tras la rotación de `pose`. `left`/`top` es el centro de su caja y
 * `w`/`h` su tamaño, en % de la caja del escenario (ancho y alto). `clip` es un
 * `polygon()` CSS en % de esa misma caja.
 */
export function silhouette(shard: Shard, aspect: number, cam: typeof CAMERA = CAMERA): { left: number; top: number; w: number; h: number; clip: string } {
  const { pose, scale, outline } = shard;
  const R = scale * GLASS.radiusPerScale;
  const hz = GLASS.depth / 2 + GLASS.bevel.thickness;
  const cx = Math.cos(pose.rx), sx = Math.sin(pose.rx);
  const cy = Math.cos(pose.ry), sy = Math.sin(pose.ry);
  const cz = Math.cos(pose.rz), sz = Math.sin(pose.rz);
  const pts: [number, number][] = [];
  for (const [ox, oy] of outline) {
    for (const oz of [-hz, hz]) {
      // three.js "XYZ": el vector se rota con Rx * Ry * Rz
      let x = ox * R, y = oy * R, z = oz * R;
      [x, y] = [x * cz - y * sz, x * sz + y * cz];
      [x, z] = [x * cy + z * sy, -x * sy + z * cy];
      [y, z] = [y * cx - z * sx, y * sx + z * cx];
      const q = project({ x: pose.x + x, y: pose.y + y, z: pose.z + z }, aspect, cam);
      pts.push([q.left, q.top]);
    }
  }
  // casco convexo (monotone chain)
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of s) {
    while (lower.length >= 2 && cr(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (const p of [...s].reverse()) {
    while (upper.length >= 2 && cr(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop();
    upper.push(p);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  const xs = hull.map((p) => p[0]), ys = hull.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const f = (v: number) => Math.round(v * 100) / 100;
  const clip = `polygon(${hull.map((p) => `${f(((p[0] - x0) / (x1 - x0)) * 100)}% ${f(((p[1] - y0) / (y1 - y0)) * 100)}%`).join(",")})`;
  return { left: (x0 + x1) / 2, top: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0, clip };
}

/**
 * Silueta del cristal entero del hero y del contacto (amendment F3): la forma
 * REDONDEADA del póster SVG, no la losa del 404. `GlassPoster` pinta `d` y la
 * escena 3D extruye la misma curva, de modo que en el relevo coinciden.
 * Coordenadas del póster (viewBox 400, y hacia abajo); el póster aplica además
 * `rotate(rotate, ...center)` al conjunto.
 */
export const POSTER_SILHOUETTE = {
  d: "M222 78c58 4 106 46 106 104 0 56-28 92-72 116-44 24-106 18-136-28-28-44-18-98 18-136 26-28 50-58 84-56z",
  rotate: 18,
  center: [200, 200] as const,
} as const;

/** Cubos de Bézier absolutos de `POSTER_SILHOUETTE.d` (solo M, c y z relativos). */
function silhouetteCubics(d: string): [number, number][][] {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  let x = nums[0]!;
  let y = nums[1]!;
  const out: [number, number][][] = [];
  for (let i = 2; i + 5 < nums.length; i += 6) {
    const [a, b, c, e, f, g] = nums.slice(i, i + 6) as [number, number, number, number, number, number];
    out.push([[x, y], [x + a, y + b], [x + c, y + e], [x + f, y + g]]);
    x += f;
    y += g;
  }
  return out;
}

/**
 * Contorno del cristal entero en unidades de mundo (y hacia arriba), antihorario,
 * centrado en su centroide y con radio medio `GLASS.slabRadius`: la silueta del
 * póster, girada `POSTER_SILHOUETTE.rotate` grados, remuestreada a `n` puntos
 * equidistantes sobre la curva.
 */
export function slabOutlinePoints(n: number = GLASS.slabOutline.n): [number, number][] {
  const S = POSTER_SILHOUETTE;
  const dense: [number, number][] = [];
  for (const [p0, p1, p2, p3] of silhouetteCubics(S.d)) {
    for (let k = 0; k < 64; k++) {
      const t = k / 64;
      const u = 1 - t;
      dense.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  }
  // longitud de arco acumulada y remuestreo uniforme
  const m = dense.length;
  const acc = [0];
  for (let i = 1; i <= m; i++) {
    const a = dense[i - 1]!;
    const b = dense[i % m]!;
    acc.push(acc[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = acc[m]!;
  const pts: [number, number][] = [];
  let j = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / n) * total;
    while (acc[j + 1]! < s) j++;
    const a = dense[j]!;
    const b = dense[(j + 1) % m]!;
    const f = (s - acc[j]!) / (acc[j + 1]! - acc[j]!);
    pts.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  // girar como el póster (SVG: horario en pantalla), centrar, voltear y y escalar
  const r = (S.rotate * Math.PI) / 180;
  const cr = Math.cos(r);
  const sr = Math.sin(r);
  const rot = pts.map(([px, py]) => {
    const dx = px - S.center[0];
    const dy = py - S.center[1];
    return [dx * cr - dy * sr, dx * sr + dy * cr] as [number, number];
  });
  const mx = rot.reduce((s, p) => s + p[0], 0) / n;
  const my = rot.reduce((s, p) => s + p[1], 0) / n;
  const mean = rot.reduce((s, p) => s + Math.hypot(p[0] - mx, p[1] - my), 0) / n;
  const k = GLASS.slabRadius / mean;
  const world = rot.map(([px, py]) => [(px - mx) * k, -(py - my) * k] as [number, number]);
  // al voltear y el recorrido pasa a antihorario; se comprueba por si la curva cambia
  let area = 0;
  for (let i = 0; i < n; i++) {
    const a = world[i]!;
    const b = world[(i + 1) % n]!;
    area += a[0] * b[1] - b[0] * a[1];
  }
  return area >= 0 ? world : world.reverse();
}
