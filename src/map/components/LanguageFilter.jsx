import React from "react";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";
import { localizeLanguageName } from "../data/storyText";

/** Dropdown filter for story language, populated from whatever the backend reports. */
export default function LanguageFilter({ languages, activeLanguage, onChange }) {
  const { t, lang: siteLang } = usePageText(storyMapText);
  if (!languages || !languages.length) return null;

  return (
    <label className="language-filter">
      <span className="language-filter__label">{t("languageLabel")}</span>
      <select
        className="language-filter__select"
        value={activeLanguage}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="All">{t("allLanguages")}</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {localizeLanguageName(lang, siteLang)}
          </option>
        ))}
      </select>
    </label>
  );
}
