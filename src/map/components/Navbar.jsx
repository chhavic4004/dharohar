import React from "react";
import { usePageText } from "../../i18n/page";
import { storyMapText } from "../../i18n/pages/storyMap";
import { SITE_LANGS, setLang } from "../../lib/language";

const NAV_LINKS = [
  // `label` stays the English id passed to onNavigate; `key` is the display text.
  { label: "Home", key: "navHome", icon: "🎙️" },
  { label: "Map", key: "navMap", icon: "🗺️", active: true },
  { label: "Quiz", key: "navQuiz", icon: "❓" },
  { label: "Preserve a Story", key: "navPreserve", icon: "🎤" },
  { label: "Passport", key: "navPassport", icon: "🛂" },
  { label: "AR Walk", key: "navArWalk", icon: "🧭" },
  { label: "Vulnerability", key: "navVulnerability", icon: "📊" },
  { label: "Admin", key: "navAdmin", icon: "⚠️" },
];

export default function Navbar({ activePage = "Map", onNavigate }) {
  const { t, lang, dir } = usePageText(storyMapText);
  const current = SITE_LANGS.find((l) => l.code === lang);
  const cycleLang = () => {
    const i = SITE_LANGS.findIndex((l) => l.code === lang);
    setLang(SITE_LANGS[(i + 1) % SITE_LANGS.length].code);
  };

  return (
    <header className="navbar" dir={dir}>
      <div className="navbar__brand">
        <span className="navbar__brand-icon">❤️</span>
        <div className="navbar__brand-text">
          <span className="navbar__brand-title">DHAROHAR</span>
          <span className="navbar__brand-subtitle">धरोहर | دھروہر</span>
        </div>
      </div>

      <nav className="navbar__links" aria-label={t("navAria")}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            className={`navbar__link ${link.label === activePage ? "navbar__link--active" : ""}`}
            onClick={() => onNavigate && onNavigate(link.label)}
          >
            <span className="navbar__link-icon">{link.icon}</span>
            {t(link.key)}
          </button>
        ))}
      </nav>

      <button
        className="navbar__lang"
        onClick={cycleLang}
        title={t("switchLanguage")}
        aria-label={t("switchLanguage")}
      >
        {current ? current.short : lang.toUpperCase()} <span className="navbar__lang-chevron">▾</span>
      </button>
    </header>
  );
}
