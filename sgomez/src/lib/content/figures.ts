import { certifications, experience, projects } from "@/app/content";
import { t } from "./localized";

const YEAR = /\b(19|20)\d{2}\b/g;

export function siteFigures(now: Date = new Date()): { years: number | null; projects: number; certifications: number } {
  const perEntry = experience.map((e) => (t(e.period, "es").match(YEAR) ?? []).map(Number));
  // Spec §3.3: si algún periodo no trae un año de 4 cifras, la cifra no se muestra.
  const years = perEntry.every((ys) => ys.length > 0) ? now.getFullYear() - Math.min(...perEntry.flat()) : null;
  return { years, projects: projects.length, certifications: certifications.length };
}
