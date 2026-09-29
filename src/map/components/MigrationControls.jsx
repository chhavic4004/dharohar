import React from "react";

/** Play / Pause / Reset controls for stepping through a migration journey. */
export default function MigrationControls({ isPlaying, atEnd, onPlay, onPause, onReset }) {
  return (
    <div className="migration-controls">
      {isPlaying ? (
        <button className="migration-controls__btn" onClick={onPause}>
          ⏸ Pause
        </button>
      ) : (
        <button className="migration-controls__btn migration-controls__btn--primary" onClick={onPlay}>
          {atEnd ? "▶ Replay Journey" : "▶ Play Journey"}
        </button>
      )}
      <button className="migration-controls__btn" onClick={onReset}>
        ⟲ Reset Journey
      </button>
    </div>
  );
}
