import React from "react";
import { CATEGORIES } from "../data/categories";

export default function Legend({ showPartitionPath, showMigrationRoute }) {
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
      {showMigrationRoute && (
        <div className="legend__item legend__item--path">
          <span className="legend__dash legend__dash--solid" />
          Migration Route
        </div>
      )}
    </div>
  );
}
