/** Scripts que el navegador moderno descarga al cargar la página (sin los noModule). */
export function initialScripts(html) {
  const out = [];
  const add = (src) => { if (src && src.startsWith("/_next/") && !out.includes(src)) out.push(src); };
  const tags = [...html.matchAll(/<(script|link)\b([^>]*)>/g)];
  for (const [, tag, attrs] of tags) {
    if (tag === "script") {
      if (/\bnoModule\b/i.test(attrs)) continue;
      add(/\bsrc="([^"]+)"/.exec(attrs)?.[1]);
    } else if (/\brel="preload"/.test(attrs) && /\bas="script"/.test(attrs)) {
      add(/\bhref="([^"]+)"/.exec(attrs)?.[1]);
    }
  }
  return out;
}

export function legacyScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>/g)]
    .filter(([, a]) => /\bnoModule\b/i.test(a))
    .map(([, a]) => /\bsrc="([^"]+)"/.exec(a)?.[1])
    .filter(Boolean);
}

/** Desde las semillas, todos los chunks que se nombran unos a otros (por nombre de fichero), sin los excluidos. */
export function chunkGraph(files, seeds, read, exclude = new Set()) {
  const graph = new Set();
  const queue = [...seeds];
  while (queue.length) {
    const f = queue.pop();
    if (graph.has(f) || exclude.has(f)) continue;
    graph.add(f);
    const text = read(f);
    for (const g of files) if (g !== f && text.includes(g)) queue.push(g);
  }
  return graph;
}
