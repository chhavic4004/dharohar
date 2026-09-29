import React from "react";
import { getCategoryColor, getCategoryLabel } from "../data/categories";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

export default function StoryPreviewPopup({ story, onReadMore }) {
  const { t, dir } = usePageText(storyMapText);
  const color = getCategoryColor(story.category);
  const hasJourney = Array.isArray(story.journey) && story.journey.length > 0;

  return (
    <div className="story-popup" dir={dir}>
      <span className="story-popup__category" style={{ color }}>
        {getCategoryLabel(story.category, t).toUpperCase()}
      </span>
      <h3 className="story-popup__title">{story.title}</h3>
      <p className="story-popup__location">📍 {story.location}</p>
      <p className="story-popup__description">{story.description}</p>
      {story.contributor && (
        <p className="story-popup__meta">{t("sharedBy", { name: story.contributor })}</p>
      )}
      {hasJourney ? (
        <p className="story-popup__hint">{t("journeyHint")}</p>
      ) : (
        <button className="story-popup__btn" onClick={() => onReadMore(story)}>
          {t("readFullStory")}
        </button>
      )}
    </div>
  );
}
