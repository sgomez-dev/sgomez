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
   * Envuelve `lead` para el barrido de luz del hero (E3). Solo decorativo. La capa de luz cubre el titular
   * entero (el h1 es su caja: un inline partido en dos líneas no cubriría la primera) y la parte en serif
   * va por encima de ella, así que solo tiñe el nombre.
   */
  light?: boolean;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      data-motion={motion}
      className={`${light ? "relative " : ""}font-semibold leading-[1.02] [overflow-wrap:anywhere] ${size === DEFAULT_SIZE ? "tracking-[-0.055em]" : "tracking-[-0.03em]"} text-[color:var(--text)] ${size} ${className}`}
    >
      {light ? <span data-light-write="">{lead}</span> : lead}
      {serif ? (
        <>
          {" "}
          <span className={`${light ? "relative z-[1] " : ""}text-[1.08em] font-normal italic leading-[0.9] tracking-[-0.01em] text-[color:var(--serif-ink)] [font-family:var(--font-serif),serif]`}>
            {serif}
          </span>
        </>
      ) : null}
    </Tag>
  );
}
