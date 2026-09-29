import { useEffect, useState } from "react";
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { AnswerPayload, CorrectAnswer, LatLng, PublicQuestion } from "@shared/quiz-contract";
import { useI18n } from "../i18n";
import { Button } from "./ui";

interface Props {
  question: PublicQuestion;
  correctAnswer: CorrectAnswer | null;
  submitted: AnswerPayload | null;
  busy?: boolean;
  onSubmit: (answer: AnswerPayload) => void;
}

// Use a stable basemap fallback; the app already uses OSM elsewhere, and this
const TILES = import.meta.env.VITE_MAP_TILE_URL || "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = import.meta.env.VITE_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function ClickToPin({ enabled, onPick }: { enabled: boolean; onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (enabled) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FitReveal({ a, b }: { a: LatLng | null; b: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (a && b) map.fitBounds([[a.lat, a.lng], [b.lat, b.lng]], { padding: [40, 40], maxZoom: 7 });
    else if (b) map.setView([b.lat, b.lng], 6);
    requestAnimationFrame(() => map.invalidateSize());
  }, [a, b, map]);
  return null;
}

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(frame);
  }, [map]);
  return null;
}

/** Tap-to-pin map answer. The server grades by distance; this only collects the point. */
export default function MapPinInput({ question, correctAnswer, submitted, busy, onSubmit }: Props) {
  const { t } = useI18n();
  const [pin, setPin] = useState<LatLng | null>(null);
  useEffect(() => setPin(null), [question.id]);

  const revealed = correctAnswer !== null && "point" in correctAnswer;
  const target = revealed ? (correctAnswer as { point: LatLng }).point : null;
  const answer = revealed && correctAnswer && "point" in correctAnswer ? correctAnswer : null;
  const shownPin = revealed && submitted && "point" in submitted ? submitted.point : pin;
  const view = question.map ?? { center: { lat: 22.6, lng: 80.2 }, zoom: 4 };

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden border-2 border-maroon/15 shadow-sm" style={{ height: 380 }}>
        <MapContainer
          center={[view.center.lat, view.center.lng]}
          zoom={view.zoom}
          minZoom={3}
          maxZoom={10}
          style={{ height: "100%", width: "100%", cursor: revealed ? "default" : "crosshair" }}
          scrollWheelZoom
          attributionControl
        >
          <TileLayer url={TILES} attribution={ATTRIBUTION} />
          <ResizeMap />
          <ClickToPin enabled={!revealed && !busy} onPick={setPin} />
          {shownPin && (
            <CircleMarker center={[shownPin.lat, shownPin.lng]} radius={9} pathOptions={{ color: "#7A1F35", fillColor: "#C9622E", fillOpacity: 0.9, weight: 3 }} />
          )}
          {answer && target && (
            <>
              <Circle center={[target.lat, target.lng]} radius={answer.radiusKm * 1000} pathOptions={{ color: "#3E6B4F", fillColor: "#3E6B4F", fillOpacity: 0.12, weight: 2 }} />
              <CircleMarker center={[target.lat, target.lng]} radius={8} pathOptions={{ color: "#fff", fillColor: "#3E6B4F", fillOpacity: 1, weight: 3 }} />
              {shownPin && (
                <Polyline positions={[[shownPin.lat, shownPin.lng], [target.lat, target.lng]]} pathOptions={{ color: "#241B1D", dashArray: "6 6", weight: 2 }} />
              )}
              <FitReveal a={shownPin} b={target} />
            </>
          )}
        </MapContainer>
        {!revealed && !pin && (
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-[500] rounded-full bg-ink/80 text-parchment text-xs px-3 py-1.5">
            {t("tapMap")}
          </div>
        )}
      </div>

      {answer && (
        <div className="mt-3 rounded-xl bg-white/80 border border-maroon/10 p-3 text-sm text-ink/80">
          <p className="font-semibold text-heritage">{t("mapCorrectPlace", { label: answer.label })}</p>
          {answer.distanceKm !== undefined && <p className="text-xs mt-0.5">{t("pinDistance", { km: answer.distanceKm, r: answer.radiusKm })}</p>}
        </div>
      )}

      {!revealed && (
        <Button className="w-full mt-4" disabled={!pin} loading={busy} onClick={() => pin && onSubmit({ point: pin })}>
          {t("submitPin")}
        </Button>
      )}
    </div>
  );
}
