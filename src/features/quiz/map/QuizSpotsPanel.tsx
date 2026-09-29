import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { LocateFixed, MapPin, Search } from "lucide-react";
import type { HeritageQuizInfo, HvsBand } from "@shared/quiz-contract";
import { siteText, type SiteKey } from "../../../i18n/site";
import { localeOf, useLang } from "../../../lib/language";
import { heritageName, stateName } from "../heritageText";
import { BAND_COLOR } from "../components/HeritageMapLayer";

export type LatLngLite = { lat: number; lng: number };

function km(a: LatLngLite, b: LatLngLite) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

interface Props {
  spots: HeritageQuizInfo[];
  band: HvsBand | "all";
  onBandChange: (b: HvsBand | "all") => void;
  me: LatLngLite | null;
  onLocate: () => void;
  locError: boolean;
}

const BAND_LABEL: Record<HvsBand, SiteKey> = { Critical: "bandCritical", Vulnerable: "bandVulnerable", Stable: "bandStable" };

/**
 * List of every tradition and site with quiz questions: search in any script,
 * vulnerability filter, "Near me" sorting. Clicking a place focuses it on the
 * map through ?focus= (handled by HeritageMapLayer).
 */
export default function QuizSpotsPanel({ spots, band, onBandChange, me, onLocate, locError }: Props) {
  const lang = useLang();
  const t = (k: SiteKey, v?: Record<string, string | number>) => siteText(lang, k, v);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return spots
      .filter((s) => {
        if (band !== "all" && s.heritage.hvs?.band !== band) return false;
        if (!q) return true;
        const h = s.heritage;
        return [h.name, h.hindi, h.names?.pa, h.names?.ur, h.state, stateName(h.state, lang)].some((x) => x?.toLowerCase().includes(q));
      })
      .map((s) => ({ ...s, dist: me && s.heritage.location ? km(me, s.heritage.location) : null }))
      .sort((a, b) =>
        a.dist !== null && b.dist !== null ? a.dist - b.dist : heritageName(a.heritage, lang).localeCompare(heritageName(b.heritage, lang), localeOf(lang)),
      );
  }, [spots, query, band, me, lang]);

  const focus = (s: HeritageQuizInfo) => {
    const loc = s.heritage.location;
    if (!loc) return;
    const next = new URLSearchParams(params);
    next.set("focus", s.heritage.id);
    next.set("lat", String(loc.lat));
    next.set("lng", String(loc.lng));
    next.set("n", String(Date.now()));
    setParams(next, { replace: true });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto" dir={lang === "ur" ? "rtl" : "ltr"}>
      <div className="p-3 space-y-2 border-b border-[#e8dcc8] sticky top-0 bg-[#f7ede0] z-10">
        <p className="text-[11px] text-[#6b5f56]">{t("quizLayerHint", { n: spots.length })}</p>
        <label className="relative block">
          <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-ink/40" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchSpots")}
            aria-label={t("searchSpots")}
            className="w-full rounded-full border border-maroon/20 bg-white ps-8 pe-3 py-2 text-xs focus:outline-2 focus:outline-maroon"
          />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "Critical", "Vulnerable", "Stable"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onBandChange(b)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${band === b ? "bg-maroon text-white border-maroon" : "bg-white border-maroon/20 text-ink/70 hover:border-maroon/40"}`}
            >
              {b !== "all" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLOR[b] }} aria-hidden />}
              {b === "all" ? t("allBands") : t(BAND_LABEL[b])}
            </button>
          ))}
          <button
            type="button"
            onClick={onLocate}
            className="ms-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-maroon/30 text-maroon bg-white hover:bg-maroon/5 cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5" aria-hidden /> {t("nearMe")}
          </button>
        </div>
        {locError && <p className="text-[11px] text-alert">{t("locationDenied")}</p>}
      </div>
      {shown.length === 0 ? (
        <p className="p-4 text-xs text-ink/55">{t("noSpots")}</p>
      ) : (
        <ul className="p-3 space-y-2">
          {shown.map((s) => {
            const h = s.heritage;
            const active = params.get("focus") === h.id;
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => focus(s)}
                  className={`w-full text-start p-3 rounded-lg border bg-white transition-all cursor-pointer ${active ? "border-maroon ring-1 ring-maroon/30" : "border-[#e8dcc8] hover:border-terracotta/50"}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BAND_COLOR[h.hvs?.band ?? "none"] }} aria-hidden />
                    <span className="font-serif text-[14px] leading-tight text-maroon flex-1">{heritageName(h, lang)}</span>
                    <span className="text-[10px] text-ink/45 shrink-0">{t("questionsCount", { n: s.questionCount })}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-ink/55 mt-1 ps-4">
                    <MapPin className="w-3 h-3" aria-hidden /> {stateName(h.state, lang)}
                    {s.dist !== null && <span className="ms-auto">{t("kmAway", { n: Math.round(s.dist).toLocaleString(localeOf(lang)) })}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
