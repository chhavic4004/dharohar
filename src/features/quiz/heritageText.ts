import type { HeritageLink } from "@shared/quiz-contract";
import type { SiteLang } from "../../lib/language";
import { stateName } from "../../i18n/states";

/** A heritage entry's name in the site language (English if no translation). */
export function heritageName(h: Pick<HeritageLink, "name" | "hindi" | "names">, lang: SiteLang): string {
  if (lang === "hi") return h.hindi ?? h.name;
  if (lang === "pa" || lang === "ur") return h.names?.[lang] ?? h.name;
  return h.name;
}

export { stateName };
