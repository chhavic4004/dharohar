import { useCallback } from "react";
import { langDir, localeOf, useLang } from "../lib/language";

/**
 * Per-page translations. Each page keeps its own text in
 * src/i18n/pages/<page>.ts so teammates can edit their page's copy
 * without touching anyone else's file:
 *
 *   export const homeText = definePageText({ heroTitle: "Preserve the voices..." }, {
 *     hi: { heroTitle: "..." }, pa: { heroTitle: "..." }, ur: { heroTitle: "..." },
 *   });
 *
 *   const { t, lang, dir, locale } = usePageText(homeText);
 *   <h1>{t("heroTitle")}</h1>
 *
 * English is the fallback for any key missing in another language.
 * Use {name} placeholders for values: t("recordedBy", { name }).
 */
export interface PageText<K extends string> {
  en: Record<K, string>;
  hi: Partial<Record<K, string>>;
  pa: Partial<Record<K, string>>;
  ur: Partial<Record<K, string>>;
}

export function definePageText<const T extends Record<string, string>>(
  en: T,
  others: { hi: Partial<Record<keyof T & string, string>>; pa: Partial<Record<keyof T & string, string>>; ur: Partial<Record<keyof T & string, string>> },
): PageText<keyof T & string> {
  return { en, ...others } as PageText<keyof T & string>;
}

export { localeOf };

export function usePageText<K extends string>(dict: PageText<K>) {
  const lang = useLang();
  const t = useCallback(
    (key: K, vars?: Record<string, string | number>) => {
      let s = dict[lang][key] ?? dict.en[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [dict, lang],
  );
  return { t, lang, dir: langDir(lang), locale: localeOf(lang) };
}
