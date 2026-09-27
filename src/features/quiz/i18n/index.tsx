import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "@shared/quiz-contract";
import { SITE_LANGS, langDir, setLang as setSiteLang, useLang } from "../../../lib/language";
import { EN, HI, PA, UR, type StringKey } from "./strings";
import { HI_MORE, PA_MORE, UR_MORE } from "./strings.more";

const DICTS: Record<Lang, Partial<Record<StringKey, string>>> = {
  en: EN,
  hi: { ...HI, ...HI_MORE },
  pa: { ...PA, ...PA_MORE },
  ur: { ...UR, ...UR_MORE },
};

export const LANG_OPTIONS = SITE_LANGS;

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<Ctx | null>(null);

/**
 * Quiz text in the site's current language. The language itself lives in
 * src/lib/language.ts, so the header picker, the quiz and the map always agree.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useLang();

  const t = useCallback<T>(
    (key, vars) => {
      let s = DICTS[lang][key] ?? EN[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang: setSiteLang, t, dir: langDir(lang) }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export type { StringKey };

/** Guest names are stored as "Explorer 1A2B"; show the word in the site language. */
export function useDisplayName() {
  const { t } = useI18n();
  return (name: string) => {
    const m = /^Explorer ([A-Z0-9]{4})$/.exec(name);
    return m ? `${t("explorerName")} ${m[1]}` : name;
  };
}
