import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Mic, Map as MapIcon, ShieldCheck, Compass, BarChart2, ShieldAlert, Menu, X, Heart, ChevronDown, Check, HelpCircle } from "lucide-react";

export function Layout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("hi");
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English", short: "EN" },
    { code: "hi", label: "हिन्दी (Hindi)", short: "हि" },
    { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)", short: "ਪੰ" },
    { code: "ur", label: "اردو (Urdu)", short: "ار" },
  ];

  const currentLang = languages.find((l) => l.code === selectedLang) || languages[1];

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
    { name: "Home", path: "/", icon: <Mic className="w-4 h-4" /> },
    { name: "Map", path: "/map", icon: <MapIcon className="w-4 h-4" /> },
    { name: "Quiz", path: "/quiz", icon: <HelpCircle className="w-4 h-4" /> },
    { name: "Preserve a Story", path: "/preserve", icon: <Mic className="w-4 h-4" /> },
    { name: "Passport", path: "/passport", icon: <ShieldCheck className="w-4 h-4" /> },
    { name: "Tour guide", path: "/tour-guide", icon: <Compass className="w-4 h-4" /> },
    { name: "Vulnerability", path: "/dashboard", icon: <BarChart2 className="w-4 h-4" /> },
    { name: "Admin", path: "/admin-heatmap", icon: <ShieldAlert className="w-4 h-4" /> },
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

          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/preserve' && location.pathname.startsWith('/preserve'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
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
            <div className="relative hidden sm:block" ref={langDropdownRef}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-label="Select Language"
                className="flex items-center gap-1.5 text-xs font-semibold text-maroon hover:text-terracotta bg-maroon/5 hover:bg-maroon/10 border border-maroon/30 rounded-full px-3 py-1.5 transition-all cursor-pointer"
              >
                <span>{currentLang.short}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-parchment border border-maroon/20 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {languages.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-terracotta/15 text-maroon font-semibold"
                            : "text-ink/80 hover:bg-maroon/5 hover:text-maroon"
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-terracotta shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-md text-maroon hover:bg-maroon/10 transition-colors cursor-pointer"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {menuOpen && (
          <nav className="md:hidden border-t border-maroon/15 bg-parchment/95 backdrop-blur-sm">
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
                  <span className="text-xs font-medium text-ink/70">Language:</span>
                  <div className="flex gap-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
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
                  <Mic className="w-4 h-4" /> Record a Story
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="bg-ink text-parchment py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-serif text-2xl font-bold text-parchment mb-4 block">Dharohar</span>
            <p className="text-parchment/70 text-sm">
              India's first living cultural knowledge engine.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-turmeric">Explore</h4>
            <ul className="space-y-2 text-sm text-parchment/70">
              <li><Link to="/map" className="hover:text-parchment transition-colors">Heritage Map</Link></li>
              <li><Link to="/dashboard" className="hover:text-parchment transition-colors">Vulnerability Index</Link></li>
              <li><Link to="/ar-walk" className="hover:text-parchment transition-colors">AR Time Machine</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-turmeric">Participate</h4>
            <ul className="space-y-2 text-sm text-parchment/70">
              <li><Link to="/preserve" className="hover:text-parchment transition-colors">Record a Story</Link></li>
              <li><Link to="/passport" className="hover:text-parchment transition-colors">Verify Authenticity</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-lg mb-4 text-turmeric">Ethics</h4>
            <p className="text-xs text-parchment/50">
              Every story is community-owned. 
              <br/>DPDP Act 2023 compliant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
