import React from "react";
import { getCategoryColor } from "../data/categories";

export default function StoryPreviewPopup({ story, onReadMore }) {
  const color = getCategoryColor(story.category);
  const hasJourney = Array.isArray(story.journey) && story.journey.length > 0;

  return (
    <div className="story-popup">
      <span className="story-popup__category" style={{ color }}>
        {story.category.toUpperCase()}
      </span>
      <h3 className="story-popup__title">{story.title}</h3>
      <p className="story-popup__location">📍 {story.location}</p>
      <p className="story-popup__description">{story.description}</p>
      {story.contributor && (
        <p className="story-popup__meta">Shared by {story.contributor}</p>
      )}
      {hasJourney ? (
        <p className="story-popup__hint">↓ See the full migration route and timeline below the map.</p>
      ) : (
        <button className="story-popup__btn" onClick={() => onReadMore(story)}>
          Read full story →
        </button>
      )}
    </div>
  );
}
