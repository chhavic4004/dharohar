import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { VerificationStarted } from "@shared/auth-contract";
import { useSiteT } from "../../../i18n/site";

export const inputClass =
  "w-full rounded-xl border border-maroon/25 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-2 focus:outline-maroon focus:border-transparent";

/** One 6 digit code field. Lets phones autofill SMS codes. */
export function CodeInput({ label, value, onChange, autoFocus }: { label: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/70 mb-1.5">{label}</span>
      <input
        className={`${inputClass} text-center font-mono text-xl tracking-[0.5em]`}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        dir="ltr"
        placeholder="000000"
        autoFocus={autoFocus}
        required
      />
    </label>
  );
}

/** "Resend" link that counts down before it can be used again. */
export function ResendButton({ seconds, onResend }: { seconds: number; onResend: () => Promise<void> }) {
  const t = useSiteT();
  const [left, setLeft] = useState(seconds);
  const [busy, setBusy] = useState(false);

  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  return (
    <button
      type="button"
      disabled={left > 0 || busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onResend();
          setLeft(seconds);
        } finally {
          setBusy(false);
        }
      }}
      className="text-xs font-semibold text-maroon hover:text-terracotta disabled:text-ink/40 cursor-pointer disabled:cursor-default inline-flex items-center gap-1"
    >
      {busy && <Loader2 className="w-3 h-3 animate-spin" aria-hidden />}
      {left > 0 ? t("resendIn", { s: left }) : t("resend")}
    </button>
  );
}

/** Shown only when the server has no email or SMS provider (development and demos). */
export function DemoCodes({ started }: { started: VerificationStarted | null }) {
  const t = useSiteT();
  const codes = started?.devCodes;
  if (!codes) return null;
  return (
    <div className="rounded-xl border border-turmeric/50 bg-turmeric/10 px-3 py-2.5 text-xs text-[#6b4a0e] space-y-1" role="note">
      <p>{t("demoCodes")}</p>
      {codes.email && <p className="font-mono font-semibold">{t("demoEmailCode", { c: codes.email })}</p>}
      {codes.phone && <p className="font-mono font-semibold">{t("demoPhoneCode", { c: codes.phone })}</p>}
    </div>
  );
}

export function SubmitButton({ busy, disabled, children }: { busy: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-maroon text-white font-semibold text-sm py-3.5 hover:bg-terracotta disabled:bg-ink/15 disabled:text-ink/40 cursor-pointer disabled:cursor-not-allowed"
    >
      {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ErrorText({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="text-sm text-alert bg-alert/10 border border-alert/20 rounded-lg px-3 py-2" role="alert">
      {error}
    </p>
  );
}
