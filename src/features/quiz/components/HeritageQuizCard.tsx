import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Brain } from "lucide-react";
import type { HeritageQuizInfo } from "@shared/quiz-contract";
import { quizApi } from "../api/quizApi";
import { I18nProvider, useI18n } from "../i18n";
import { cx } from "./ui";

interface Props {
  /** Heritage registry id, for example "phulkari" or "hampi" */
  heritageId: string;
  className?: string;
}

function Inner({ heritageId, className }: Props) {
  const { t, lang } = useI18n();
  const [info, setInfo] = useState<HeritageQuizInfo | null>(null);

  useEffect(() => {
    let live = true;
    quizApi
      .heritage(heritageId)
      .then((d) => live && setInfo(d))
      .catch(() => live && setInfo(null));
    return () => {
      live = false;
    };
  }, [heritageId, lang]);

  // Stay invisible if the backend is down or the id has no questions.
  if (!info || info.questionCount === 0) return null;
  const name = lang === "hi" && info.heritage.hindi ? info.heritage.hindi : info.heritage.name;

  return (
    <div className={cx("rounded-2xl border border-maroon/15 bg-gradient-to-br from-[#fbf3e4] to-[#f4e3c8] p-5 flex items-center gap-4 shadow-sm", className)}>
      <div className="shrink-0 w-12 h-12 rounded-xl bg-maroon text-white flex items-center justify-center">
        <Brain className="w-6 h-6" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold text-ink">{t("widgetTitle")}</p>
        <p className="text-sm text-ink/60">{t("widgetBody", { n: info.questionCount, name })}</p>
      </div>
      <Link
        to={`/quiz/heritage/${encodeURIComponent(info.heritage.id)}`}
        className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-maroon text-white text-sm font-semibold px-4 py-2.5 hover:bg-terracotta"
      >
        {t("widgetStart")} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
      </Link>
    </div>
  );
}

/**
 * Drop-in card for any archive, tradition or site page:
 *   <HeritageQuizCard heritageId="phulkari" />
 * Works outside the quiz routes and hides itself when there are no questions.
 */
export default function HeritageQuizCard(props: Props) {
  return (
    <I18nProvider>
      <Inner {...props} />
    </I18nProvider>
  );
}
