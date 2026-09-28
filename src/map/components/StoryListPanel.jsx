import React from "react";
import StoryCard from "./StoryCard";

export default function StoryListPanel({ stories, loading, activeStoryId, onSelectStory }) {
  if (loading) {
    return <div className="story-list__status">Loading stories…</div>;
  }

  if (!stories.length) {
    return <div className="story-list__status">No stories match this filter yet.</div>;
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
