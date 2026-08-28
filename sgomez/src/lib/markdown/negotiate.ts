/**
 * Negociación de contenido para `Accept: text/markdown`
 * (convención de https://acceptmarkdown.com, sobre el RFC 9110 §12.5.1).
 *
 * El punto entero es no adivinar. Un `Accept: text/markdown` es inequívoco,
 * pero `Accept: text/html,application/xhtml+xml,*​/*;q=0.8` —lo que manda un
 * navegador— también menciona markdown a través del comodín, y servirle
 * markdown a Chrome sería un fallo grave. Por eso se ordena por q y, a igual
 * q, por especificidad: un comodín nunca gana a un tipo escrito con nombre y
 * apellidos, así que el navegador se queda en HTML y el agente recibe markdown.
 */

export type MediaRange = {
  type: string;
  subtype: string;
  q: number;
  /** 3 = type/subtype, 2 = type/*, 1 = *​/*. A igual q, gana la más específica. */
  specificity: number;
};

/** Tipos que se consideran markdown. El registrado es text/markdown (RFC 7763). */
export const MARKDOWN_TYPES = ["text/markdown", "text/x-markdown"] as const;

export const HTML_TYPE = "text/html";
export const MARKDOWN_TYPE = "text/markdown";

export function parseAccept(header: string | null | undefined): MediaRange[] {
  if (!header) return [];

  const ranges: MediaRange[] = [];
  for (const part of header.split(",")) {
    const [rawType, ...parameters] = part.trim().split(";");
    const value = rawType.trim().toLowerCase();
    if (!value) continue;

    const [type, subtype = "*"] = value.split("/");
    if (!type) continue;

    let q = 1;
    for (const parameter of parameters) {
      const [name, raw] = parameter.split("=").map((piece) => piece?.trim().toLowerCase());
      if (name === "q") {
        const parsed = Number(raw);
        // Un q ilegible se trata como ausente: es lo que hace un servidor
        // conservador, y descartar la entrada entera sería peor.
        q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 1;
      }
    }

    const specificity = type === "*" ? 1 : subtype === "*" ? 2 : 3;
    ranges.push({ type, subtype, q, specificity });
  }

  return ranges;
}

/** q y especificidad con que el Accept cubre un tipo concreto. */
function match(ranges: MediaRange[], mediaType: string): { q: number; specificity: number } {
  const [type, subtype] = mediaType.split("/");
  let best = { q: 0, specificity: 0 };

  for (const range of ranges) {
    const matches =
      (range.type === "*" && range.subtype === "*") ||
      (range.type === type && range.subtype === "*") ||
      (range.type === type && range.subtype === subtype);
    if (!matches) continue;
    // Manda la coincidencia más específica, y su q con ella: así
    // `text/html, *​/*;q=0.1` da q=1 a HTML y q=0.1 a lo demás.
    if (range.specificity > best.specificity || (range.specificity === best.specificity && range.q > best.q)) {
      best = { q: range.q, specificity: range.specificity };
    }
  }

  return best;
}

/**
 * Elige entre los tipos que la ruta sabe producir.
 *
 * `candidates` va en orden de preferencia del servidor: el primero es el que
 * se sirve cuando el cliente no desempata (un navegador con `*​/*`, o una
 * petición sin Accept). Devuelve `null` cuando el cliente ha excluido todos
 * los tipos disponibles; quien llama decide qué hacer con ese caso.
 */
export function selectMediaType(header: string | null | undefined, candidates: string[]): string | null {
  const ranges = parseAccept(header);
  if (ranges.length === 0) return candidates[0] ?? null;

  let winner: string | null = null;
  let winnerScore = { q: 0, specificity: 0 };

  for (const candidate of candidates) {
    const score = match(ranges, candidate);
    if (score.q === 0) continue;
    const better =
      winner === null ||
      score.q > winnerScore.q ||
      (score.q === winnerScore.q && score.specificity > winnerScore.specificity);
    if (better) {
      winner = candidate;
      winnerScore = score;
    }
  }

  return winner;
}

/** Los tipos que una página de contenido sabe producir, HTML primero. */
const PAGE_TYPES: string[] = [HTML_TYPE, ...MARKDOWN_TYPES];

/** ¿Esta petición quiere markdown en una ruta que sirve HTML y markdown? */
export function prefersMarkdown(header: string | null | undefined): boolean {
  const selected = selectMediaType(header, PAGE_TYPES);
  return selected !== null && selected !== HTML_TYPE;
}

