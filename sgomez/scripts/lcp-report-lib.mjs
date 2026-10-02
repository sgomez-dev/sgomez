const num = (a) => Math.round(a?.numericValue ?? NaN);

export function summarize(lhr) {
  const a = lhr.audits;
  const el = a["largest-contentful-paint-element"]?.details?.items ?? [];
  const m = a.metrics?.details?.items?.[0] ?? {};
  return {
    url: lhr.finalDisplayedUrl,
    lcp: num(a["largest-contentful-paint"]),
    tbt: num(a["total-blocking-time"]),
    fcp: num(a["first-contentful-paint"]),
    element: el[0]?.items?.[0]?.node?.snippet ?? "",
    phases: Object.fromEntries((el[1]?.items ?? []).map((p) => [p.phase, Math.round(p.timing)])),
    observed: { fcp: m.observedFirstContentfulPaint, lcp: m.observedLargestContentfulPaint, dcl: m.observedDomContentLoaded, load: m.observedLoad },
    bootup: (a["bootup-time"]?.details?.items ?? []).slice(0, 5).map((i) => [i.url.replace(/^https?:\/\/[^/]+/, ""), Math.round(i.scripting)]),
    mainThread: (a["mainthread-work-breakdown"]?.details?.items ?? []).map((i) => [i.group, Math.round(i.duration)]),
  };
}

export function markdownTable(rows) {
  const head = "| URL | LCP | TBT | FCP | elemento | render delay | FCP obs. | LCP obs. | load obs. | script más caro |\n|---|---|---|---|---|---|---|---|---|---|";
  const body = rows.map((r) =>
    `| ${r.url} | ${r.lcp} | ${r.tbt} | ${r.fcp} | \`${r.element.slice(0, 40).replace(/\|/g, "/")}\` | ${r.phases["Render Delay"] ?? ""} | ${r.observed.fcp} | ${r.observed.lcp} | ${r.observed.load} | ${r.bootup[0]?.join(" ") ?? ""} |`,
  );
  return [head, ...body].join("\n") + "\n";
}
