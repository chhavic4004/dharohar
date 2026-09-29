import React from "react";

/** Dropdown filter for story language, populated from whatever the backend reports. */
export default function LanguageFilter({ languages, activeLanguage, onChange }) {
  if (!languages || !languages.length) return null;

  return (
    <label className="language-filter">
      <span className="language-filter__label">Language</span>
      <select
        className="language-filter__select"
        value={activeLanguage}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="All">All languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </label>
  );
}
