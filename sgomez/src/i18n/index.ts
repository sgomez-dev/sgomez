import es from "./dictionaries/es";
import en from "./dictionaries/en";
import type { Lang } from "./languages";

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Dictionary = DeepString<typeof es>;

const DICTIONARIES: Record<Lang, Dictionary> = { es, en };
export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}
