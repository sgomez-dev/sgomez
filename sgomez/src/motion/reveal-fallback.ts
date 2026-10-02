/**
 * Respaldo para navegadores sin `animation-timeline` (Firefox, Safari antiguo): un revelado
 * simple, no ligado al scroll, con un IntersectionObserver y la Web Animations
 * API. Se carga solo cuando hace falta. El HTML ya está completo sin esto.
 * Solo se esconde (clip-path y translate en línea, nunca opacity ni filter) lo
 * que está por debajo del viewport, y se muestra al entrar, una sola vez; lo demás no se toca.
 * El parado quita los estilos en línea.
 * Cada tipo imita su versión de motion.css: el antetítulo cierra su espaciado, las capas del
 * capítulo 03 entran por su lado y las etiquetas van escalonadas.
 */
type Frame = Record<string, string>;

const RISE: [Frame, Frame] = [
  { clipPath: "inset(-0.25em -0.25em 100% -0.25em)", translate: "0 0.4em" },
  { clipPath: "inset(-0.25em)", translate: "0 0" },
];

function framesFor(el: HTMLElement): [Frame, Frame] {
  const kind = el.dataset?.motion;
  if (kind === "eyebrow") return [{ ...RISE[0], letterSpacing: "0.5em" }, { ...RISE[1], letterSpacing: "0.14em" }];
  if (kind === "layer") {
    const right = el.matches(":nth-child(even)");
    return [
      { clipPath: right ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", translate: `${right ? "" : "-"}2.5rem 0` },
      { clipPath: "inset(-0.5rem)", translate: "0 0" },
    ];
  }
  return RISE;
}

const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

type Env = { IO?: typeof IntersectionObserver; vh?: number };

export function revealOnEnter(els: Iterable<HTMLElement>, env: Env = {}): () => void {
  const IO = env.IO ?? (typeof IntersectionObserver === "undefined" ? undefined : IntersectionObserver);
  if (!IO) return () => {};
  const vh = env.vh ?? innerHeight;
  const running: Animation[] = [];
  const hidden = new Map<HTMLElement, [Frame, Frame]>();
  const clear = (el: HTMLElement) => {
    for (const k of Object.keys(hidden.get(el)?.[0] ?? {})) el.style.removeProperty(kebab(k));
    hidden.delete(el);
  };
  const io = new IO((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      const frames = hidden.get(el);
      if (!e.isIntersecting || !frames) continue;
      io.unobserve(el);
      const delay = el.dataset?.motion === "tag" ? Math.min(parseFloat(el.style.getPropertyValue("--i")) || 0, 6) * 50 : 0;
      running.push(el.animate(frames, { duration: 700, delay, fill: "backwards", easing: "cubic-bezier(0.2, 0.7, 0, 1)" }));
      clear(el);
    }
  });
  for (const el of els) {
    if (el.getBoundingClientRect().top < vh) continue;
    const frames = framesFor(el);
    for (const [k, v] of Object.entries(frames[0])) el.style.setProperty(kebab(k), v);
    hidden.set(el, frames);
    io.observe(el);
  }
  return () => {
    io.disconnect();
    for (const a of running.splice(0)) a.cancel();
    for (const el of [...hidden.keys()]) clear(el);
  };
}
