import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import Legend from "./Legend";
import StoryPreviewPopup from "./StoryPreviewPopup";
import { getCategoryColor, getStageColor } from "../data/categories";

// Punjab/Haryana/Delhi pilot region default view
const DEFAULT_CENTER = [30.9, 75.5];
const DEFAULT_ZOOM = 7;

const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const hasCoords = (obj) =>
  obj && typeof obj.lat === "number" && typeof obj.lng === "number" && !Number.isNaN(obj.lat) && !Number.isNaN(obj.lng);

// Build a small circular divIcon colored per category, so we don't depend on
// external marker image assets.
function buildIcon(color, isActive) {
  const size = isActive ? 22 : 16;
  return L.divIcon({
    className: "story-marker",
    html: `<span style="
      display:block;
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid #fff;
      border-radius:50%;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Journey-stage marker: a diamond for the origin, a star-ish ring for the
// present day, plain dots for waypoints in between. The selected stage gets
// a pulsing highlight ring so it's obvious which point the timeline is on.
function buildStageIcon(stage, isSelected) {
  const color = getStageColor(stage.stage);
  const size = isSelected ? 26 : 16;
  const ring = isSelected
    ? `<span class="stage-marker__ring" style="width:${size + 14}px;height:${size + 14}px;border-color:${color};"></span>`
    : "";
  const shape =
    stage.stage === "origin"
      ? "border-radius:4px; transform:rotate(45deg);"
      : stage.stage === "present"
      ? "border-radius:50%; box-shadow:0 0 0 3px rgba(255,255,255,0.9), 0 1px 6px rgba(0,0,0,0.45);"
      : "border-radius:50%;";

  return L.divIcon({
    className: "stage-marker",
    html: `<span class="stage-marker__wrap">
      ${ring}
      <span style="
        display:block;
        width:${size}px;height:${size}px;
        background:${color};
        border:2px solid #fff;
        ${shape}
        box-shadow:0 1px 4px rgba(0,0,0,0.35);
      "></span>
    </span>`,
    iconSize: [size + 14, size + 14],
    iconAnchor: [(size + 14) / 2, (size + 14) / 2],
    popupAnchor: [0, -size / 2],
  });
}

/** Flies the map to a target lat/lng whenever it changes. */
function FlyTo({ target, zoom = 9 }) {
  const map = useMap();
  useEffect(() => {
    if (target && hasCoords(target)) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), zoom), { duration: 0.75 });
    }
  }, [target, map, zoom]);
  return null;
}

export default function MapView({
  stories,
  activeStoryId,
  onSelectStory,
  showPartitionPath,
  partitionPath,
  onReadMore,
  journeyStory,
  journey,
  selectedStageIndex,
  onSelectStage,
}) {
  const markerRefs = useRef({});

  // Open the popup on the map when a story is selected from the sidebar list.
  useEffect(() => {
    const marker = markerRefs.current[activeStoryId];
    if (marker) marker.openPopup();
  }, [activeStoryId, stories]);

  const activeStory = stories.find((s) => s.id === activeStoryId) || null;
  const validStories = stories.filter(hasCoords);

  const hasJourney = Boolean(journeyStory && journey && journey.length);
  const validJourneyPoints = hasJourney ? journey.filter(hasCoords) : [];
  const selectedStage = hasJourney ? journey[selectedStageIndex] || journey[0] : null;

  // While a journey is active, its own single pin is replaced by the
  // per-stage markers below, so we don't show two overlapping markers.
  const pinsToShow = hasJourney
    ? validStories.filter((s) => s.id !== journeyStory.id)
    : validStories;

  const flyTarget = hasJourney && hasCoords(selectedStage) ? selectedStage : activeStory;

  return (
    <div className="map-wrapper">
      {showPartitionPath && partitionPath && (
        <div className="map-banner">{partitionPath.disclaimer}</div>
      )}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="map-container"
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

        {flyTarget && <FlyTo target={flyTarget} />}

        {showPartitionPath && partitionPath && (
          <Polyline
            positions={partitionPath.coordinates.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#8c1f28", weight: 3, dashArray: "8 8" }}
          />
        )}

        {hasJourney && validJourneyPoints.length > 1 && (
          <Polyline
            positions={validJourneyPoints.map((p) => [p.lat, p.lng])}
            pathOptions={{ color: "#c99a3d", weight: 4, opacity: 0.85 }}
          />
        )}

        {hasJourney &&
          validJourneyPoints.map((point, index) => (
            <Marker
              key={`${journeyStory.id}-${index}`}
              position={[point.lat, point.lng]}
              icon={buildStageIcon(point, index === selectedStageIndex)}
              eventHandlers={{ click: () => onSelectStage(index) }}
            >
              <Popup>
                <div className="story-popup">
                  <span className="story-popup__category" style={{ color: getStageColor(point.stage) }}>
                    {point.year} · {point.stage?.toUpperCase() || "STAGE"}
                  </span>
                  <h3 className="story-popup__title">{point.city}</h3>
                  <p className="story-popup__description">{point.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {pinsToShow.map((story) => (
          <Marker
            key={story.id}
            position={[story.lat, story.lng]}
            icon={buildIcon(getCategoryColor(story.category), story.id === activeStoryId)}
            eventHandlers={{ click: () => onSelectStory(story.id) }}
            ref={(ref) => {
              if (ref) markerRefs.current[story.id] = ref;
            }}
          >
            <Popup>
              <StoryPreviewPopup story={story} onReadMore={onReadMore} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <Legend showPartitionPath={showPartitionPath} showMigrationRoute={hasJourney} />
    </div>
  );
}
