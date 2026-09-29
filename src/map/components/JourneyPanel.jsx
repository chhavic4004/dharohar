import React, { useEffect, useRef } from "react";
import Timeline from "./Timeline";
import MigrationControls from "./MigrationControls";
import StoryStageDetail from "./StoryStageDetail";

const STEP_DURATION_MS = 1800;

/**
 * Docked panel shown above the map whenever the selected story has a
 * migration journey. Owns the play/pause/reset animation timer and reports
 * the selected stage index up to App so the map can stay in sync.
 */
export default function JourneyPanel({
  story,
  journey,
  selectedIndex,
  onSelectIndex,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onClose,
}) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      onSelectIndex((prev) => {
        if (prev >= journey.length - 1) {
          clearInterval(timerRef.current);
          onPause();
          return prev;
        }
        return prev + 1;
      });
    }, STEP_DURATION_MS);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, journey]);

  if (!story || !journey || !journey.length) return null;

  const currentStage = journey[selectedIndex] || journey[0];
  const atEnd = selectedIndex === journey.length - 1;

  return (
    <div className="journey-panel">
      <div className="journey-panel__header">
        <div>
          <span className="journey-panel__eyebrow">Migration Journey · Demo Data</span>
          <h2 className="journey-panel__title">{story.title}</h2>
        </div>
        <button className="journey-panel__close" onClick={onClose} aria-label="Close journey panel">
          ✕
        </button>
      </div>

      <Timeline journey={journey} selectedIndex={selectedIndex} onSelect={(i) => onSelectIndex(i)} />

      <div className="journey-panel__body">
        <StoryStageDetail
          story={story}
          stage={currentStage}
          stageIndex={selectedIndex}
          totalStages={journey.length}
        />
        <MigrationControls isPlaying={isPlaying} atEnd={atEnd} onPlay={onPlay} onPause={onPause} onReset={onReset} />
      </div>
    </div>
  );
}
