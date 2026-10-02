/**
 * Respaldo para navegadores sin `animation-timeline` (Firefox): un revelado
 * simple, no ligado al scroll, con un IntersectionObserver y la Web Animations
 * API. Se carga solo cuando hace falta. El HTML ya está completo sin esto.
 * Solo se esconde (clip-path y translate en línea, nunca opacity ni filter) lo
 * que está por debajo del viewport, y se muestra al entrar; lo demás no se toca.
 * El parado quita los estilos en línea.
 */
const HIDDEN = { clipPath: "inset(-0.25em -0.25em 100% -0.25em)", translate: "0 0.4em" };
const SHOWN = { clipPath: "inset(-0.25em)", translate: "0 0" };

type Env = { IO?: typeof IntersectionObserver; vh?: number };

export function revealOnEnter(els: Iterable<HTMLElement>, env: Env = {}): () => void {
  const IO = env.IO ?? (typeof IntersectionObserver === "undefined" ? undefined : IntersectionObserver);
  if (!IO) return () => {};
  const vh = env.vh ?? innerHeight;
  const running: Animation[] = [];
  const hidden = new Set<HTMLElement>();
  const clear = (el: HTMLElement) => {
    el.style.removeProperty("clip-path");
    el.style.removeProperty("translate");
    hidden.delete(el);
  };
  const io = new IO((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      if (!e.isIntersecting || !hidden.has(el)) continue;
      io.unobserve(el);
      running.push(el.animate([HIDDEN, SHOWN], { duration: 700, easing: "cubic-bezier(0.2, 0.7, 0, 1)" }));
      clear(el);
    }
  });
  for (const el of els) {
    if (el.getBoundingClientRect().top < vh) continue;
    el.style.clipPath = HIDDEN.clipPath;
    el.style.translate = HIDDEN.translate;
    hidden.add(el);
    io.observe(el);
  }
  return () => {
    io.disconnect();
    for (const a of running.splice(0)) a.cancel();
    for (const el of [...hidden]) clear(el);
  };
}
