import React, { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import JourneyPanel from "./components/JourneyPanel";
import { fetchStories, fetchPartitionPath, fetchLanguages } from "./api/storiesApi";
import { useSearchParams } from "react-router";
import { QuizMapExtras, QuizSpotsPanel, quizApi } from "../features/quiz";
import { usePageText } from "../i18n/page";
import { storyMapText } from "../i18n/pages/storyMap";
import { localizeStory } from "./data/storyText";
import { getCategoryLabel } from "./data/categories";
import "leaflet/dist/leaflet.css";
import "./map.css";

export default function App() {
  const { t, lang, dir } = usePageText(storyMapText);
  const [params] = useSearchParams();

  // Heritage quiz spots (from the quiz module): every tradition and site with questions
  const [tab, setTab] = useState(params.get("focus") ? "spots" : "stories");
  const [spots, setSpots] = useState([]);
  const [band, setBand] = useState("all");
  const [me, setMe] = useState(null);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    let live = true;
    quizApi
      .allHeritage()
      .then((xs) => live && setSpots(xs))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [lang]);

  // A "View on map" link from the quiz opens the spots tab
  useEffect(() => {
    if (params.get("focus")) setTab("spots");
  }, [params]);

  const locate = useCallback(() => {
    setLocError(false);
    if (!navigator.geolocation) return setLocError(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError(true),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  // Raw stories as returned by the API (English); `stories` below is the
  // localized view every component renders.
  const [rawStories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [dataSource, setDataSource] = useState("api"); // "api" | "fallback"

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [languages, setLanguages] = useState([]);

  const [activeStoryId, setActiveStoryId] = useState(null);
  const [showPartitionPath, setShowPartitionPath] = useState(true);
  const [partitionPath, setPartitionPath] = useState(null);
  const [detailStoryId, setDetailStoryId] = useState(null); // simple full-story modal for non-journey stories

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
    setFetchError(false);

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
        setFetchError(true);
        console.error("[App] fetchStories failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, activeLanguage]);

  const stories = useMemo(() => rawStories.map((s) => localizeStory(s, lang)), [rawStories, lang]);

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
    setDetailStoryId(story.id);
  }, []);

  const detailStory = detailStoryId ? stories.find((s) => s.id === detailStoryId) || null : null;
  const closeDetail = () => setDetailStoryId(null);

  return (
    <div className="map-page">
      <main className="app__body">
        <aside className="sidebar" dir={dir}>
          <div className="map-tabs" role="tablist" aria-label={t("tabsAria")}>
            <button type="button" role="tab" aria-selected={tab === "stories"} onClick={() => setTab("stories")}>
              {t("tabStories", { n: stories.length })}
            </button>
            <button type="button" role="tab" aria-selected={tab === "spots"} onClick={() => setTab("spots")}>
              {t("tabSpots", { n: spots.length })}
            </button>
          </div>
          {tab === "spots" ? (
            <QuizSpotsPanel spots={spots} band={band} onBandChange={setBand} me={me} onLocate={locate} locError={locError} />
          ) : (
        <Sidebar
          embedded
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          languages={languages}
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
          showPartitionPath={showPartitionPath}
          onTogglePartitionPath={setShowPartitionPath}
          stories={stories}
          loading={loading}
          error={fetchError ? t("loadError") : null}
          usingFallback={dataSource === "fallback"}
          activeStoryId={activeStoryId}
          onSelectStory={handleSelectStory}
        />
          )}
        </aside>

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
            showQuizSpots={spots.length > 0}
          >
            <QuizMapExtras spots={spots} band={band} visible={spots.length > 0} me={me} />
          </MapView>

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
        <div className="story-modal-backdrop" onClick={closeDetail}>
          <div
            className="story-modal"
            role="dialog"
            aria-modal="true"
            aria-label={detailStory.title}
            dir={dir}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="story-modal__close" onClick={closeDetail} aria-label={t("closeStory")} title={t("closeStory")}>
              ✕
            </button>
            <span className="story-popup__category">{getCategoryLabel(detailStory.category, t).toUpperCase()}</span>
            <h2>{detailStory.title}</h2>
            <p className="story-popup__location">📍 {detailStory.location}</p>
            <p>{detailStory.description}</p>
            {detailStory.contributor && <p>{t("sharedBy", { name: detailStory.contributor })}</p>}
            {detailStory.language && <p>{t("languageIs", { lang: detailStory.language })}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
