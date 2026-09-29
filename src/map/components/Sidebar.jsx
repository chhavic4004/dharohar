import React from "react";
import FilterChips from "./FilterChips";
import PartitionToggle from "./PartitionToggle";
import LanguageFilter from "./LanguageFilter";
import StoryListPanel from "./StoryListPanel";

export default function Sidebar({
  activeCategory,
  onCategoryChange,
  languages,
  activeLanguage,
  onLanguageChange,
  showPartitionPath,
  onTogglePartitionPath,
  stories,
  loading,
  error,
  usingFallback,
  activeStoryId,
  onSelectStory,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Heritage Map</h1>
        <p className="sidebar__subtitle">
          Punjab · Haryana · Delhi pilot region. Click any pin to preview a story. Stories with a
          migration journey show a full route and timeline.
        </p>

        {usingFallback && (
          <div className="sidebar__notice">
            Showing offline demo data — the backend API isn't reachable right now.
          </div>
        )}
        {error && <div className="sidebar__notice sidebar__notice--error">{error}</div>}

        <FilterChips activeCategory={activeCategory} onChange={onCategoryChange} />

        <LanguageFilter
          languages={languages}
          activeLanguage={activeLanguage}
          onChange={onLanguageChange}
        />

        <PartitionToggle
          checked={showPartitionPath}
          onChange={onTogglePartitionPath}
          label="Partition migration path (Lahore ↔ Amritsar · Historical reference)"
        />
      </div>

      <StoryListPanel
        stories={stories}
        loading={loading}
        activeStoryId={activeStoryId}
        onSelectStory={onSelectStory}
      />
    </aside>
  );
}
