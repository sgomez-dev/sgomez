const DEFAULT_SIZE = "text-[length:var(--step-5)]";

/** Titular: `lead` en Inter Tight 600 y `serif` en Instrument Serif cursiva. Sin degradado. */
export function Display({
  as: Tag = "h1",
  lead,
  serif,
  id,
  size = DEFAULT_SIZE,
  motion,
  light = false,
  className = "",
}: {
  as?: "h1" | "h2";
  lead: string;
  serif?: string;
  id?: string;
  /** Clase de tamaño de fuente; por defecto el paso 5 de la escala fluida. */
  size?: string;
  /** Marcador `data-motion` para la fase 2. */
  motion?: string;
  /**
   * Barrido de luz del hero (E3). Solo decorativo. La capa de luz cuelga del propio h1 y cubre el titular entero.
   * Dentro del h1 no se posiciona nada: un hijo posicionado parte el titular en dos candidatos de LCP más
   * pequeños que el retrato, y el LCP pasaba a ser la imagen (unos 700 ms más tarde con throttling real).
   */
  light?: boolean;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      data-light-host={light ? "" : undefined}
      data-motion={motion}
      className={`${light ? "relative " : ""}font-semibold leading-[1.02] [overflow-wrap:anywhere] ${size === DEFAULT_SIZE ? "tracking-[-0.055em]" : "tracking-[-0.03em]"} text-[color:var(--text)] ${size} ${className}`}
    >
      {light ? <span data-light-write="">{lead}</span> : lead}
      {serif ? (
        <>
          {" "}
          <span className={`text-[1.08em] font-normal italic leading-[0.9] tracking-[-0.01em] text-[color:var(--serif-ink)] [font-family:var(--font-serif),serif]`}>
            {serif}
          </span>
        </>
      ) : null}
    </Tag>
  );
}
