import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import JourneyPanel from "./components/JourneyPanel";
import { fetchStories, fetchPartitionPath, fetchLanguages } from "./api/storiesApi";
import "leaflet/dist/leaflet.css";
import "./map.css";

export default function App() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [dataSource, setDataSource] = useState("api"); // "api" | "fallback"

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [languages, setLanguages] = useState([]);

  const [activeStoryId, setActiveStoryId] = useState(null);
  const [showPartitionPath, setShowPartitionPath] = useState(true);
  const [partitionPath, setPartitionPath] = useState(null);
  const [detailStory, setDetailStory] = useState(null); // simple full-story modal for non-journey stories

  // Migration-journey state: which stage is highlighted, and whether the
  // "Play Journey" animation is currently running.
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load the partition path reference line and the language list once.
  useEffect(() => {
    fetchPartitionPath().then(setPartitionPath);
    fetchLanguages().then(setLanguages);
  }, []);

  // Re-fetch stories whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetchStories({ category: activeCategory, language: activeLanguage })
      .then(({ stories: data, source }) => {
        if (cancelled) return;
        setStories(data);
        setDataSource(source);
        setLoading(false);
        // Keep the current selection only if it's still in the filtered list.
        setActiveStoryId((prev) => (data.some((s) => s.id === prev) ? prev : null));
      })
      .catch((err) => {
        if (cancelled) return;
        setStories([]);
        setLoading(false);
        setFetchError("Couldn't load stories right now. Please try again in a moment.");
        console.error("[App] fetchStories failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, activeLanguage]);

  const activeStory = useMemo(
    () => stories.find((s) => s.id === activeStoryId) || null,
    [stories, activeStoryId]
  );

  const activeJourney = useMemo(() => {
    if (!activeStory || !Array.isArray(activeStory.journey) || !activeStory.journey.length) {
      return null;
    }
    return activeStory.journey;
  }, [activeStory]);

  // Reset the timeline position and stop any animation whenever the
  // selected story changes.
  useEffect(() => {
    setSelectedStageIndex(0);
    setIsPlaying(false);
  }, [activeStoryId]);

  const handleSelectStory = useCallback((id) => {
    setActiveStoryId(id);
  }, []);

  const handleCloseJourney = useCallback(() => {
    setActiveStoryId(null);
    setIsPlaying(false);
  }, []);

  const handleReadMore = useCallback((story) => {
    setDetailStory(story);
  }, []);

  return (
    <div className="map-page">
      <main className="app__body">
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          languages={languages}
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
          showPartitionPath={showPartitionPath}
          onTogglePartitionPath={setShowPartitionPath}
          stories={stories}
          loading={loading}
          error={fetchError}
          usingFallback={dataSource === "fallback"}
          activeStoryId={activeStoryId}
          onSelectStory={handleSelectStory}
        />

        <div className="map-column">
          <MapView
            stories={stories}
            activeStoryId={activeStoryId}
            onSelectStory={handleSelectStory}
            showPartitionPath={showPartitionPath}
            partitionPath={partitionPath}
            onReadMore={handleReadMore}
            journeyStory={activeJourney ? activeStory : null}
            journey={activeJourney}
            selectedStageIndex={selectedStageIndex}
            onSelectStage={setSelectedStageIndex}
          />

          {activeJourney && (
            <JourneyPanel
              story={activeStory}
              journey={activeJourney}
              selectedIndex={selectedStageIndex}
              onSelectIndex={setSelectedStageIndex}
              isPlaying={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onReset={() => {
                setIsPlaying(false);
                setSelectedStageIndex(0);
              }}
              onClose={handleCloseJourney}
            />
          )}
        </div>
      </main>

      {detailStory && (
        <div className="story-modal-backdrop" onClick={() => setDetailStory(null)}>
          <div className="story-modal" onClick={(e) => e.stopPropagation()}>
            <button className="story-modal__close" onClick={() => setDetailStory(null)}>
              ✕
            </button>
            <span className="story-popup__category">{detailStory.category.toUpperCase()}</span>
            <h2>{detailStory.title}</h2>
            <p className="story-popup__location">📍 {detailStory.location}</p>
            <p>{detailStory.description}</p>
            {detailStory.contributor && <p>Shared by {detailStory.contributor}</p>}
            {detailStory.language && <p>Language: {detailStory.language}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
