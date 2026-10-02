/**
 * Respaldo para navegadores sin `animation-timeline` (Firefox): un revelado
 * simple, no ligado al scroll, con un IntersectionObserver y la Web Animations
 * API. Se carga solo cuando hace falta. El HTML ya está completo sin esto.
 * Lo que ya está en pantalla al engancharse no se toca. Sin opacity ni filter.
 */
export function supportsScrollTimeline(css: { supports(p: string): boolean } | undefined): boolean {
  try {
    return !!css && css.supports("animation-timeline: view()");
  } catch {
    return false;
  }
}

const RISE = [
  { clipPath: "inset(-0.25em -0.25em 100% -0.25em)", translate: "0 0.4em" },
  { clipPath: "inset(-0.25em)", translate: "0 0" },
];

type Env = { IO?: typeof IntersectionObserver; vh?: number };

export function revealOnEnter(els: Iterable<HTMLElement>, env: Env = {}): () => void {
  const IO = env.IO ?? (typeof IntersectionObserver === "undefined" ? undefined : IntersectionObserver);
  if (!IO) return () => {};
  const vh = env.vh ?? innerHeight;
  const running: Animation[] = [];
  const io = new IO(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        running.push((e.target as HTMLElement).animate(RISE, { duration: 700, easing: "cubic-bezier(0.2, 0.7, 0, 1)", fill: "backwards" }));
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) continue;
    io.observe(el);
  }
  return () => {
    io.disconnect();
    for (const a of running.splice(0)) a.cancel();
  };
}

export const REVEAL_SELECTOR = 'h2[data-motion="text-reveal"], [data-motion="build"]';
