import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Mic, Map as MapIcon, ShieldCheck, Compass, BarChart2, ShieldAlert, Menu, X, Heart, ChevronDown, Check, HelpCircle, Globe } from "lucide-react";
import { AccountMenu, AuthProvider, PhoneGate } from "../features/auth";
import { useSiteT } from "../i18n/site";
import { SITE_LANGS, langDir, setLang, useLang } from "../lib/language";
import { ToastHost } from "../lib/toast";

/** Site shell. Provides login state to every page and the site-wide language picker. */
export function Layout() {
  return (
    <AuthProvider>
      <Shell />
      <DocumentTitle />
      <PhoneGate />
      <ToastHost />
    </AuthProvider>
  );
}

/** Browser tab title in the site language, for example "नक्शा · धरोहर". */
function DocumentTitle() {
  const { pathname } = useLocation();
  const t = useSiteT();
  useEffect(() => {
    const page: [string, Parameters<typeof t>[0]][] = [
      ["/map", "navMap"],
      ["/quiz", "navQuiz"],
      ["/preserve", "navPreserve"],
      ["/passport", "navPassport"],
      ["/ar-walk", "navArWalk"],
      ["/dashboard", "navVulnerability"],
      ["/admin-heatmap", "navAdmin"],
      ["/explore/", "pageTradition"],
      ["/explore", "pageExplore"],
      ["/story", "pageStory"],
      ["/account", "myAccount"],
      ["/login", "signIn"],
    ];
    const hit = page.find(([prefix]) => pathname.startsWith(prefix));
    document.title = hit ? `${t(hit[1])} · ${t("brand")}` : t("brand");
  }, [pathname, t]);
  return null;
}

function Shell() {
  const location = useLocation();
  const t = useSiteT();
  const selectedLang = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const languages = SITE_LANGS;
  const currentLang = languages.find((l) => l.code === selectedLang) || languages[0];
  const dir = langDir(selectedLang);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: t("navHome"), path: "/", icon: <Mic className="w-4 h-4" /> },
    { name: t("navMap"), path: "/map", icon: <MapIcon className="w-4 h-4" /> },
    { name: t("navQuiz"), path: "/quiz", icon: <HelpCircle className="w-4 h-4" /> },
    { name: t("navPreserve"), path: "/preserve", icon: <Mic className="w-4 h-4" /> },
    { name: t("navPassport"), path: "/passport", icon: <ShieldCheck className="w-4 h-4" /> },
    { name: t("navArWalk"), path: "/ar-walk", icon: <Compass className="w-4 h-4" /> },
    { name: t("navVulnerability"), path: "/dashboard", icon: <BarChart2 className="w-4 h-4" /> },
    { name: t("navAdmin"), path: "/admin-heatmap", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-parchment/90 backdrop-blur-sm border-b border-maroon/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0">
            <Heart className="w-5 h-5 text-terracotta fill-terracotta shrink-0" />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-maroon uppercase leading-tight">
                Dharohar
              </span>
              <span className="text-[10px] sm:text-xs text-ink/70 font-medium leading-none">
                धरोहर | دھروہر
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3" dir={dir}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || ((item.path === '/preserve' || item.path === '/quiz') && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-terracotta/15 text-maroon font-semibold shadow-xs"
                      : "text-ink/70 hover:text-maroon hover:bg-maroon/5"
                  }`}
                >
                  <span className="hidden lg:block">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Multilingual Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                aria-label={`${t("selectLanguage")}: ${currentLang.english}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-terracotta bg-maroon/5 hover:bg-maroon/10 border border-maroon/30 rounded-full px-3 py-1.5 transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden />
                <span>{currentLang.short}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div role="listbox" aria-label={t("selectLanguage")} className="absolute right-0 mt-2 w-48 bg-parchment border border-maroon/20 rounded-lg shadow-lg py-1 z-50">
                  {languages.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        role="option"
                        aria-selected={isSelected}
                        lang={lang.code}
                        onClick={() => {
                          setLang(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-terracotta/15 text-maroon font-semibold"
                            : "text-ink/80 hover:bg-maroon/5 hover:text-maroon"
                        }`}
                      >
                        <span>
                          {lang.label}
                          {lang.code !== "en" && <span className="text-ink/45 font-normal ms-1.5">{lang.english}</span>}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <AccountMenu />

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-md text-maroon hover:bg-maroon/10 transition-colors cursor-pointer"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {menuOpen && (
          <nav className="md:hidden border-t border-maroon/15 bg-parchment/95 backdrop-blur-sm" dir={dir}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-colors ${
                      isActive ? "text-maroon bg-terracotta/15 font-semibold" : "text-ink/80 hover:text-maroon hover:bg-maroon/5"
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-maroon/10">
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-xs font-medium text-ink/70">{t("languageLabel")}:</span>
                  <div className="flex gap-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        lang={lang.code}
                        aria-pressed={selectedLang === lang.code}
                        aria-label={lang.english}
                        onClick={() => setLang(lang.code)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                          selectedLang === lang.code
                            ? "bg-terracotta text-white font-semibold"
                            : "bg-maroon/5 text-maroon hover:bg-maroon/10"
                        }`}
                      >
                        {lang.short}
                      </button>
                    ))}
                  </div>
                </div>
                <Link to="/preserve" className="w-full bg-terracotta text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-maroon transition-colors flex items-center justify-center gap-2 shadow-sm card-shadow cursor-pointer">
                  <Mic className="w-4 h-4" /> {t("recordStory")}
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-ink text-parchment py-12 mt-auto" dir={dir}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-serif text-2xl font-bold text-parchment mb-4 block">Dharohar</span>
            <p className="text-parchment/70 text-sm">
              {t("footerTagline")}
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-turmeric">{t("footerExplore")}</h4>
            <ul className="space-y-2 text-sm text-parchment/70">
              <li><Link to="/map" className="hover:text-parchment transition-colors">{t("footerHeritageMap")}</Link></li>
              <li><Link to="/dashboard" className="hover:text-parchment transition-colors">{t("footerVulnIndex")}</Link></li>
              <li><Link to="/ar-walk" className="hover:text-parchment transition-colors">{t("footerArTime")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-turmeric">{t("footerParticipate")}</h4>
            <ul className="space-y-2 text-sm text-parchment/70">
              <li><Link to="/preserve" className="hover:text-parchment transition-colors">{t("recordStory")}</Link></li>
              <li><Link to="/passport" className="hover:text-parchment transition-colors">{t("footerVerify")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-turmeric">{t("footerEthics")}</h4>
            <p className="text-xs text-parchment/50">
              {t("footerEthics1")}
              <br />
              {t("footerEthics2")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
