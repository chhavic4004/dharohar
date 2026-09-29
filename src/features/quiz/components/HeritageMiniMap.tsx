import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { HeritageQuizInfo } from "@shared/quiz-contract";
import { siteText } from "../../../i18n/site";
import { useLang } from "../../../lib/language";
import { quizApi } from "../api/quizApi";
import { ARCHIVE_LINKS } from "../constants";
import { heritageName, stateName } from "../heritageText";
import { BAND_COLOR } from "./HeritageMapLayer";

/**
 * Small map card for archive pages:  <HeritageMiniMap heritageId="phulkari" />
 * Shows where the tradition or site is and links to it on the full Heritage Map.
 * Hides itself if the entry has no location or the API is unreachable.
 */
export default function HeritageMiniMap({ heritageId, className }: { heritageId: string; className?: string }) {
  const lang = useLang();
  const [info, setInfo] = useState<HeritageQuizInfo | null>(null);

  useEffect(() => {
    let live = true;
    quizApi
      .heritage(heritageId)
      .then((d) => live && setInfo(d))
      .catch(() => live && setInfo(null));
    return () => {
      live = false;
    };
  }, [heritageId, lang]);

  const h = info?.heritage;
  if (!h?.location) return null;
  const { lat, lng } = h.location;

  return (
    <div className={`bg-white rounded-2xl border border-maroon/10 shadow-sm overflow-hidden ${className ?? ""}`}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase">{siteText(lang, "onTheMap")}</h3>
        <span className="flex items-center gap-1 text-xs text-ink/60">
          <MapPin className="w-3.5 h-3.5" aria-hidden /> {stateName(h.state, lang)}
        </span>
      </div>
      <div className="h-44 relative z-0" aria-label={`${heritageName(h, lang)}, ${stateName(h.state, lang)}`}>
        <MapContainer
          center={[lat, lng]}
          zoom={6}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
        >
          <TileLayer
            url={import.meta.env.VITE_MAP_TILE_URL || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"}
            attribution={import.meta.env.VITE_MAP_TILE_ATTRIBUTION || "&copy; Esri, HERE, Garmin, (c) OpenStreetMap contributors, and the GIS user community"}
          />
          <CircleMarker center={[lat, lng]} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: BAND_COLOR[h.hvs?.band ?? "none"], fillOpacity: 1 }} />
        </MapContainer>
      </div>
      <Link
        to={ARCHIVE_LINKS.map(h)}
        className="block text-center text-sm font-medium text-maroon py-3 border-t border-maroon/10 hover:bg-maroon hover:text-white transition-colors"
      >
        {siteText(lang, "openInMap")} &rarr;
      </Link>
    </div>
  );
}
