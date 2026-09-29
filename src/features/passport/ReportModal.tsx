import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";
import { usePassportText } from "./usePassportText";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  passportId: string;
}

type Reason = "counterfeit" | "mismatch" | "tag" | "other";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ReportModal({ open, onClose, passportId }: ReportModalProps) {
  const { t, dir } = usePassportText();
  const [reason, setReason] = useState<Reason>("counterfeit");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("counterfeit");
      setDetails("");
      setEmail("");
      setTouched(false);
      setRef(null);
    }
  }, [open]);

  const detailsErr = details.trim().length < 10;
  const emailErr = email.trim() !== "" && !EMAIL.test(email.trim());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (detailsErr || emailErr) return;
    // Demo only: nothing leaves the browser.
    setRef(`RPT-${Date.now().toString(36).slice(-6).toUpperCase()}`);
  };

  const reasons: { value: Reason; label: string }[] = [
    { value: "counterfeit", label: t("reasonCounterfeit") },
    { value: "mismatch", label: t("reasonMismatch") },
    { value: "tag", label: t("reasonTag") },
    { value: "other", label: t("reasonOther") },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ref ? t("reportThanksTitle") : t("reportTitle")}
      titleId="passport-report-title"
      description={ref ? undefined : t("reportDesc")}
      closeLabel={t("close")}
      dir={dir}
    >
      {ref ? (
        <div className="text-center py-4" role="status">
          <CheckCircle2 className="w-14 h-14 text-heritage mx-auto mb-4" aria-hidden="true" />
          <p className="text-ink/80">{t("reportThanks", { ref })}</p>
          <p className="text-xs text-ink/50 mt-3">{t("reportDemo")}</p>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            className="mt-6 px-6 py-2.5 rounded-lg bg-maroon text-white font-medium hover:bg-terracotta transition-colors"
          >
            {t("done")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <p className="text-xs font-mono text-ink/60 bg-parchment rounded px-2 py-1 inline-block" dir="ltr">
            {t("reportAbout", { id: passportId })}
          </p>
          <fieldset>
            <legend className="text-sm font-medium text-ink mb-2">{t("reportReason")}</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {reasons.map((r, i) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-2 text-sm rounded-lg border px-3 py-2 cursor-pointer transition-colors ${reason === r.value ? "border-terracotta bg-terracotta/5 text-ink" : "border-maroon/15 text-ink/80 hover:bg-parchment/60"}`}
                >
                  <input
                    type="radio"
                    name="passport-report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-terracotta"
                    {...(i === 0 ? { "data-autofocus": true } : {})}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="passport-report-details" className="block text-sm font-medium text-ink mb-1">
              {t("reportDetails")}
            </label>
            <textarea
              id="passport-report-details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("reportDetailsHint")}
              aria-invalid={touched && detailsErr}
              aria-describedby={touched && detailsErr ? "passport-report-details-err" : undefined}
              className="w-full rounded-lg border border-maroon/25 bg-parchment/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta aria-[invalid=true]:border-alert"
            />
            {touched && detailsErr && (
              <p id="passport-report-details-err" className="text-xs text-alert mt-1">
                {t("errDetails")}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="passport-report-email" className="block text-sm font-medium text-ink mb-1">
              {t("reportEmail")}
            </label>
            <input
              id="passport-report-email"
              type="email"
              dir="ltr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={touched && emailErr}
              aria-describedby={touched && emailErr ? "passport-report-email-err" : "passport-report-email-hint"}
              className="w-full rounded-lg border border-maroon/25 bg-parchment/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta aria-[invalid=true]:border-alert"
            />
            {touched && emailErr ? (
              <p id="passport-report-email-err" className="text-xs text-alert mt-1">
                {t("errEmail")}
              </p>
            ) : (
              <p id="passport-report-email-hint" className="text-xs text-ink/50 mt-1">
                {t("reportEmailHint")}
              </p>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-maroon/20 text-maroon text-sm font-medium hover:bg-parchment">
              {t("cancel")}
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-maroon transition-colors">
              {t("reportSubmit")}
            </button>
          </div>
          <p className="text-[11px] text-ink/45 text-center sm:text-end">{t("reportDemo")}</p>
        </form>
      )}
    </Modal>
  );
}
