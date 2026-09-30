/** Titular: `lead` en Inter Tight 600 y `serif` en Instrument Serif cursiva. Sin degradado. */
export function Display({
  as: Tag = "h1",
  lead,
  serif,
  className = "",
}: {
  as?: "h1" | "h2";
  lead: string;
  serif: string;
  className?: string;
}) {
  return (
    <Tag
      className={`font-semibold leading-[1.02] [overflow-wrap:anywhere] tracking-[-0.055em] text-[color:var(--text)] text-[length:var(--step-5)] ${className}`}
    >
      {lead}{" "}
      <span className="font-normal italic tracking-[-0.02em] text-[color:var(--serif-ink)] [font-family:var(--font-serif),serif]">
        {serif}
      </span>
    </Tag>
  );
}
