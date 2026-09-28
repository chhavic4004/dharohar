import React, { useState } from "react";

const STAGE_LABELS = {
  origin: "Origin",
  waypoint: "Migration Stage",
  present: "Present Day",
};

/**
 * Detail card for the currently-selected stage of a migration journey:
 * person, year, location, description, and demo placeholders for the
 * media actions (Read Story / Listen / View Translation) that a later,
 * fully-built-out Dharohar would wire up to real audio/transcripts.
 */
export default function StoryStageDetail({ story, stage, stageIndex, totalStages }) {
  const [demoNote, setDemoNote] = useState(null);

  if (!story || !stage) return null;

  const stageLabel = STAGE_LABELS[stage.stage] || "Migration Stage";

  const handleDemoClick = (label) => {
    setDemoNote(label);
  };

  return (
    <div className="stage-detail">
      <div className="stage-detail__top">
        <span className={`stage-detail__badge stage-detail__badge--${stage.stage || "waypoint"}`}>
          {stageLabel} · {stageIndex + 1} of {totalStages}
        </span>
        <span className="stage-detail__language">{story.language}</span>
      </div>

      <h3 className="stage-detail__heading">
        {stage.year} — {stage.city}
        {stage.country ? `, ${stage.country}` : ""}
      </h3>

      <p className="stage-detail__person">
        {story.person || story.contributor} · <em>{story.title}</em>
      </p>

      <p className="stage-detail__description">{stage.description}</p>

      <div className="stage-detail__actions">
        <button className="stage-detail__action" onClick={() => handleDemoClick("Read Story")}>
          📖 Read Story
        </button>
        <button className="stage-detail__action" onClick={() => handleDemoClick("Listen")}>
          🔊 Listen
        </button>
        <button className="stage-detail__action" onClick={() => handleDemoClick("View Translation")}>
          🌐 View Translation
        </button>
      </div>

      {demoNote && (
        <p className="stage-detail__demo-note">
          "{demoNote}" is a placeholder for this SIH demo — audio and translation are not wired up
          to real content yet.
        </p>
      )}
    </div>
  );
}
