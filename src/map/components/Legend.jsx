import React from "react";
import { CATEGORIES } from "../data/categories";

import { BAND_COLOR } from "../../features/quiz";

export default function Legend({ showPartitionPath, showMigrationRoute, showQuizSpots }) {
  const storyTypes = CATEGORIES.filter((c) => c.id !== "All");

  return (
    <div className="legend">
      <span className="legend__title">STORY TYPES</span>
      <ul className="legend__list">
        {storyTypes.map((cat) => (
          <li key={cat.id} className="legend__item">
            <span className="legend__dot" style={{ backgroundColor: cat.color }} />
            {cat.label}
          </li>
        ))}
      </ul>
      {(showPartitionPath || showMigrationRoute) && <hr className="legend__divider" />}
      {showPartitionPath && (
        <div className="legend__item legend__item--path">
          <span className="legend__dash" />
          Partition Path (reference)
        </div>
      )}
      {showQuizSpots && (
        <>
          <hr className="legend__divider" />
          <span className="legend__title">HERITAGE QUIZ SPOTS</span>
          <ul className="legend__list">
            <li className="legend__item"><span className="legend__dot" style={{ backgroundColor: BAND_COLOR.Stable }} />Stable</li>
            <li className="legend__item"><span className="legend__dot" style={{ backgroundColor: BAND_COLOR.Vulnerable }} />Vulnerable</li>
            <li className="legend__item"><span className="legend__dot" style={{ backgroundColor: BAND_COLOR.Critical }} />Critical</li>
          </ul>
        </>
      )}
      {showMigrationRoute && (
        <div className="legend__item legend__item--path">
          <span className="legend__dash legend__dash--solid" />
          Migration Route
        </div>
      )}
    </div>
  );
}
