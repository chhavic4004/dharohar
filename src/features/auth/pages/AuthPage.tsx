import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Eye, EyeOff, Heart, Smartphone } from "lucide-react";
import { PASSWORD_MIN_LENGTH, type AuthConfig, type AuthResponse, type VerificationStarted } from "@shared/auth-contract";
import { useSiteT } from "../../../i18n/site";
import { langDir, useLang } from "../../../lib/language";
import { showToast } from "../../../lib/toast";
import { authApi } from "../api";
import { useAuth } from "../AuthProvider";
import GoogleButton from "../components/GoogleButton";
import { CodeInput, DemoCodes, ErrorText, inputClass, ResendButton, SubmitButton } from "../components/OtpParts";
import { PersonaPicker } from "../components/PersonaPicker";
import type { Persona } from "../personas";

/** Only allow redirects back into this site. */
function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/login") ? raw : "/account";
}

type Step = "form" | "verify" | "forgot" | "reset" | "phone";

/**
 * /login: sign in, sign up (email + SMS codes), forgot password, and adding a
 * verified phone after Google sign-in. Query: ?mode=signup, ?step=phone, ?next=/somewhere
 */
export default function AuthPage() {
  const t = useSiteT();
  const lang = useLang();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { status, account, completeSignIn, setAccount, signOut } = useAuth();
  const mode = params.get("mode") === "signup" ? "signup" : "signin";
  const next = safeNext(params.get("next"));

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [step, setStep] = useState<Step>(params.get("step") === "phone" ? "phone" : "form");
  const [name, setName] = useState("");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const personaRef = useRef<HTMLFieldSetElement>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [started, setStarted] = useState<VerificationStarted | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi.config().then(setConfig).catch(() => setConfig({ googleClientId: null, passwordMinLength: PASSWORD_MIN_LENGTH }));
  }, []);

  const minLen = config?.passwordMinLength ?? PASSWORD_MIN_LENGTH;

  /** After any sign in: accounts without a verified phone add one before continuing. */
  const finish = useCallback(
    (res: AuthResponse) => {
      completeSignIn(res);
      if (!res.account.phoneVerified) {
        setStarted(null);
        setPhoneCode("");
        setStep("phone");
        return;
      }
      showToast(res.mergedGuestProgress ? t("mergedToast", { name: res.account.displayName }) : t("welcomeToast", { name: res.account.displayName }));
      navigate(next, { replace: true });
    },
    [completeSignIn, navigate, next, t],
  );

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = useCallback((credential: string) => void run(async () => finish(await authApi.google(credential))), [finish]);

  // Signed-in users only stay here to add their phone.
  if (status === "signedIn" && account?.phoneVerified && step !== "phone") return <Navigate to={next} replace />;
  if (status === "signedIn" && account && !account.phoneVerified && step !== "phone") setStep("phone");
  if (status === "guest" && step === "phone") return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;

  const setMode = (m: "signin" | "signup") => {
    const p = new URLSearchParams(params);
    if (m === "signup") p.set("mode", "signup");
    else p.delete("mode");
    p.delete("step");
    setParams(p, { replace: true });
    setStep("form");
    setError(null);
    setPersonaError(null);
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !persona) {
      setPersonaError(t("personaRequired"));
      personaRef.current?.focus();
      personaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    run(async () => {
      if (mode === "signin") return finish(await authApi.login(identifier, password));
      setStarted(await authApi.registerStart(email, phone, password, name, persona!));
      setEmailCode("");
      setPhoneCode("");
      setStep("verify");
    });
  };

  const submitVerify = (e: FormEvent) => {
    e.preventDefault();
    run(async () => finish(await authApi.registerVerify(started!.verificationId, emailCode, phoneCode)));
  };

  const submitForgot = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      setStarted(await authApi.forgotPassword(email || (identifier.includes("@") ? identifier : "")));
      setEmailCode("");
      setPassword("");
      setStep("reset");
    });
  };

  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      const res = await authApi.resetPassword(started!.verificationId, emailCode, password);
      showToast(t("passwordResetToast"));
      finish(res);
    });
  };

  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (!started) {
        setStarted(await authApi.phoneStart(phone));
        setPhoneCode("");
        return;
      }
      const a = await authApi.phoneVerify(started.verificationId, phoneCode);
      setAccount(a);
      showToast(t("phoneVerifiedToast"));
      navigate(next, { replace: true });
    });
  };

  const resend = (channel: "email" | "phone") => async () => {
    setError(null);
    try {
      const r = await authApi.resend(started!.verificationId, channel);
      setStarted((s) => (s ? { ...s, devCodes: { ...s.devCodes, ...r.devCodes } } : r));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const back = (to: Step) => (
    <button
      type="button"
      onClick={() => {
        setStep(to);
        setError(null);
      }}
      className="inline-flex items-center gap-1 text-xs font-semibold text-ink/60 hover:text-maroon cursor-pointer mb-4"
    >
      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden /> {to === "form" && mode === "signup" ? t("changeDetails") : t("backToSignIn")}
    </button>
  );

  const passwordField = (autoComplete: string, label = t("password")) => (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/70 mb-1.5">{label}</span>
      <span className="relative block">
        <input
          className={`${inputClass} pe-11`}
          type={show ? "text" : "password"}
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={autoComplete}
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
      {autoComplete === "new-password" && <span className="block text-[11px] text-ink/45 mt-1">{t("passwordHint", { n: minLen })}</span>}
    </label>
  );

  const phoneField = (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("phoneLabel")}</span>
      <input className={inputClass} type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <span className="block text-[11px] text-ink/45 mt-1">{t("phoneHint")}</span>
    </label>
  );

  // ─── Screens ────────────────────────────────────────────────────────────────

  const title =
    step === "verify" ? t("verifyTitle") : step === "forgot" || step === "reset" ? t("forgotTitle") : step === "phone" ? t("phoneTitle") : mode === "signup" ? t("authTitleSignUp") : t("authTitleSignIn");

  return (
    <div className="flex-1 bg-parchment px-4 py-10" dir={langDir(lang)}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          {step === "phone" ? <Smartphone className="w-8 h-8 text-maroon mx-auto mb-3" aria-hidden /> : <Heart className="w-8 h-8 text-terracotta fill-terracotta mx-auto mb-3" aria-hidden />}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">{title}</h1>
          {step === "form" && <p className="text-sm text-ink/60 mt-2">{t("authSubtitle")}</p>}
        </div>

        <div className="bg-white/85 rounded-2xl border border-maroon/10 shadow-sm p-6">
          {step === "form" && (
            <>
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

              <form onSubmit={submitForm} className="space-y-4" noValidate>
                {mode === "signup" ? (
                  <>
                    <PersonaPicker
                      ref={personaRef}
                      value={persona}
                      onChange={(p) => {
                        setPersona(p);
                        setPersonaError(null);
                      }}
                      error={personaError}
                    />
                    <label className="block">
                      <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("yourName")}</span>
                      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={40} required />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("email")}</span>
                      <input className={inputClass} type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                    </label>
                    {phoneField}
                    {passwordField("new-password")}
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("identifier")}</span>
                      <input className={inputClass} dir="ltr" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required />
                    </label>
                    {passwordField("current-password")}
                    <div className="text-end -mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(identifier.includes("@") ? identifier : "");
                          setStep("forgot");
                          setError(null);
                        }}
                        className="text-xs font-semibold text-maroon hover:text-terracotta cursor-pointer"
                      >
                        {t("forgotPassword")}
                      </button>
                    </div>
                  </>
                )}
                <ErrorText error={error} />
                <SubmitButton
                  busy={busy}
                  disabled={mode === "signup" ? name.trim().length < 2 || !email || phone.replace(/\D/g, "").length < 10 || password.length < minLen : !identifier || !password}
                >
                  {mode === "signup" ? t("sendCodes") : t("submitSignIn")}
                </SubmitButton>
              </form>
              <p className="text-[11px] text-ink/50 mt-4 text-center">{t("guestNote")}</p>
            </>
          )}

          {step === "verify" && started && (
            <form onSubmit={submitVerify} className="space-y-4" noValidate>
              {back("form")}
              <p className="text-sm text-ink/70">{t("verifyIntro", { email: started.sentTo.email ?? "", phone: started.sentTo.phone ?? "" })}</p>
              <DemoCodes started={started} />
              <div>
                <CodeInput label={t("emailCode")} value={emailCode} onChange={setEmailCode} autoFocus />
                <div className="text-end mt-1">
                  <ResendButton seconds={started.resendAfterSeconds} onResend={resend("email")} />
                </div>
              </div>
              <div>
                <CodeInput label={t("phoneCode")} value={phoneCode} onChange={setPhoneCode} />
                <div className="text-end mt-1">
                  <ResendButton seconds={started.resendAfterSeconds} onResend={resend("phone")} />
                </div>
              </div>
              <ErrorText error={error} />
              <SubmitButton busy={busy} disabled={emailCode.length !== 6 || phoneCode.length !== 6}>
                {t("verifyCreate")}
              </SubmitButton>
            </form>
          )}

          {step === "forgot" && (
            <form onSubmit={submitForgot} className="space-y-4" noValidate>
              {back("form")}
              <p className="text-sm text-ink/70">{t("forgotIntro")}</p>
              <label className="block">
                <span className="block text-xs font-semibold text-ink/70 mb-1.5">{t("email")}</span>
                <input className={inputClass} type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus required />
              </label>
              <ErrorText error={error} />
              <SubmitButton busy={busy} disabled={!email.includes("@")}>
                {t("sendCode")}
              </SubmitButton>
            </form>
          )}

          {step === "reset" && started && (
            <form onSubmit={submitReset} className="space-y-4" noValidate>
              {back("forgot")}
              <p className="text-sm text-ink/70">{t("resetIntro", { email: started.sentTo.email ?? "" })}</p>
              <DemoCodes started={started} />
              <div>
                <CodeInput label={t("codeLabel")} value={emailCode} onChange={setEmailCode} autoFocus />
                <div className="text-end mt-1">
                  <ResendButton seconds={started.resendAfterSeconds} onResend={resend("email")} />
                </div>
              </div>
              {passwordField("new-password", t("newPassword"))}
              <ErrorText error={error} />
              <SubmitButton busy={busy} disabled={emailCode.length !== 6 || password.length < minLen}>
                {t("resetSubmit")}
              </SubmitButton>
            </form>
          )}

          {step === "phone" && (
            <form onSubmit={submitPhone} className="space-y-4" noValidate>
              <p className="text-sm text-ink/70">{started ? t("phoneSent", { phone: started.sentTo.phone ?? "" }) : t("phoneIntro")}</p>
              {!started ? (
                phoneField
              ) : (
                <>
                  <DemoCodes started={started} />
                  <div>
                    <CodeInput label={t("phoneCode")} value={phoneCode} onChange={setPhoneCode} autoFocus />
                    <div className="flex justify-between mt-1">
                      <button type="button" onClick={() => setStarted(null)} className="text-xs font-semibold text-ink/60 hover:text-maroon cursor-pointer">
                        {t("changePhone")}
                      </button>
                      <ResendButton seconds={started.resendAfterSeconds} onResend={resend("phone")} />
                    </div>
                  </div>
                </>
              )}
              <ErrorText error={error} />
              <SubmitButton busy={busy} disabled={started ? phoneCode.length !== 6 : phone.replace(/\D/g, "").length < 10}>
                {started ? t("verify") : t("sendCode")}
              </SubmitButton>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  navigate("/", { replace: true });
                }}
                className="w-full text-xs text-ink/50 hover:text-maroon cursor-pointer"
              >
                {t("signOut")}
              </button>
            </form>
          )}
        </div>
        {step === "form" && <p className="text-[11px] text-ink/40 mt-4 text-center leading-relaxed">{t("termsNote")}</p>}
      </div>
    </div>
  );
}
