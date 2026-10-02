/**
 * El bucle del cristal del hero (`HeroLoop` en video/): 720x720, 6 s a 30 fps, con alfa. Solo existe por debajo de lg,
 * donde no hay cristal 3D en vivo. Su fotograma 0 es el t=0 de la escena en vivo, que es el póster.
 */
export const HERO_LOOP_SRC = {
  webm: "/media/hero/loop.webm",
  mp4: "/media/hero/loop.mp4",
} as const;
