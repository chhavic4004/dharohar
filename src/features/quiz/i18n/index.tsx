import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@shared/quiz-contract";
import { setRequestLang } from "../api/client";
import { EN, HI, PA, UR, type StringKey } from "./strings";

const DICTS: Record<Lang, Partial<Record<StringKey, string>>> = { en: EN, hi: HI, pa: PA, ur: UR };
const STORAGE_KEY = "dharohar.lang";

export const LANG_OPTIONS: { code: Lang; label: string; short: string; speech: string }[] = [
  { code: "en", label: "English", short: "EN", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", short: "हि", speech: "hi-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", short: "ਪੰ", speech: "pa-IN" },
  { code: "ur", label: "اردو", short: "ار", speech: "ur-IN" },
];

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<Ctx | null>(null);

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "hi" || v === "pa" || v === "ur") return v;
  } catch {
    /* storage blocked */
  }
  return "en";
}

/**
 * Language state for the quiz. Stored in localStorage under "dharohar.lang"
 * and broadcast with a "dharohar:lang" window event, so the site's main
 * language picker can drive it too: window.dispatchEvent(new CustomEvent("dharohar:lang", { detail: "hi" })).
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStored);

  useEffect(() => setRequestLang(lang), [lang]);

  useEffect(() => {
    const onLang = (e: Event) => {
      const l = (e as CustomEvent<string>).detail;
      if (l === "en" || l === "hi" || l === "pa" || l === "ur") setLangState(l);
    };
    window.addEventListener("dharohar:lang", onLang);
    return () => window.removeEventListener("dharohar:lang", onLang);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback<T>(
    (key, vars) => {
      let s = DICTS[lang][key] ?? EN[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, dir: lang === "ur" ? ("rtl" as const) : ("ltr" as const) }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export type { StringKey };
