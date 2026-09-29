import { useMemo } from "react";
import type { HeritageLink } from "@shared/quiz-contract";
import { usePageText } from "../../i18n/page";
import { adminHeatmapText } from "../../i18n/pages/adminHeatmap";
import { heritageName, stateName } from "../quiz/heritageText";
import { fallbackById } from "./data";

/** Page text + locale-aware formatters shared by every admin console panel. */
export function useAdminText() {
  const { t, lang, dir, locale } = usePageText(adminHeatmapText);
  return useMemo(() => {
    const num = (n: number) => Math.round(n).toLocaleString(locale);
    const pct = (n: number, sign = false) =>
      (n / 100).toLocaleString(locale, { style: "percent", maximumFractionDigits: 0, signDisplay: sign ? "exceptZero" : "auto" });
    const date = (d: Date | string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
      new Date(d).toLocaleDateString(locale, opts);
    const rel = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const ago = (hours: number) => (hours < 24 ? rel.format(-hours, "hour") : rel.format(-Math.round(hours / 24), "day"));
    const place = (s: string | undefined) => stateName(s, lang);
    const heritage = (h: Pick<HeritageLink, "name" | "hindi" | "names">) => heritageName(h, lang);
    const heritageById = (id: string | undefined) => {
      const h = id ? fallbackById.get(id) : undefined;
      return h ? heritageName(h, lang) : (id ?? "");
    };
    return { t, lang, dir, locale, num, pct, date, ago, place, heritage, heritageById };
  }, [t, lang, dir, locale]);
}

export type AdminText = ReturnType<typeof useAdminText>;
