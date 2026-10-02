/** El trazo del plano de una tarjeta. Decorativo; el CSS lo dibuja al entrar (primitiva `build`). */
export function BuildTrace() {
  return (
    <svg data-layer="trace" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 -z-30 h-full w-full overflow-visible">
      <rect width="100%" height="100%" rx="14" pathLength="1" fill="none" stroke="var(--light-1)" strokeOpacity="0.55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="1" strokeDashoffset="0" />
    </svg>
  );
}
