import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { QuizNav } from "./components/QuizNav";
import { I18nProvider, useI18n } from "./i18n";
import { registerQuizServiceWorker } from "./offline/registerSW";
import { startBackgroundSync } from "./offline/storage";

function Frame() {
  const { pathname } = useLocation();
  const { dir, lang } = useI18n();
  const focused = pathname.startsWith("/quiz/play/") || pathname.startsWith("/quiz/certificate");
  return (
    <div className="flex-1 bg-parchment" dir={dir} lang={lang}>
      {!focused && <QuizNav />}
      <Outlet />
    </div>
  );
}

/** Wraps every quiz page: language, offline support and the quiz section nav. */
export default function QuizLayout() {
  useEffect(() => {
    registerQuizServiceWorker();
    return startBackgroundSync();
  }, []);
  return (
    <I18nProvider>
      <Frame />
    </I18nProvider>
  );
}
