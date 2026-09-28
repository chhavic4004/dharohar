import React, { useState } from "react";

const NAV_LINKS = [
  { label: "Home", icon: "🎙️" },
  { label: "Map", icon: "🗺️", active: true },
  { label: "Quiz", icon: "❓" },
  { label: "Preserve a Story", icon: "🎤" },
  { label: "Passport", icon: "🛂" },
  { label: "AR Walk", icon: "🧭" },
  { label: "Vulnerability", icon: "📊" },
  { label: "Admin", icon: "⚠️" },
];

export default function Navbar({ activePage = "Map", onNavigate }) {
  const [lang, setLang] = useState("EN");

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__brand-icon">❤️</span>
        <div className="navbar__brand-text">
          <span className="navbar__brand-title">DHAROHAR</span>
          <span className="navbar__brand-subtitle">धरोहर | دھروہر</span>
        </div>
      </div>

      <nav className="navbar__links">
        {NAV_LINKS.map((link) => (
          <button
            key={link.label}
            className={`navbar__link ${link.label === activePage ? "navbar__link--active" : ""}`}
            onClick={() => onNavigate && onNavigate(link.label)}
          >
            <span className="navbar__link-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>

      <button
        className="navbar__lang"
        onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
        title="Switch language"
      >
        {lang} <span className="navbar__lang-chevron">▾</span>
      </button>
    </header>
  );
}
