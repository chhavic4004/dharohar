import { useSyncExternalStore } from "react";

/**
 * Site-wide language. One source of truth for the header picker, the quiz,
 * the map and any other page.
 *
 *   const lang = useLang();          // "en" | "hi" | "pa" | "ur"
 *   setLang("hi");                   // from anywhere
 *   window.dispatchEvent(new CustomEvent("dharohar:lang", { detail: "hi" }))  // same, without importing
 *
 * The choice is saved in localStorage ("dharohar.lang") and applied to
 * <html lang>, so screen readers and browser fonts pick the right script.
 */
export type SiteLang = "en" | "hi" | "pa" | "ur";

export const SITE_LANGS: { code: SiteLang; label: string; english: string; short: string; speech: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", english: "English", short: "EN", speech: "en-IN", dir: "ltr" },
  { code: "hi", label: "हिन्दी", english: "Hindi", short: "हि", speech: "hi-IN", dir: "ltr" },
  { code: "pa", label: "ਪੰਜਾਬੀ", english: "Punjabi", short: "ਪੰ", speech: "pa-IN", dir: "ltr" },
  { code: "ur", label: "اردو", english: "Urdu", short: "ار", speech: "ur-IN", dir: "rtl" },
];

const KEY = "dharohar.lang";
const EVENT = "dharohar:lang";
const listeners = new Set<() => void>();

const isLang = (v: unknown): v is SiteLang => v === "en" || v === "hi" || v === "pa" || v === "ur";

/**
 * Starting language, in order: ?lang= in the URL (shareable links), the
 * visitor's saved choice, then the browser's own languages, then English.
 */
function read(): SiteLang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (isLang(fromUrl)) {
      localStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
  } catch {
    /* ignore */
  }
  try {
    const v = localStorage.getItem(KEY);
    if (isLang(v)) return v;
  } catch {
    /* storage blocked */
  }
  const browser = typeof navigator === "undefined" ? [] : [...(navigator.languages ?? []), navigator.language];
  for (const l of browser) {
    const base = (l || "").toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}

let current: SiteLang = typeof window === "undefined" ? "en" : read();

function apply(lang: SiteLang) {
  if (typeof document !== "undefined") document.documentElement.lang = lang;
}
apply(current);

export function getLang(): SiteLang {
  return current;
}

export function setLang(lang: SiteLang) {
  if (!isLang(lang) || lang === current) return;
  current = lang;
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    /* ignore */
  }
  apply(lang);
  listeners.forEach((l) => l());
}

/**
 * Locale for dates and numbers, for example "hi-IN". Digits always stay 0-9
 * (Urdu would otherwise switch to Eastern Arabic digits), so scores, years
 * and codes look the same in every language.
 */
export function localeOf(lang: SiteLang): string {
  return lang === "en" ? "en-IN" : `${lang}-IN-u-nu-latn`;
}

export function langDir(lang: SiteLang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

if (typeof window !== "undefined") {
  // Other features (or another tab) can switch the language too.
  window.addEventListener(EVENT, (e) => setLang((e as CustomEvent<string>).detail as SiteLang));
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && isLang(e.newValue)) setLang(e.newValue);
  });
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useLang(): SiteLang {
  return useSyncExternalStore(subscribe, getLang, () => "en" as SiteLang);
}
