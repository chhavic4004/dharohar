import { useEffect, useRef, useState } from "react";
import { heritageName, stateName } from "../heritageText";
import { Link, useSearchParams } from "react-router";
import { CircleMarker, Popup, useMap } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import type { HeritageQuizInfo, HvsBand } from "@shared/quiz-contract";
import { siteText, type SiteKey } from "../../../i18n/site";
import { useLang } from "../../../lib/language";
import { quizApi } from "../api/quizApi";
import { ARCHIVE_LINKS } from "../constants";

export const BAND_COLOR: Record<HvsBand | "none", string> = {
  Stable: "#3E6B4F",
  Vulnerable: "#C68A1D",
  Critical: "#A83E22",
  none: "#7A1F35",
};

const BAND_KEY: Record<HvsBand, SiteKey> = { Stable: "bandStable", Vulnerable: "bandVulnerable", Critical: "bandCritical" };

interface Props {
  /** Called once the entries are loaded, for example to show a count */
  onLoaded?: (count: number) => void;
  /** Entries to show. When omitted the layer loads them itself. */
  items?: HeritageQuizInfo[];
  /** Only show one vulnerability band */
  band?: HvsBand | "all";
}

/**
 * Drop inside any react-leaflet <MapContainer>:
 *   <HeritageMapLayer />
 * Shows every tradition and site that has quiz questions, coloured by
 * vulnerability. Understands the links quiz answers make:
 *   /map?focus=<heritage id>&lat=..&lng=..  flies to that spot and opens it.
 */
export default function HeritageMapLayer({ onLoaded, items: given, band = "all" }: Props) {
  const map = useMap();
  const lang = useLang();
  const t = (k: SiteKey, v?: Record<string, string | number>) => siteText(lang, k, v);
  const [params] = useSearchParams();
  const [loaded, setItems] = useState<HeritageQuizInfo[]>([]);
  const all = given ?? loaded;
  const items = band === "all" ? all : all.filter((i) => i.heritage.hvs?.band === band);
  const markers = useRef(new Map<string, LeafletCircleMarker>());

  useEffect(() => {
    if (given) return;
    let live = true;
    quizApi
      .allHeritage()
      .then((xs) => {
        if (!live) return;
        setItems(xs);
        onLoaded?.(xs.length);
      })
      .catch(() => live && onLoaded?.(0));
    return () => {
      live = false;
    };
    // Names change with the language (Hindi names come from the registry)
  }, [lang, onLoaded, given]);

  // Focus requested by a quiz answer link
  const focus = params.get("focus");
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  // Changes on every click in a list, so the same place can be focused again
  const nonce = params.get("n");
  useEffect(() => {
    if (!focus) return;
    const entry = all.find((i) => i.heritage.id === focus);
    const target = entry?.heritage.location ?? (Number.isFinite(lat) && Number.isFinite(lng) && (lat || lng) ? { lat, lng } : null);
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 9), { duration: 1.2 });
    const open = () => markers.current.get(focus)?.openPopup();
    map.once("moveend", open);
    return () => {
      map.off("moveend", open);
    };
  }, [focus, lat, lng, all, map, nonce]);

  return (
    <>
      {items.map(({ heritage: h, questionCount }) => {
        if (!h.location) return null;
        const color = BAND_COLOR[h.hvs?.band ?? "none"];
        const name = heritageName(h, lang);
        const focused = h.id === focus;
        return (
          <CircleMarker
            key={h.id}
            center={[h.location.lat, h.location.lng]}
            radius={focused ? 11 : 7}
            pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 0.9 }}
            ref={(m) => {
              if (m) markers.current.set(h.id, m);
              else markers.current.delete(h.id);
            }}
          >
            <Popup className="heritage-popup" closeButton={false}>
              <div className="p-1 max-w-[230px]" dir={lang === "ur" ? "rtl" : "ltr"}>
                <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">
                  {stateName(h.state, lang)} · {t("questionsCount", { n: questionCount })}
                </div>
                <h4 className="font-serif text-sm leading-tight text-maroon mb-1">{name}</h4>
                {lang === "en" && h.hindi && <p className="text-[11px] text-ink/50 mb-1.5">{h.hindi}</p>}
                {h.hvs && (
                  <p className="text-[11px] mb-2.5">
                    <span className="inline-block w-2 h-2 rounded-full me-1.5 align-middle" style={{ backgroundColor: color }} />
                    <span className="text-ink/75">
                      {t("hvsLabel", { score: h.hvs.score })} · {t(BAND_KEY[h.hvs.band])}
                    </span>
                    {h.hvs.isSample && <span className="text-ink/40"> ({t("hvsSample")})</span>}
                  </p>
                )}
                <div className="flex gap-3">
                  <Link to={ARCHIVE_LINKS.quiz(h)} className="text-xs text-terracotta font-semibold hover:text-maroon">
                    {t("quizOnThis")}
                  </Link>
                  <Link to={ARCHIVE_LINKS.archive(h)} className="text-xs text-ink/60 font-medium hover:text-maroon">
                    {t("exploreEntry")}
                  </Link>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
