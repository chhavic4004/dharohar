import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { PASSWORD_MIN_LENGTH, type AuthConfig, type AuthResponse } from "@shared/auth-contract";
import { useSiteT } from "../../../i18n/site";
import { langDir, useLang } from "../../../lib/language";
import { showToast } from "../../../lib/toast";
import { authApi } from "../api";
import { useAuth } from "../AuthProvider";
import GoogleButton from "../components/GoogleButton";

/** Only allow redirects back into this site. */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
}

const input =
  "w-full rounded-xl border border-maroon/25 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-2 focus:outline-maroon focus:border-transparent";

/** Sign in and sign up: /login (add ?mode=signup and ?next=/somewhere). */
export default function AuthPage() {
  const t = useSiteT();
  const lang = useLang();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { status, completeSignIn } = useAuth();
  const mode = params.get("mode") === "signup" ? "signup" : "signin";
  const next = safeNext(params.get("next"));

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi.config().then(setConfig).catch(() => setConfig({ googleClientId: null, passwordMinLength: PASSWORD_MIN_LENGTH }));
  }, []);

  const finish = useCallback(
    (res: AuthResponse) => {
      completeSignIn(res);
      showToast(res.mergedGuestProgress ? t("mergedToast", { name: res.account.displayName }) : t("welcomeToast", { name: res.account.displayName }));
      navigate(next, { replace: true });
    },
    [completeSignIn, navigate, next, t],
  );

  const onGoogle = useCallback(
    async (credential: string) => {
      setBusy(true);
      setError(null);
      try {
        finish(await authApi.google(credential));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [finish],
  );

  if (status === "signedIn") return <Navigate to={next} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      finish(mode === "signup" ? await authApi.register(email, password, name) : await authApi.login(email, password));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const setMode = (m: "signin" | "signup") => {
    const p = new URLSearchParams(params);
    if (m === "signup") p.set("mode", "signup");
    else p.delete("mode");
    setParams(p, { replace: true });
    setError(null);
  };

  const minLen = config?.passwordMinLength ?? PASSWORD_MIN_LENGTH;

  return (
    <div className="flex-1 bg-parchment px-4 py-10" dir={langDir(lang)}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Heart className="w-8 h-8 text-terracotta fill-terracotta mx-auto mb-3" aria-hidden />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">{mode === "signup" ? t("authTitleSignUp") : t("authTitleSignIn")}</h1>
          <p className="text-sm text-ink/60 mt-2">{t("authSubtitle")}</p>
        </div>

        <div className="bg-white/85 rounded-2xl border border-maroon/10 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-maroon/5 mb-6" role="tablist">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-full py-2 text-sm font-semibold transition-colors cursor-pointer ${mode === m ? "bg-maroon text-white shadow" : "text-maroon hover:bg-maroon/10"}`}
              >
                {m === "signin" ? t("tabSignIn") : t("tabSignUp")}
              </button>
            ))}
          </div>

          {config?.googleClientId ? (
            <>
              <GoogleButton clientId={config.googleClientId} onCredential={onGoogle} />
              <div className="flex items-center gap-3 my-5 text-xs text-ink/40" aria-hidden>
                <span className="h-px flex-1 bg-maroon/15" /> {t("orDivider")} <span className="h-px flex-1 bg-maroon/15" />
              </div>
            </>
          ) : (
            config && <p className="text-[11px] text-ink/45 text-center mb-4">{t("googleUnavailable")}</p>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <label className="block">
                <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("yourName")}</span>
                <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={40} required />
              </label>
            )}
            <label className="block">
              <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("email")}</span>
              <input className={input} type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("password")}</span>
              <span className="relative block">
                <input
                  className={`${input} pe-11`}
                  type={show ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={mode === "signup" ? minLen : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute inset-y-0 end-0 px-3 text-ink/50 hover:text-maroon cursor-pointer"
                  aria-label={show ? t("hidePassword") : t("showPassword")}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
              {mode === "signup" && <span className="block text-[11px] text-ink/45 mt-1">{t("passwordHint", { n: minLen })}</span>}
            </label>

            {error && (
              <p className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-lg px-3 py-2" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !email || !password || (mode === "signup" && (name.trim().length < 2 || password.length < minLen))}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-maroon text-white font-semibold text-sm py-3.5 hover:bg-terracotta disabled:bg-ink/15 disabled:text-ink/40 cursor-pointer disabled:cursor-not-allowed"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              {mode === "signup" ? t("submitSignUp") : t("submitSignIn")}
            </button>
          </form>

          <p className="text-[11px] text-ink/50 mt-4 text-center">{t("guestNote")}</p>
        </div>
        <p className="text-[11px] text-ink/40 mt-4 text-center leading-relaxed">
          {t("termsNote")}
        </p>
      </div>
    </div>
  );
}
