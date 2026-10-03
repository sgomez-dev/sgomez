import { localizedPath, type Lang } from "@/i18n/languages";
import { machineHref } from "@/lib/routing/pages";
import type { ShardTarget } from "./shards";

/**
 * Enlace de cada fragmento. Sale del catálogo de rutas (`localizedPath`) y de
 * `machineHref`, nunca escrito a mano. Las anclas cuelgan de la home del idioma
 * (`/#work`, `/en#work`), igual que el Nav.
 */
export function shardHref(target: ShardTarget, lang: Lang): string {
  const home = localizedPath(lang, "/");
  switch (target) {
    case "home":
      return home;
    case "about":
      return localizedPath(lang, "/about");
    case "work":
      return `${home}#work`;
    case "openSource":
      return `${home}#open-source`;
    case "contact":
      return `${home}#contact`;
    case "developers":
      return localizedPath(lang, "/developers");
    case "agents":
      return machineHref("/llms.txt", lang);
  }
}
