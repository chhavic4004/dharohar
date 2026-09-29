import React from "react";
import { CATEGORIES } from "../data/categories";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

import { BAND_COLOR } from "../../features/quiz";

export default function Legend({ showPartitionPath, showMigrationRoute, showQuizSpots }) {
  const { t, dir } = usePageText(storyMapText);
  const storyTypes = CATEGORIES.filter((c) => c.id !== "All");

  return (
    <div className="legend" dir={dir}>
      <span className="legend__title">{t("legendStoryTypes")}</span>
      <ul className="legend__list">
        {storyTypes.map((cat) => (
          <li key={cat.id} className="legend__item">
            <span className="legend__dot" style={{ backgroundColor: cat.color }} />
            {t(cat.labelKey)}
          </li>
        ))}
      </ul>
      {(showPartitionPath || showMigrationRoute) && <hr className="legend__divider" />}
      {showPartitionPath && (
        <div className="legend__item legend__item--path">
          <span className="legend__dash" />
          {t("legendPartitionPath")}
        </div>
      )}
      {showQuizSpots && (
        <>
          <hr className="legend__divider" />
          <span className="legend__title">{t("legendQuizSpots")}</span>
          <ul className="legend__list">
            <li className="legend__item"><span className="legend__dot" style={{ backgroundColor: BAND_COLOR.Stable }} />{t("legendStable")}</li>
            <li className="legend__item"><span className="legend__dot" style={{ backgroundColor: BAND_COLOR.Vulnerable }} />{t("legendVulnerable")}</li>
            <li className="legend__item"><span className="legend__dot" style={{ backgroundColor: BAND_COLOR.Critical }} />{t("legendCritical")}</li>
          </ul>
        </>
      )}
      {showMigrationRoute && (
        <div className="legend__item legend__item--path">
          <span className="legend__dash legend__dash--solid" />
          {t("legendMigrationRoute")}
        </div>
      )}
    </div>
  );
}
