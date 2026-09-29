import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { AlertTriangle, Flag, Loader2, QrCode, Search, SearchX, ShieldCheck } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { Certificate } from "../features/passport/Certificate";
import { ArtisanCta, Faq, HowItWorks, StatsStrip } from "../features/passport/InfoSections";
import { ReportModal } from "../features/passport/ReportModal";
import { ScanModal } from "../features/passport/ScanModal";
import { FEATURED_ID, REGISTRY, findPassport, isValidId, normalizeId } from "../features/passport/registry";
import { usePassportText } from "../features/passport/usePassportText";

/** Print only the certificate: hide the site chrome and everything else on the page. */
const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  #passport-print, #passport-print * { visibility: visible !important; }
  #passport-print { position: absolute; inset: 0 auto auto 0; width: 100%; padding: 0 12mm; }
  @page { margin: 12mm 0; }
}`;

export default function Passport() {
  const { t, dir, d } = usePassportText();
  const [params, setParams] = useSearchParams();
  const paramId = params.get("id");

  const [input, setInput] = useState(paramId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(!!paramId);
  const [scanOpen, setScanOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Keep the search box in sync with the URL (back/forward, shared links, QR scans).
  useEffect(() => {
    setInput(paramId ?? "");
    setError(null);
    if (!paramId) return;
    setChecking(true);
    const id = window.setTimeout(() => setChecking(false), 450);
    return () => window.clearTimeout(id);
  }, [paramId]);

  const lookup = useMemo(() => {
    if (!paramId) return { kind: "found" as const, id: FEATURED_ID, record: findPassport(FEATURED_ID)!, featured: true };
    const id = normalizeId(paramId);
    if (!isValidId(id)) return { kind: "invalid" as const, id };
    const record = findPassport(id);
    return record ? { kind: "found" as const, id, record, featured: false } : { kind: "notfound" as const, id };
  }, [paramId]);

  const go = useCallback(
    (raw: string) => {
      const id = normalizeId(raw);
      if (!id) {
        setError(t("errEmpty"));
        return;
      }
      if (!isValidId(id)) {
        setInput(raw);
        setError(t("errInvalid"));
        return;
      }
      setError(null);
      if (id === paramId) {
        // Same ID again: still show the check so the click feels acknowledged.
        setInput(id);
        setChecking(true);
        window.setTimeout(() => setChecking(false), 450);
        return;
      }
      const next = new URLSearchParams(params);
      next.set("id", id);
      setParams(next);
    },
    [params, paramId, setParams, t],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go(input);
  };

  const onScan = useCallback(
    (raw: string) => {
      setScanOpen(false);
      go(raw);
    },
    [go],
  );

  const shareId = lookup.kind === "found" ? lookup.record.id : lookup.id;
  const shareUrl =
    typeof window === "undefined" ? `/passport?id=${shareId}` : `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(shareId)}`;

  return (
    <div dir={dir} className="flex-1 bg-parchment">
      <style>{PRINT_CSS}</style>

      {/* Hero + search */}
      <section className="relative overflow-hidden border-b border-maroon/15 print:hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-maroon) 1px, transparent 0)", backgroundSize: "18px 18px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-terracotta mb-4">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> {t("eyebrow")}
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl text-maroon mb-4">{t("title")}</h1>
            <p className="text-ink/70 max-w-2xl mx-auto">{t("intro")}</p>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={onSubmit} role="search" className="mt-8 text-start" noValidate>
              <label htmlFor="passport-id-input" className="block text-sm font-medium text-ink mb-2">
                {t("searchLabel")}
              </label>
              <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-xl border border-maroon/20 shadow-lg card-shadow">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/35 pointer-events-none" aria-hidden="true" />
                  <input
                    id="passport-id-input"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={t("searchPlaceholder")}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby={error ? "passport-id-error" : "passport-id-hint"}
                    className="w-full ps-10 pe-3 py-3 rounded-lg bg-transparent font-mono text-base uppercase placeholder:normal-case placeholder:font-sans text-ink focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScanOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-maroon/20 text-maroon font-medium hover:bg-parchment transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  >
                    <QrCode className="w-5 h-5" aria-hidden="true" /> {t("scanBtn")}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-terracotta text-white font-medium hover:bg-maroon transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta"
                  >
                    {t("verifyBtn")}
                  </button>
                </div>
              </div>
              {error ? (
                <p id="passport-id-error" role="alert" className="mt-2 text-sm text-alert flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" /> {error}
                </p>
              ) : (
                <p id="passport-id-hint" className="mt-2 text-xs text-ink/55">
                  {t("searchHint")}
                </p>
              )}
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-ink/55">{t("tryDemo")}</span>
              {REGISTRY.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => go(p.id)}
                  title={d(p.code, "craft")}
                  aria-label={`${p.id} · ${d(p.code, "craft")}`}
                  dir="ltr"
                  className={`font-mono px-2.5 py-1 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
                    lookup.kind === "found" && !lookup.featured && lookup.record.id === p.id
                      ? "bg-maroon text-white border-maroon"
                      : "bg-white/70 border-maroon/20 text-maroon hover:bg-white"
                  }`}
                >
                  {p.id}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-ink/45">{t("demoNote")}</p>
          </Reveal>
        </div>
      </section>

      {/* Result */}
      <section aria-live="polite" aria-busy={checking} className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12 print:p-0 print:max-w-none">
        {checking ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink/60">
            <Loader2 className="w-8 h-8 animate-spin text-terracotta" aria-hidden="true" />
            <p>{t("checking")}</p>
          </div>
        ) : lookup.kind === "found" ? (
          <Certificate key={lookup.record.id} record={lookup.record} shareUrl={shareUrl} featured={lookup.featured} onReport={() => setReportOpen(true)} />
        ) : (
          <div className="max-w-xl mx-auto text-center bg-white rounded-2xl border border-maroon/15 p-8 sm:p-10 card-shadow">
            {lookup.kind === "invalid" ? (
              <>
                <AlertTriangle className="w-12 h-12 text-turmeric mx-auto mb-4" aria-hidden="true" />
                <p className="text-ink/75">{t("errInvalid")}</p>
              </>
            ) : (
              <>
                <SearchX className="w-12 h-12 text-alert mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-serif text-2xl text-maroon mb-2">{t("notFoundTitle")}</h2>
                {/* FSI/PDI isolate the Latin ID inside RTL text. */}
                <p className="text-ink/70">{t("notFoundDesc", { id: `⁨${lookup.id}⁩` })}</p>
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 border border-alert/30 text-alert px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-alert/5 transition-colors"
                >
                  <Flag className="w-4 h-4" aria-hidden="true" /> {t("actionReport")}
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <StatsStrip />
      <HowItWorks />
      <ArtisanCta />
      <Faq />

      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} onResult={onScan} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} passportId={shareId} />
    </div>
  );
}
