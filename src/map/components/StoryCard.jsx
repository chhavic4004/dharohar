import React from "react";
import { getCategoryColor } from "../data/categories";

export default function StoryCard({ story, isActive, onSelect }) {
  const color = getCategoryColor(story.category);

  return (
    <button
      className={`story-card ${isActive ? "story-card--active" : ""}`}
      onClick={() => onSelect(story.id)}
    >
      <span className="story-card__category" style={{ color }}>
        {story.category.toUpperCase()}
        {Array.isArray(story.journey) && story.journey.length > 0 && (
          <span className="story-card__journey-badge">ROUTE</span>
        )}
      </span>
      <span className="story-card__title">{story.title}</span>
      <span className="story-card__location">📍 {story.location}</span>
    </button>
  );
}
