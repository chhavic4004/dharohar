import React from "react";
import { getCategoryColor, getCategoryLabel } from "../data/categories";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

export default function StoryCard({ story, isActive, onSelect }) {
  const { t } = usePageText(storyMapText);
  const color = getCategoryColor(story.category);

  return (
    <button
      className={`story-card ${isActive ? "story-card--active" : ""}`}
      onClick={() => onSelect(story.id)}
    >
      <span className="story-card__category" style={{ color }}>
        {getCategoryLabel(story.category, t).toUpperCase()}
        {Array.isArray(story.journey) && story.journey.length > 0 && (
          <span className="story-card__journey-badge">{t("routeBadge")}</span>
        )}
      </span>
      <span className="story-card__title">{story.title}</span>
      <span className="story-card__location">📍 {story.location}</span>
    </button>
  );
}
