import React from "react";
import StoryCard from "./StoryCard";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

export default function StoryListPanel({ stories, loading, activeStoryId, onSelectStory }) {
  const { t } = usePageText(storyMapText);
  if (loading) {
    return <div className="story-list__status">{t("loadingStories")}</div>;
  }

  if (!stories.length) {
    return <div className="story-list__status">{t("noStories")}</div>;
  }

  return (
    <div className="story-list">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          isActive={story.id === activeStoryId}
          onSelect={onSelectStory}
        />
      ))}
    </div>
  );
}
