import React from "react";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

/**
 * Horizontal timeline for a migration journey: 1940 ── 1947 ── 1960 ── 2026
 * Each year is clickable; the selected year is highlighted and the line
 * up to it is filled in, so progress through the journey reads at a glance.
 */
export default function Timeline({ journey, selectedIndex, onSelect }) {
  const { t } = usePageText(storyMapText);
  if (!journey || !journey.length) return null;

  return (
    <div className="timeline" dir="ltr" role="tablist" aria-label={t("timelineAria")}>
      <div className="timeline__track">
        <div
          className="timeline__track-fill"
          style={{
            width:
              journey.length > 1
                ? `${(selectedIndex / (journey.length - 1)) * 100}%`
                : "100%",
          }}
        />
      </div>

      <div className="timeline__points">
        {journey.map((point, index) => {
          const isSelected = index === selectedIndex;
          const isPast = index < selectedIndex;
          return (
            <button
              key={`${point.year}-${point.city}-${index}`}
              role="tab"
              aria-selected={isSelected}
              className={`timeline__point ${isSelected ? "timeline__point--active" : ""} ${
                isPast ? "timeline__point--past" : ""
              }`}
              onClick={() => onSelect(index)}
              title={`${point.year} — ${point.city}`}
            >
              <span className="timeline__dot" />
              <span className="timeline__year">{point.year}</span>
              <span className="timeline__city">{point.city}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
