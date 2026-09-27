import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CalendarDays, CheckCircle2, Flame } from "lucide-react";
import type { DailyChallenge } from "@shared/quiz-contract";
import { siteText } from "../../../i18n/site";
import { quizApi } from "../api/quizApi";
import { CATEGORY_META } from "../constants";
import { I18nProvider, useI18n } from "../i18n";
import { useCategoryLabel } from "../pages/QuizHome";

function Inner() {
  const { lang } = useI18n();
  const catLabel = useCategoryLabel();
  const [d, setD] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    let live = true;
    quizApi
      .daily()
      .then((x) => live && setD(x))
      .catch(() => live && setD(null));
    return () => {
      live = false;
    };
  }, [lang]);

  // Invisible until loaded, and when the quiz API is not running
  if (!d) return null;
  const Icon = CATEGORY_META[d.question.category].icon;
  const st = (k: Parameters<typeof siteText>[1], v?: Record<string, string | number>) => siteText(lang, k, v);

  return (
    <Link
      to="/quiz/daily"
      className="group block rounded-2xl bg-white border border-maroon/10 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta mb-3">
        <CalendarDays className="w-4 h-4" aria-hidden /> {st("potdTeaserTitle")}
        <span className="inline-flex items-center gap-1 normal-case tracking-normal text-ink/50 font-medium">
          · <Icon className="w-3.5 h-3.5" aria-hidden /> {catLabel(d.question.category)}
        </span>
        {d.streak > 0 && (
          <span className="ms-auto inline-flex items-center gap-1 normal-case tracking-normal rounded-full bg-turmeric/15 text-[#8a5f12] px-2.5 py-0.5">
            <Flame className="w-3.5 h-3.5" aria-hidden /> {st("potdTeaserStreak", { n: d.streak })}
          </span>
        )}
      </div>
      <p className="font-serif text-lg sm:text-xl text-ink leading-snug">{d.question.prompt}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-maroon group-hover:text-terracotta">
        {d.answered ? <CheckCircle2 className="w-4 h-4 text-heritage" aria-hidden /> : null}
        {d.answered ? st("potdTeaserDone") : st("potdTeaserCta")}
        <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  );
}

/** "Today's heritage question" teaser for the home page or any other page. */
export default function DailyQuestionCard() {
  return (
    <I18nProvider>
      <Inner />
    </I18nProvider>
  );
}
