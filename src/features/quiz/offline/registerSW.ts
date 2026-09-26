/**
 * Registers a small service worker that caches the app shell and built
 * assets, so downloaded offline packs can be played with no network.
 *
 * INTEGRATION: if the team adds a site-wide PWA service worker later, merge
 * the rules from public/quiz-sw.js into it and delete this registration.
 */
export function registerQuizServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/quiz-sw.js", { scope: "/" }).catch(() => {
    /* offline support is optional */
  });
}
