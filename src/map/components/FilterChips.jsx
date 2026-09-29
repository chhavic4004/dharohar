import React from "react";
import { CATEGORIES } from "../data/categories";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";

export default function FilterChips({ activeCategory, onChange }) {
  const { t } = usePageText(storyMapText);
  return (
    <div className="filter-chips" role="group" aria-label={t("categoryFilterAria")}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`filter-chip ${activeCategory === cat.id ? "filter-chip--active" : ""}`}
          style={
            activeCategory === cat.id
              ? { backgroundColor: cat.id === "All" ? "#7a1f33" : cat.color, borderColor: "transparent" }
              : undefined
          }
          aria-pressed={activeCategory === cat.id}
          onClick={() => onChange(cat.id)}
        >
          {t(cat.labelKey)}
        </button>
      ))}
    </div>
  );
}
