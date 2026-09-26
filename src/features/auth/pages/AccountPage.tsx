import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { History, KeyRound, Loader2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { PASSWORD_MIN_LENGTH } from "@shared/auth-contract";
import { QuizHistory } from "../../quiz";
import { useSiteT } from "../../../i18n/site";
import { langDir, useLang } from "../../../lib/language";
import { showToast } from "../../../lib/toast";
import { authApi } from "../api";
import { useAuth } from "../AuthProvider";

const input =
  "w-full rounded-xl border border-maroon/25 bg-white px-4 py-2.5 text-sm text-ink focus:outline-2 focus:outline-maroon focus:border-transparent";
const card = "bg-white/85 rounded-2xl border border-maroon/10 shadow-sm p-5 sm:p-6";

/** /account: profile, security and the full activity history. */
export default function AccountPage() {
  const t = useSiteT();
  const lang = useLang();
  const { status, account, setAccount, completeSignIn, signOut } = useAuth();

  const [name, setName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hash } = useLocation();

  useEffect(() => {
    if (status === "signedIn" && hash === "#history") document.getElementById("history")?.scrollIntoView({ behavior: "smooth" });
  }, [status, hash]);

  if (status === "loading") {
    return (
      <div className="flex-1 flex justify-center py-20 text-maroon">
        <Loader2 className="w-7 h-7 animate-spin" aria-label={t("loading")} />
      </div>
    );
  }
  if (status === "guest" || !account) return <Navigate to="/login?next=/account" replace />;

  const hasPassword = account.providers.includes("password");
  const locale = lang === "en" ? "en-IN" : `${lang}-IN`;
  const shownName = name ?? account.displayName;

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setError(null);
    try {
      setAccount(await authApi.rename(shownName));
      setName(null);
      showToast(t("saved"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    setError(null);
    try {
      completeSignIn(await authApi.changePassword(next, hasPassword ? current : undefined));
      setCurrent("");
      setNext("");
      showToast(t("passwordChanged"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingPw(false);
    }
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } finally {
      signOut();
      showToast(t("signedOutToast"));
    }
  };

  return (
    <div className="flex-1 bg-parchment px-4 py-8" dir={langDir(lang)}>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Identity */}
        <section className={card}>
          <div className="flex items-center gap-4">
            {account.avatarUrl ? (
              <img src={account.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <span className="w-14 h-14 rounded-full bg-maroon text-white flex items-center justify-center font-serif text-xl font-bold">
                {account.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl font-bold text-ink truncate">{account.displayName}</h1>
              <p className="text-sm text-ink/60 truncate" dir="ltr">
                {account.email}
              </p>
              <p className="text-xs text-ink/45 mt-0.5">
                {t("memberSince", { date: new Date(account.createdAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" }) })}
                {" · "}
                {t("signInMethods")}: {account.providers.map((p) => (p === "google" ? t("methodGoogle") : t("methodPassword"))).join(", ")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/quiz/profile" className="inline-flex items-center gap-1.5 rounded-full bg-maroon/5 border border-maroon/15 text-maroon text-xs font-semibold px-3 py-1.5 hover:bg-maroon/10">
              <UserRound className="w-3.5 h-3.5" aria-hidden /> {t("quizProgress")}
            </Link>
            <button
              onClick={() => {
                signOut();
                showToast(t("signedOutToast"));
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-maroon/15 text-ink/70 text-xs font-semibold px-3 py-1.5 hover:text-maroon cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden /> {t("signOut")}
            </button>
          </div>
        </section>

        {error && (
          <p className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-lg px-3 py-2" role="alert">
            {error}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {/* Name */}
          <form onSubmit={saveName} className={card}>
            <h2 className="font-serif font-semibold text-ink mb-3 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-maroon" aria-hidden /> {t("displayName")}
            </h2>
            <input className={input} value={shownName} onChange={(e) => setName(e.target.value)} maxLength={40} aria-label={t("displayName")} />
            <button
              type="submit"
              disabled={savingName || shownName.trim().length < 2 || shownName === account.displayName}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-maroon text-white text-sm font-semibold px-4 py-2.5 hover:bg-terracotta disabled:bg-ink/15 disabled:text-ink/40 cursor-pointer disabled:cursor-not-allowed"
            >
              {savingName && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />} {t("save")}
            </button>
          </form>

          {/* Password */}
          <form onSubmit={savePassword} className={card}>
            <h2 className="font-serif font-semibold text-ink mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-maroon" aria-hidden /> {hasPassword ? t("changePassword") : t("setPassword")}
            </h2>
            {!hasPassword && <p className="text-xs text-ink/55 mb-2">{t("setPasswordHint")}</p>}
            <div className="space-y-2 mt-2">
              {hasPassword && (
                <input className={input} type="password" dir="ltr" placeholder={t("currentPassword")} aria-label={t("currentPassword")} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
              )}
              <input className={input} type="password" dir="ltr" placeholder={t("newPassword")} aria-label={t("newPassword")} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
              <p className="text-[11px] text-ink/45">{t("passwordHint", { n: PASSWORD_MIN_LENGTH })}</p>
            </div>
            <button
              type="submit"
              disabled={savingPw || next.length < PASSWORD_MIN_LENGTH || (hasPassword && !current)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-maroon text-white text-sm font-semibold px-4 py-2.5 hover:bg-terracotta disabled:bg-ink/15 disabled:text-ink/40 cursor-pointer disabled:cursor-not-allowed"
            >
              {savingPw && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />} {t("save")}
            </button>
          </form>
        </div>

        {/* Sessions */}
        <section className={`${card} flex flex-wrap items-center gap-3`}>
          <ShieldCheck className="w-6 h-6 text-heritage shrink-0" aria-hidden />
          <div className="flex-1 min-w-[200px]">
            <p className="font-semibold text-sm text-ink">{t("security")}</p>
            <p className="text-xs text-ink/55">{t("logoutAllHint")}</p>
          </div>
          <button onClick={logoutAll} className="rounded-xl border-2 border-alert/40 text-alert text-sm font-semibold px-4 py-2 hover:bg-alert/5 cursor-pointer">
            {t("logoutAll")}
          </button>
        </section>

        {/* History */}
        <section className={card} id="history">
          <h2 className="font-serif text-lg font-semibold text-ink flex items-center gap-2">
            <History className="w-5 h-5 text-maroon" aria-hidden /> {t("historyTitle")}
          </h2>
          <p className="text-xs text-ink/55 mb-3">{t("historyIntro")}</p>
          <QuizHistory />
        </section>
      </div>
    </div>
  );
}
