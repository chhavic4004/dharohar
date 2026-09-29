import React from "react";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

/** Play / Pause / Reset controls for stepping through a migration journey. */
export default function MigrationControls({ isPlaying, atEnd, onPlay, onPause, onReset }) {
  const { t } = usePageText(storyMapText);
  return (
    <div className="migration-controls">
      {isPlaying ? (
        <button className="migration-controls__btn" onClick={onPause}>
          {t("pause")}
        </button>
      ) : (
        <button className="migration-controls__btn migration-controls__btn--primary" onClick={onPlay}>
          {atEnd ? t("replayJourney") : t("playJourney")}
        </button>
      )}
      <button className="migration-controls__btn" onClick={onReset}>
        {t("resetJourney")}
      </button>
    </div>
  );
}
