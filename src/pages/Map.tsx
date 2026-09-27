import { useEffect, useMemo, useState } from "react";
import { MapPin, Brain, Globe2, Search, LocateFixed, BookOpen } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import type { HeritageQuizInfo, HvsBand } from "@shared/quiz-contract";
import { BAND_COLOR, HeritageMapLayer, heritageName, quizApi, stateName } from "../features/quiz";
import { useSiteT, type SiteKey } from "../i18n/site";
import { langDir, localeOf, useLang } from "../lib/language";
import { usePageText } from "../i18n/page";
import { mapText } from "../i18n/pages/map";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom colored icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const icons = {
  "Oral History": createIcon("#3B82F6"), // Blue
  "Craft & Tradition": createIcon("#C9622E"), // Terracotta/Orange
  "Folk Song": createIcon("#10B981"), // Green
  "Living Tradition": createIcon("#D97706"), // Gold
};

const mapCenter: [number, number] = [31.1471, 75.3412]; // Punjab region
const INDIA_BOUNDS: [[number, number], [number, number]] = [[7.5, 68], [35.5, 97.5]];

const TAG_KEY: Record<string, SiteKey> = {
  All: "filterAll",
  "Oral History": "tagOral",
  "Craft & Tradition": "tagCraft",
  "Folk Song": "tagFolk",
  "Living Tradition": "tagLiving",
};

export default function Map() {
  const t = useSiteT();
  const lang = useLang();
  const { t: st } = usePageText(mapText);
  const [params, setParams] = useSearchParams();
  const [showMigrationPath, setShowMigrationPath] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  // Quiz spots are on by default; a ?focus= link from a quiz answer always shows them.
  const [showQuizSpots, setShowQuizSpots] = useState(true);
  const [map, setMap] = useState<L.Map | null>(null);
  const [indiaView, setIndiaView] = useState(false);
  const quizVisible = showQuizSpots || !!params.get("focus");
  const [tab, setTab] = useState<"stories" | "spots">(params.get("focus") ? "spots" : "stories");
  const [spots, setSpots] = useState<HeritageQuizInfo[]>([]);
  const [query, setQuery] = useState("");
  const [band, setBand] = useState<HvsBand | "all">("all");
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState(false);
  const quizCount = spots.length;

  // Every tradition and site with quiz questions (names come back in the site language)
  useEffect(() => {
    let live = true;
    quizApi
      .allHeritage()
      .then((xs) => live && setSpots(xs))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [lang]);

  const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const r = (d: number) => (d * Math.PI) / 180;
    const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  };

  const shownSpots = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = spots.filter((s) => {
      if (band !== "all" && s.heritage.hvs?.band !== band) return false;
      if (!q) return true;
      const h = s.heritage;
      return [h.name, h.hindi, h.names?.pa, h.names?.ur, h.state, stateName(h.state, lang)].some((x) => x?.toLowerCase().includes(q));
    });
    return list
      .map((s) => ({ ...s, dist: me && s.heritage.location ? km(me, s.heritage.location) : null }))
      .sort((a, b) => (a.dist !== null && b.dist !== null ? a.dist - b.dist : heritageName(a.heritage, lang).localeCompare(heritageName(b.heritage, lang), localeOf(lang))));
  }, [spots, query, band, me, lang]);

  const focusSpot = (s: HeritageQuizInfo) => {
    if (!s.heritage.location) return;
    setShowQuizSpots(true);
    setParams({ focus: s.heritage.id, lat: String(s.heritage.location.lat), lng: String(s.heritage.location.lng), n: String(Date.now()) }, { replace: true });
  };

  const locate = () => {
    setLocError(false);
    if (!navigator.geolocation) return setLocError(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMe(p);
        setTab("spots");
        setShowQuizSpots(true);
        map?.flyTo([p.lat, p.lng], 7, { duration: 1.2 });
      },
      () => setLocError(true),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  const filters = ["All", "Oral History", "Craft & Tradition", "Folk Song", "Living Tradition"];

  const stories = [
    {
      id: "lahore-amritsar",
      title: st("storyLahoreTitle"),
      tag: "Oral History",
      loc: st("storyLahoreLoc"),
      coords: [31.6340, 74.8723] as [number, number],
      preview: st("storyLahorePreview"),
    },
    {
      id: "phulkari",
      title: st("storyPhulkariTitle"),
      tag: "Craft & Tradition",
      loc: st("storyPhulkariLoc"),
      coords: [30.3398, 76.3869] as [number, number],
      preview: st("storyPhulkariPreview"),
    },
    {
      id: "mirza-sahiban",
      title: st("storyMirzaTitle"),
      tag: "Folk Song",
      loc: st("storyMirzaLoc"),
      coords: [31.3260, 75.5762] as [number, number],
      preview: st("storyMirzaPreview"),
    },
    {
      id: "vaisakhi",
      title: st("storyVaisakhiTitle"),
      tag: "Living Tradition",
      loc: st("storyVaisakhiLoc"),
      coords: [31.2343, 76.4996] as [number, number],
      preview: st("storyVaisakhiPreview"),
    },
  ];

  const migrationPath: [number, number][] = [
    [31.5204, 74.3587], // Lahore
    [31.57, 74.6],
    [31.6340, 74.8723], // Amritsar
  ];

  const filteredStories = activeFilter === "All" 
    ? stories 
    : stories.filter(s => s.tag === activeFilter);

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] w-full overflow-hidden bg-parchment">
      {/* Sidebar */}
      <div className="w-full md:w-[340px] bg-[#FBF7EE] border-r border-maroon/10 flex flex-col z-[1000] shadow-xl md:overflow-hidden shrink-0 order-2 md:order-1 relative" dir={langDir(lang)}>
        <div className="p-5 border-b border-maroon/10">
          <h2 className="font-serif text-2xl text-maroon mb-4">{t("mapTitle")}</h2>
          
          <p className="text-xs text-ink/70 mb-4 font-medium">{t("mapPilot")}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 border rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === filter 
                    ? "bg-maroon text-white border-maroon" 
                    : "bg-white border-maroon/20 text-ink/70 hover:text-maroon hover:border-maroon/40"
                }`}
              >
                {t(TAG_KEY[filter])}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-maroon/10">
            <span className="text-xs font-medium text-ink/80 max-w-[200px]">
              {t("partitionToggle")}
            </span>
            <button 
              role="switch"
              aria-checked={showMigrationPath}
              aria-label={t("partitionToggle")}
              onClick={() => setShowMigrationPath(!showMigrationPath)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer ${showMigrationPath ? 'bg-terracotta' : 'bg-maroon/20'}`}
            >
              <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${showMigrationPath ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Heritage quiz layer (from the quiz module) */}
          <div className="py-3 border-t border-maroon/10">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/85">
                <Brain className="w-4 h-4 text-maroon" aria-hidden /> {t("quizLayer")}
              </span>
              <button
                role="switch"
                aria-checked={quizVisible}
                aria-label={t("quizLayer")}
                onClick={() => setShowQuizSpots(!quizVisible)}
                className={`w-10 h-5 shrink-0 rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer ${quizVisible ? 'bg-maroon' : 'bg-maroon/20'}`}
              >
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${quizVisible ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {quizVisible && quizCount > 0 && <p className="text-[11px] text-ink/55 mt-1.5">{t("quizLayerHint", { n: quizCount })}</p>}
            <button
              onClick={() => {
                if (!map) return;
                if (indiaView) map.flyTo(mapCenter, 8);
                else map.flyToBounds(INDIA_BOUNDS);
                setIndiaView(!indiaView);
              }}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-terracotta cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5" aria-hidden /> {indiaView ? t("showPilot") : t("showIndia")}
            </button>
          </div>
        </div>

        {/* Stories | Quiz spots */}
        <div className="grid grid-cols-2 border-b border-maroon/10 bg-[#FBF7EE]" role="tablist">
          {(["stories", "spots"] as const).map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${tab === id ? "border-maroon text-maroon" : "border-transparent text-ink/55 hover:text-maroon"}`}
            >
              {id === "stories" ? <BookOpen className="w-3.5 h-3.5" aria-hidden /> : <Brain className="w-3.5 h-3.5" aria-hidden />}
              {id === "stories" ? `${t("storiesTab")} (${filteredStories.length})` : `${t("quizSpotsTab")} (${quizCount})`}
            </button>
          ))}
        </div>

        {tab === "spots" ? (
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-3 space-y-2 border-b border-maroon/10 sticky top-0 bg-white z-10">
              <label className="relative block">
                <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-ink/40" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchSpots")}
                  aria-label={t("searchSpots")}
                  className="w-full rounded-full border border-maroon/20 bg-parchment/40 ps-8 pe-3 py-2 text-xs focus:outline-2 focus:outline-maroon"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "Critical", "Vulnerable", "Stable"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBand(b)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer ${band === b ? "bg-maroon text-white border-maroon" : "bg-white border-maroon/20 text-ink/70 hover:border-maroon/40"}`}
                  >
                    {b !== "all" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLOR[b] }} aria-hidden />}
                    {b === "all" ? t("allBands") : t(b === "Critical" ? "bandCritical" : b === "Vulnerable" ? "bandVulnerable" : "bandStable")}
                  </button>
                ))}
              </div>
            </div>
            {shownSpots.length === 0 ? (
              <p className="p-4 text-xs text-ink/55">{t("noSpots")}</p>
            ) : (
              <ul className="p-3 space-y-2">
                {shownSpots.map((s) => {
                  const h = s.heritage;
                  const active = params.get("focus") === h.id;
                  return (
                    <li key={h.id}>
                      <button
                        onClick={() => focusSpot(s)}
                        className={`w-full text-start p-3 rounded-lg border transition-all cursor-pointer ${active ? "border-maroon bg-maroon/5" : "border-maroon/10 hover:border-terracotta/50 hover:bg-parchment/30"}`}
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
        ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredStories.map((story) => (
            <div key={story.id} onClick={() => map?.flyTo(story.coords, 11, { duration: 1 })} className="p-3 border border-maroon/10 rounded-lg hover:border-terracotta/50 hover:bg-parchment/30 transition-all cursor-pointer group">
              <div className="text-[10px] font-bold uppercase tracking-wider text-terracotta mb-1">{t(TAG_KEY[story.tag])}</div>
              <h4 className="font-serif text-[15px] leading-tight text-maroon group-hover:text-terracotta transition-colors mb-2">{story.title}</h4>
              <div className="flex items-center gap-1 text-xs text-ink/60">
                <MapPin className="w-3 h-3" /> {story.loc}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-[#e3dcc8] min-h-[60vh] md:min-h-0 order-1 md:order-2 z-0">
        
        {/* Top Banner Alert */}
        <div className="absolute top-0 left-0 right-0 bg-turmeric/90 backdrop-blur text-ink text-xs font-medium py-2 px-4 text-center z-[1000] shadow-sm border-b border-turmeric/50 flex justify-center items-center gap-2">
          {t("partitionBanner")}
        </div>

        {/* Near me */}
        <div className="absolute top-12 end-4 z-[1000] flex flex-col items-end gap-2" dir={langDir(lang)}>
          <button
            onClick={locate}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur shadow-md border border-maroon/15 text-maroon text-xs font-semibold px-3.5 py-2 hover:bg-white cursor-pointer"
          >
            <LocateFixed className="w-4 h-4" aria-hidden /> {t("nearMe")}
          </button>
          {locError && <p className="max-w-[240px] rounded-lg bg-white/95 shadow text-[11px] text-alert px-3 py-2">{t("locationDenied")}</p>}
        </div>

        <MapContainer 
          center={mapCenter} 
          zoom={8} 
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          ref={setMap}
        >
          {/* Free publicly accessible basemap (CartoDB Positron) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {showMigrationPath && (
            <Polyline 
              positions={migrationPath} 
              pathOptions={{ color: "#A83E22", weight: 3, dashArray: "5, 10" }} 
            />
          )}

          {quizVisible && <HeritageMapLayer items={spots} band={band} />}

          {me && (
            <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }}>
              <Popup closeButton={false}>{t("youAreHere")}</Popup>
            </CircleMarker>
          )}

          {filteredStories.map((story) => (
            <Marker 
              key={story.id} 
              position={story.coords} 
              icon={icons[story.tag as keyof typeof icons] || icons["Oral History"]}
            >
              <Popup className="heritage-popup" closeButton={false}>
                <div className="p-1 max-w-[220px]" dir={langDir(lang)}>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">{t(TAG_KEY[story.tag])}</div>
                  <h4 className="font-serif text-sm leading-tight text-maroon mb-2">{story.title}</h4>
                  <p className="text-xs text-ink/70 mb-3 leading-snug">{story.preview}</p>
                  <Link to={`/story/${story.id}`} className="text-xs text-terracotta font-medium hover:text-maroon flex items-center gap-1 transition-colors">
                    {t("readStory")} &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-maroon/10 z-[1000] w-64" dir={langDir(lang)}>
          <h4 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-3">{t("storyTypes")}</h4>
          <div className="space-y-2 text-xs text-ink/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white shadow-sm" /> {t("tagOral")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C9622E] border border-white shadow-sm" /> {t("tagCraft")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981] border border-white shadow-sm" /> {t("tagFolk")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D97706] border border-white shadow-sm" /> {t("tagLiving")}
            </div>
            {showMigrationPath && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-maroon/10 text-[11px]">
                <div className="w-8 border-t-2 border-dashed border-[#A83E22]" /> {t("partitionPath")}
              </div>
            )}
            {quizVisible && (
              <div className="mt-3 pt-3 border-t border-maroon/10 space-y-1.5 text-[11px]">
                <p className="font-semibold text-ink/70">{t("quizLayer")}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3E6B4F] border border-white shadow-sm" />{t("bandStable")}</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#C68A1D] border border-white shadow-sm" />{t("bandVulnerable")}</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#A83E22] border border-white shadow-sm" />{t("bandCritical")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .leaflet-container {
          background: #e3dcc8;
        }
        .heritage-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          border: 1px solid rgba(122, 31, 53, 0.1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .heritage-popup .leaflet-popup-content {
          margin: 12px;
        }
        .heritage-popup .leaflet-popup-tip {
          background: white;
          border-top: 1px solid rgba(122, 31, 53, 0.1);
          border-left: 1px solid rgba(122, 31, 53, 0.1);
        }
        .leaflet-control-container {
          display: none;
        }
      `}</style>
    </div>
  );
}