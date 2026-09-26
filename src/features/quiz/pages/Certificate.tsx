import { Link, useNavigate } from "react-router";
import { ArrowLeft, Award, Lock, Printer } from "lucide-react";
import { quizApi } from "../api/quizApi";
import { useApi } from "../hooks/useApi";
import { useI18n } from "../i18n";
import { Button, Card, ErrorState, Spinner } from "../components/ui";
import { useLevelName } from "./QuizHome";

/** Printable certificate, unlocked by redeeming "Heritage Supporter Certificate". */
export default function Certificate() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const levelName = useLevelName();
  const profile = useApi(() => quizApi.profile());
  const wallet = useApi(() => quizApi.redemptions());

  if (profile.loading || wallet.loading) return <Spinner label={t("loading")} />;
  if (profile.error || wallet.error) return <ErrorState error={(profile.error ?? wallet.error)!} onRetry={() => { profile.reload(); wallet.reload(); }} />;

  const p = profile.data!;
  const cert = wallet.data!.find((w) => w.rewardId === "supporter-certificate" && w.status === "active");
  const hi = lang === "hi";

  if (!cert) {
    return (
      <div className="bg-parchment py-12 px-4">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Lock className="w-9 h-9 text-maroon/50 mx-auto mb-3" aria-hidden />
          <p className="text-sm text-ink/70 mb-5">{t("certLocked")}</p>
          <Link to="/quiz/rewards" className="inline-flex items-center justify-center rounded-xl bg-maroon text-white font-semibold text-sm px-5 py-3 hover:bg-terracotta">
            {t("goToRewards")}
          </Link>
        </Card>
      </div>
    );
  }

  const issued = new Date(cert.redeemedAt).toLocaleDateString(lang === "en" ? "en-IN" : `${lang}-IN`, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="bg-parchment min-h-[80vh] py-8 px-4 print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-maroon cursor-pointer">
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden /> {t("navProgress")}
        </button>
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4" aria-hidden /> {t("printCert")}
        </Button>
      </div>

      <article
        className="max-w-3xl mx-auto bg-[#fffaf0] border-[10px] border-double border-maroon/70 rounded-sm p-8 sm:p-12 text-center shadow-xl print:shadow-none print:max-w-none"
        aria-label={t("certTitle")}
      >
        <p className="text-turmeric text-xs tracking-[0.35em] uppercase">Dharohar · धरोहर</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-maroon mt-3">{t("certTitle")}</h1>
        <div className="flex items-center gap-3 justify-center my-5" aria-hidden>
          <span className="h-px w-16 bg-turmeric" />
          <Award className="w-7 h-7 text-turmeric" />
          <span className="h-px w-16 bg-turmeric" />
        </div>
        <p className="text-sm text-ink/60">{t("certPresented")}</p>
        <p className="font-serif text-3xl sm:text-4xl font-semibold text-ink mt-2 mb-4 break-words">{p.displayName}</p>
        <p className="text-base text-ink/75 max-w-xl mx-auto leading-relaxed">
          {t("certBody", {
            level: p.level.level,
            name: levelName(p.level.level),
            correct: p.correctAnswers,
            quizzes: p.quizzesCompleted,
          })}
        </p>

        {p.badges.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-ink/50 mb-2">{t("certBadges")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {p.badges.map((b) => (
                <span key={b.id} className="rounded-full border border-turmeric/50 bg-turmeric/10 text-[#8a5f12] text-xs font-semibold px-3 py-1">
                  {hi ? b.hindi : b.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-ink/55">
          <div>
            <p className="border-t border-ink/30 pt-2">{t("certIssued", { date: issued })}</p>
          </div>
          <div>
            <p className="border-t border-ink/30 pt-2">
              {t("certId")}: <span className="font-mono tracking-wider text-ink/80">{cert.code}</span>
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
