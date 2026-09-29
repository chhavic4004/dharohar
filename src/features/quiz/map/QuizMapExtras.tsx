import { useEffect } from "react";
import { CircleMarker, Popup, useMap } from "react-leaflet";
import type { HeritageQuizInfo, HvsBand } from "@shared/quiz-contract";
import { siteText } from "../../../i18n/site";
import { useLang } from "../../../lib/language";
import HeritageMapLayer from "../components/HeritageMapLayer";
import type { LatLngLite } from "./QuizSpotsPanel";

/**
 * Everything the quiz adds inside a react-leaflet map: the quiz spots layer
 * (with ?focus= support) and the visitor's own position after "Near me".
 */
export default function QuizMapExtras({ spots, band, visible, me }: { spots: HeritageQuizInfo[]; band: HvsBand | "all"; visible: boolean; me: LatLngLite | null }) {
  const map = useMap();
  const lang = useLang();

  useEffect(() => {
    if (me) map.flyTo([me.lat, me.lng], 7, { duration: 1.2 });
  }, [me, map]);

  return (
    <>
      {visible && <HeritageMapLayer items={spots} band={band} />}
      {me && (
        <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }}>
          <Popup closeButton={false}>{siteText(lang, "youAreHere")}</Popup>
        </CircleMarker>
      )}
    </>
  );
}
