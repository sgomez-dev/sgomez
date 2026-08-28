/**
 * Trocea el marcado en línea que usan los textos de `content/pages.ts`.
 *
 * Solo dos marcas, `**negrita**` y `` `código` ``, porque son las únicas que
 * aparecen en esos textos. No es un parser de markdown y no debe convertirse
 * en uno: si una página necesita más, lo que toca es un componente, no ampliar
 * esto hasta que sea un renderizador a medias.
 */
export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "code"; value: string };

const PATTERN = /\*\*([^*]+)\*\*|`([^`]+)`/g;

export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let index = 0;

  for (const match of text.matchAll(PATTERN)) {
    const start = match.index ?? 0;
    if (start > index) tokens.push({ kind: "text", value: text.slice(index, start) });
    if (match[1] !== undefined) tokens.push({ kind: "strong", value: match[1] });
    else if (match[2] !== undefined) tokens.push({ kind: "code", value: match[2] });
    index = start + match[0].length;
  }

  if (index < text.length) tokens.push({ kind: "text", value: text.slice(index) });
  return tokens;
}
