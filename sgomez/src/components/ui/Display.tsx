/** Titular: `lead` en Inter Tight 600 y `serif` en Instrument Serif cursiva. Sin degradado. */
export function Display({
  as: Tag = "h1",
  lead,
  serif,
  id,
  size = "text-[length:var(--step-5)]",
  motion,
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
  className?: string;
}) {
  return (
    <Tag
      id={id}
      data-motion={motion}
      className={`font-semibold leading-[1.02] [overflow-wrap:anywhere] tracking-[-0.055em] text-[color:var(--text)] ${size} ${className}`}
    >
      {lead}
      {serif ? (
        <>
          {" "}
          <span className="text-[1.08em] font-normal italic leading-[0.9] tracking-[-0.01em] text-[color:var(--serif-ink)] [font-family:var(--font-serif),serif]">
            {serif}
          </span>
        </>
      ) : null}
    </Tag>
  );
}
