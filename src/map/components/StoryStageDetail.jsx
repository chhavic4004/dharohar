import React, { useState } from "react";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

// Stage type -> label key in storyMapText. Exported for the map popups.
export const STAGE_LABEL_KEYS = {
  origin: "stageOrigin",
  waypoint: "stageWaypoint",
  present: "stagePresent",
};

/**
 * Detail card for the currently-selected stage of a migration journey:
 * person, year, location, description, and demo placeholders for the
 * media actions (Read Story / Listen / View Translation) that a later,
 * fully-built-out Dharohar would wire up to real audio/transcripts.
 */
export default function StoryStageDetail({ story, stage, stageIndex, totalStages }) {
  const { t, lang } = usePageText(storyMapText);
  const [demoNote, setDemoNote] = useState(null);

  if (!story || !stage) return null;

  const stageLabel = t(STAGE_LABEL_KEYS[stage.stage] || "stageWaypoint");

  const handleDemoClick = (label) => {
    setDemoNote(label);
  };

  return (
    <div className="stage-detail">
      <div className="stage-detail__top">
        <span className={`stage-detail__badge stage-detail__badge--${stage.stage || "waypoint"}`}>
          {t("stageCount", { label: stageLabel, i: stageIndex + 1, n: totalStages })}
        </span>
        <span className="stage-detail__language">{story.language}</span>
      </div>

      <h3 className="stage-detail__heading">
        {stage.year} — {stage.city}
        {stage.country ? `${lang === "ur" ? "،" : ","} ${stage.country}` : ""}
      </h3>

      <p className="stage-detail__person">
        {story.person || story.contributor} · <em>{story.title}</em>
      </p>

      <p className="stage-detail__description">{stage.description}</p>

      <div className="stage-detail__actions">
        <button className="stage-detail__action" onClick={() => handleDemoClick(t("actionReadStory"))}>
          {t("readStory")}
        </button>
        <button className="stage-detail__action" onClick={() => handleDemoClick(t("actionListen"))}>
          {t("listen")}
        </button>
        <button className="stage-detail__action" onClick={() => handleDemoClick(t("actionViewTranslation"))}>
          {t("viewTranslation")}
        </button>
      </div>

      {demoNote && (
        <p className="stage-detail__demo-note">
          {t("demoNote", { action: demoNote })}
        </p>
      )}
    </div>
  );
}
