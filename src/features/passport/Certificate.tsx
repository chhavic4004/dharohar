import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  AudioLines,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Fingerprint,
  Flag,
  Hammer,
  KeyRound,
  Leaf,
  Loader2,
  MapPin,
  Package,
  Pause,
  Play,
  Printer,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Store,
  XCircle,
} from "lucide-react";
import type { PassportRecord, PassportStatus, TimelineStep } from "./registry";
import { waveform } from "./registry";
import { usePassportText } from "./usePassportText";
import type { PassportKey } from "../../i18n/pages/passport";

type Tab = "overview" | "provenance" | "custody" | "audio" | "signature";
const TABS: { id: Tab; label: PassportKey }[] = [
  { id: "overview", label: "tabOverview" },
  { id: "provenance", label: "tabProvenance" },
  { id: "custody", label: "tabCustody" },
  { id: "audio", label: "tabAudio" },
  { id: "signature", label: "tabSignature" },
];

const STATUS_STYLE: Record<PassportStatus, { box: string; icon: typeof ShieldCheck; title: PassportKey; desc: PassportKey; chip: string }> = {
  verified: { box: "bg-heritage/10 border-heritage/30 text-heritage", icon: ShieldCheck, title: "statusVerified", desc: "statusVerifiedDesc", chip: "bg-heritage text-white" },
  pending: { box: "bg-turmeric/10 border-turmeric/40 text-turmeric", icon: ShieldAlert, title: "statusPending", desc: "statusPendingDesc", chip: "bg-turmeric text-ink" },
  revoked: { box: "bg-alert/10 border-alert/30 text-alert", icon: ShieldX, title: "statusRevoked", desc: "statusRevokedDesc", chip: "bg-alert text-white" },
};

const STEP_META: Record<TimelineStep, { label: PassportKey; icon: typeof Leaf }> = {
  sourced: { label: "stepSourced", icon: Leaf },
  made: { label: "stepMade", icon: Hammer },
  qc: { label: "stepQc", icon: BadgeCheck },
  certified: { label: "stepCertified", icon: ShieldCheck },
  sold: { label: "stepSold", icon: Store },
  revoked: { label: "stepRevoked", icon: XCircle },
};

interface CertificateProps {
  record: PassportRecord;
  shareUrl: string;
  featured: boolean;
  onReport: () => void;
}

export function Certificate({ record, shareUrl, featured, onReport }: CertificateProps) {
  const { t, d, dir, fmtDate, num } = usePassportText();
  const [tab, setTab] = useState<Tab>("overview");
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ overview: null, provenance: null, custody: null, audio: null, signature: null });
  const s = STATUS_STYLE[record.status];
  const StatusIcon = s.icon;
  const c = record.code;

  useEffect(() => {
    if (copied === "idle") return;
    const id = window.setTimeout(() => setCopied("idle"), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (!ok) throw new Error("copy failed");
      }
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next = -1;
    if (e.key === forward) next = (index + 1) % TABS.length;
    else if (e.key === back) next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = TABS[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  const trustColor = record.trustScore >= 85 ? "bg-heritage" : record.trustScore >= 50 ? "bg-turmeric" : "bg-alert";
  const today = fmtDate(new Date().toISOString().slice(0, 10));

  return (
    <article id="passport-print" aria-labelledby="passport-cert-title" className="space-y-4">
      {featured && <p className="text-center text-xs text-ink/55 print:hidden">{t("featured")}</p>}

      {/* Status banner */}
      <div role="status" className={`rounded-xl border p-4 sm:p-5 flex gap-3 sm:gap-4 items-start ${s.box}`}>
        <StatusIcon className="w-7 h-7 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-serif text-lg sm:text-xl leading-tight">{t(s.title)}</p>
          <p className="text-sm text-ink/75 mt-1">{t(s.desc)}</p>
          {record.status === "revoked" && record.revokedOn && (
            <div className="mt-3 text-sm text-ink/80 space-y-1">
              <p className="font-medium text-alert">{t("revokedOn", { date: fmtDate(record.revokedOn) })}</p>
              <p>
                <span className="font-medium">{t("reasonLabel")}: </span>
                {d(c, "reason")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl card-shadow border border-maroon/20 overflow-hidden print:shadow-none print:border-ink/30">
        <div className="flex flex-col md:flex-row">
          {/* Object panel */}
          <div className={`relative w-full md:w-2/5 min-h-[240px] md:min-h-[360px] bg-gradient-to-br ${record.accent} print:min-h-[180px]`}>
            {record.image ? (
              <img src={record.image} alt={d(c, "imgAlt")} className="absolute inset-0 w-full h-full object-cover opacity-85" loading="lazy" />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, rgba(255,255,255,.2) 0 2px, transparent 2px 14px)",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <div className="absolute bottom-5 inset-x-5 text-white">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded px-2.5 py-1 text-xs font-medium mb-3">
                <BadgeCheck className="w-3.5 h-3.5" /> {t("giRegistered")} · <span dir="ltr">{t("giNo", { n: record.giNo })}</span>
              </span>
              <h2 id="passport-cert-title" className="font-serif text-2xl sm:text-3xl mb-1">
                {d(c, "craft")}
              </h2>
              <p className="text-white/85 text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {d(c, "origin")}
              </p>
            </div>
          </div>

          {/* Identity panel */}
          <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-ink/50 mb-1">{t("idLabel")}</div>
                <div className="font-mono text-base sm:text-lg text-ink break-all" dir="ltr">
                  {record.id}
                </div>
                <span className={`inline-flex items-center gap-1 mt-2 text-xs font-medium rounded-full px-2.5 py-0.5 ${s.chip}`}>
                  <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" /> {t(s.title)}
                </span>
              </div>
              <div className="text-center shrink-0">
                <div className="p-2 rounded-lg border border-maroon/20 bg-parchment/50">
                  <QrCode className="w-14 h-14 text-maroon" aria-hidden="true" />
                </div>
                <div className="text-[10px] text-ink/50 mt-1 max-w-[80px]">{t("scanToVerify")}</div>
              </div>
            </div>

            {/* Artisan */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-parchment/60 border border-maroon/10">
              <div
                aria-hidden="true"
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${record.accent} text-white font-serif text-xl flex items-center justify-center shrink-0 ring-2 ring-white shadow`}
              >
                {record.initials}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-ink/50">{t("artisan")}</div>
                <div className="font-medium text-ink text-lg leading-tight">{d(c, "artisan")}</div>
                <div className="text-sm text-ink/65">
                  {d(c, "cluster")} · {t("yearsPractice", { n: num(record.yearsOfPractice) })}
                </div>
              </div>
            </div>

            {/* Trust score */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span id="passport-trust-label" className="text-sm font-medium text-ink">
                  {t("trustScore")}
                </span>
                <span className="font-serif text-2xl text-ink">
                  {num(record.trustScore)}
                  <span className="text-sm text-ink/45">/{num(100)}</span>
                </span>
              </div>
              <div
                role="meter"
                aria-labelledby="passport-trust-label"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={record.trustScore}
                className="h-2.5 rounded-full bg-ink/10 overflow-hidden"
              >
                <div className={`h-full rounded-full ${trustColor} transition-[width] duration-700`} style={{ width: `${record.trustScore}%` }} />
              </div>
              <p className="text-xs text-ink/55 mt-1.5">{t("trustHint")}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 mt-auto print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 bg-terracotta text-white py-2.5 px-3 rounded-lg font-medium hover:bg-maroon transition-colors flex justify-center items-center gap-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-terracotta"
              >
                <Printer className="w-4 h-4" /> {t("actionPrint")}
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 bg-parchment border border-maroon/20 text-maroon py-2.5 px-3 rounded-lg font-medium hover:bg-parchment/70 transition-colors flex justify-center items-center gap-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                {copied === "ok" ? <Check className="w-4 h-4 text-heritage" /> : <Copy className="w-4 h-4" />}
                {copied === "ok" ? t("actionCopied") : copied === "fail" ? t("actionCopyFailed") : t("actionShare")}
              </button>
              <button
                type="button"
                onClick={onReport}
                className="flex-1 border border-alert/30 text-alert py-2.5 px-3 rounded-lg font-medium hover:bg-alert/5 transition-colors flex justify-center items-center gap-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-alert"
              >
                <Flag className="w-4 h-4" /> {t("actionReport")}
              </button>
            </div>
            <span className="sr-only" aria-live="polite">
              {copied === "ok" ? t("actionCopied") : copied === "fail" ? t("actionCopyFailed") : ""}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-maroon/15">
          <div role="tablist" aria-label={t("tabsLabel")} className="flex overflow-x-auto px-2 sm:px-4 bg-parchment/40 print:hidden">
            {TABS.map((tb, i) => (
              <button
                key={tb.id}
                ref={(el) => {
                  tabRefs.current[tb.id] = el;
                }}
                role="tab"
                id={`passport-tab-${tb.id}`}
                aria-selected={tab === tb.id}
                aria-controls={`passport-panel-${tb.id}`}
                tabIndex={tab === tb.id ? 0 : -1}
                onClick={() => setTab(tb.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`whitespace-nowrap px-3 sm:px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors focus:outline-none focus-visible:bg-white ${
                  tab === tb.id ? "border-terracotta text-maroon" : "border-transparent text-ink/60 hover:text-maroon"
                }`}
              >
                {t(tb.label)}
              </button>
            ))}
          </div>

          <Panel id="overview" active={tab} print>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <Fact label={t("object")} wide>
                {d(c, "object")}
              </Fact>
              <Fact label={t("origin")}>{d(c, "origin")}</Fact>
              <Fact label={t("cluster")}>{d(c, "cluster")}</Fact>
              <Fact label={t("technique")}>{d(c, "technique")}</Fact>
              <Fact label={t("material")}>{d(c, "materials")}</Fact>
              <Fact label={t("timeToCraft")}>{t("days", { n: num(record.craftDays) })}</Fact>
              <Fact label={record.status === "pending" ? t("registeredOn") : t("issued")}>{fmtDate(record.issued)}</Fact>
              <Fact label={t("issuer")}>{t("issuerName")}</Fact>
              <Fact label={t("giRegistered")}>
                <span dir="ltr">{t("giNo", { n: record.giNo })}</span>
              </Fact>
            </dl>
          </Panel>

          <Panel id="provenance" active={tab} print>
            <PanelTitle>{t("tabProvenance")}</PanelTitle>
            <p className="text-sm text-ink/65 mb-6">{t("provenanceIntro")}</p>
            <Timeline record={record} />
          </Panel>

          <Panel id="custody" active={tab} print>
            <PanelTitle>{t("tabCustody")}</PanelTitle>
            <p className="text-sm text-ink/65 mb-6">{t("custodyIntro")}</p>
            <Custody record={record} />
          </Panel>

          <Panel id="audio" active={tab}>
            <AudioStory key={record.id} record={record} />
          </Panel>

          <Panel id="signature" active={tab} print>
            <PanelTitle>{t("tabSignature")}</PanelTitle>
            <SignatureCheck key={record.id} record={record} />
          </Panel>
        </div>
      </div>

      <p className="hidden print:block text-[10px] text-ink/60 text-center pt-2">{t("printedFrom", { date: today, url: shareUrl })}</p>
    </article>
  );
}

function Panel({ id, active, print, children }: { id: Tab; active: Tab; print?: boolean; children: ReactNode }) {
  const shown = id === active;
  return (
    <div
      role="tabpanel"
      id={`passport-panel-${id}`}
      aria-labelledby={`passport-tab-${id}`}
      tabIndex={0}
      className={`p-6 sm:p-8 focus:outline-none ${shown ? "block" : "hidden"} ${print ? "print:block print:break-inside-avoid print:py-4" : "print:hidden"}`}
    >
      {children}
    </div>
  );
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-serif text-xl text-maroon mb-1">{children}</h3>;
}

function Fact({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-[11px] uppercase tracking-wider text-ink/50 mb-1">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

function Timeline({ record }: { record: PassportRecord }) {
  const { t, actor, fmtDate } = usePassportText();
  return (
    <ol className="relative">
      {record.timeline.map((ev, i) => {
        const meta = STEP_META[ev.step];
        const Icon = meta.icon;
        const done = !!ev.date;
        const revoked = ev.step === "revoked";
        const last = i === record.timeline.length - 1;
        return (
          <li key={ev.step} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && <span aria-hidden="true" className={`absolute top-10 bottom-0 start-[19px] w-0.5 ${done ? "bg-heritage/40" : "bg-ink/10"}`} />}
            <span
              aria-hidden="true"
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                revoked ? "bg-alert text-white border-alert" : done ? "bg-heritage text-white border-heritage" : "bg-white text-ink/35 border-ink/20 border-dashed"
              }`}
            >
              {done ? <Icon className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </span>
            <div className="pt-1.5 min-w-0">
              <p className={`font-medium ${revoked ? "text-alert" : done ? "text-ink" : "text-ink/50"}`}>{t(meta.label)}</p>
              <p className="text-sm text-ink/60">
                {done ? <time dateTime={ev.date}>{fmtDate(ev.date!)}</time> : t("awaiting")} · {t("byActor", { actor: actor(record.code, ev.actor) })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Custody({ record }: { record: PassportRecord }) {
  const { t, actor, fmtDate } = usePassportText();
  const kindLabel = { consignment: t("kindConsignment"), sale: t("kindSale"), handover: t("kindHandover") } as const;
  const holder = record.custody[record.custody.length - 1]?.to ?? "artisan";
  return (
    <div className="space-y-3">
      {record.custody.map((ev, i) => (
        <div key={i} className="rounded-xl border border-maroon/15 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-ink/55 sm:w-36 shrink-0">
            <Package className="w-4 h-4 text-terracotta" aria-hidden="true" />
            <span>
              <time dateTime={ev.date}>{fmtDate(ev.date)}</time>
              <br />
              <span className="font-medium text-ink/75">{kindLabel[ev.kind]}</span>
            </span>
          </div>
          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-ink/45">{t("custodyFrom")}</div>
              <div className="text-sm font-medium text-ink truncate" title={actor(record.code, ev.from)}>
                {actor(record.code, ev.from)}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-maroon/50 rtl:rotate-180" aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-ink/45">{t("custodyTo")}</div>
              <div className="text-sm font-medium text-ink truncate" title={actor(record.code, ev.to)}>
                {actor(record.code, ev.to)}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-xl bg-parchment/70 border border-maroon/10 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-heritage shrink-0" aria-hidden="true" />
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink/50">{t("currentHolder")}</div>
          <div className="font-medium text-ink">{actor(record.code, holder)}</div>
        </div>
      </div>
    </div>
  );
}

function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AudioStory({ record }: { record: PassportRecord }) {
  const { t, d } = usePassportText();
  const bars = useMemo(() => waveform(record.id, 72), [record.id]);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const total = record.audioSeconds;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPos((p) => {
        if (p + 0.25 >= total) {
          setPlaying(false);
          return 0;
        }
        return p + 0.25;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const progress = pos / total;
  return (
    <div className="grid md:grid-cols-[1fr_16rem] gap-6">
      <div>
        <PanelTitle>{t("audioTitle")}</PanelTitle>
        <p className="text-sm text-ink/60 mb-5">{t("audioDialect", { lang: d(record.code, "dialect") })}</p>

        <div className="rounded-xl bg-ink text-white p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              aria-label={playing ? t("pause") : t("play")}
              className="w-12 h-12 rounded-full bg-turmeric text-ink flex items-center justify-center shrink-0 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-turmeric focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ms-0.5" />}
            </button>
            <div className="flex-1 min-w-0" dir="ltr">
              <div className="flex items-center gap-[2px] h-14" aria-hidden="true">
                {bars.map((h, i) => {
                  const on = i / bars.length < progress;
                  return (
                    <span
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${on ? "bg-turmeric" : "bg-white/25"} ${playing && Math.abs(i / bars.length - progress) < 0.03 ? "animate-pulse" : ""}`}
                      style={{ height: `${Math.round(h * 100)}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] font-mono text-white/60 mt-1">
                <span>{fmtTime(pos)}</span>
                <span>{fmtTime(total)}</span>
              </div>
            </div>
          </div>
          <p className="flex items-center gap-2 text-[11px] text-white/55 mt-3">
            <AudioLines className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {t("audioDemo")}
          </p>
        </div>
      </div>
      <aside className="rounded-xl border border-turmeric/30 bg-turmeric/10 p-4 text-sm space-y-3 self-start">
        <p className="font-medium text-ink">{t("transcript")}</p>
        <p className="text-ink/75 italic">“{d(record.code, "story")}”</p>
        <p className="text-xs text-ink/55 border-t border-turmeric/30 pt-3">{t("audioWatermark", { id: record.id })}</p>
      </aside>
    </div>
  );
}

const SIG_STEPS: PassportKey[] = ["sigStep1", "sigStep2", "sigStep3", "sigStep4"];

function SignatureCheck({ record }: { record: PassportRecord }) {
  const { t, fmtDate } = usePassportText();
  // -1 idle, 0..3 running step, 4 done
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (step < 0 || step >= SIG_STEPS.length) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 550);
    return () => window.clearTimeout(id);
  }, [step]);

  const done = step >= SIG_STEPS.length;
  const running = step >= 0 && !done;
  const certified = record.timeline.find((e) => e.step === "certified")?.date ?? record.issued;
  const groups = record.fingerprint.match(/.{1,4}/g) ?? [];
  const result =
    record.status === "verified"
      ? { cls: "bg-heritage/10 border-heritage/30 text-heritage", icon: CheckCircle2, text: t("sigValid") }
      : record.status === "pending"
        ? { cls: "bg-turmeric/10 border-turmeric/40 text-turmeric", icon: AlertTriangle, text: t("sigPending") }
        : { cls: "bg-alert/10 border-alert/30 text-alert", icon: ShieldX, text: t("sigRevoked") };
  const ResultIcon = result.icon;

  return (
    <div>
      <p className="text-sm text-ink/65 mb-6">{t("sigIntro")}</p>
      <dl className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="rounded-lg bg-parchment/60 p-3">
          <dt className="text-[11px] uppercase tracking-wider text-ink/50 mb-1">{t("algorithm")}</dt>
          <dd className="font-mono text-sm text-ink" dir="ltr">
            Ed25519 · SHA-256
          </dd>
        </div>
        <div className="rounded-lg bg-parchment/60 p-3">
          <dt className="text-[11px] uppercase tracking-wider text-ink/50 mb-1 flex items-center gap-1">
            <KeyRound className="w-3 h-3" aria-hidden="true" /> {t("keyId")}
          </dt>
          <dd className="font-mono text-sm text-ink" dir="ltr">
            {record.keyId}
          </dd>
        </div>
        <div className="rounded-lg bg-parchment/60 p-3">
          <dt className="text-[11px] uppercase tracking-wider text-ink/50 mb-1">{t("signedOn")}</dt>
          <dd className="text-sm text-ink">{fmtDate(certified)}</dd>
        </div>
      </dl>
      <div className="rounded-lg border border-maroon/15 p-4 mb-6">
        <div className="text-[11px] uppercase tracking-wider text-ink/50 mb-2 flex items-center gap-1">
          <Fingerprint className="w-3.5 h-3.5" aria-hidden="true" /> {t("fingerprint")}
        </div>
        <code className="block font-mono text-xs sm:text-sm text-ink/85 break-all leading-relaxed" dir="ltr">
          {groups.join(" ")}
        </code>
      </div>

      <div className="print:hidden">
        <button
          type="button"
          onClick={() => setStep(0)}
          disabled={running}
          className="inline-flex items-center gap-2 bg-maroon text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-terracotta transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-maroon"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {done ? t("reverify") : t("verifySig")}
        </button>

        {step >= 0 && (
          <ul className="mt-5 space-y-2" aria-live="polite">
            {SIG_STEPS.map((k, i) => {
              const state = i < step ? "done" : i === step ? "run" : "wait";
              return (
                <li key={k} className={`flex items-center gap-2 text-sm ${state === "wait" ? "text-ink/35" : "text-ink/80"}`}>
                  {state === "done" ? (
                    <Check className="w-4 h-4 text-heritage" aria-hidden="true" />
                  ) : state === "run" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-terracotta" aria-hidden="true" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-ink/20" aria-hidden="true" />
                  )}
                  {t(k)}
                </li>
              );
            })}
          </ul>
        )}

        {done && (
          <div role="status" className={`mt-5 rounded-xl border p-4 flex gap-3 items-start ${result.cls}`}>
            <ResultIcon className="w-6 h-6 shrink-0" aria-hidden="true" />
            <p className="text-sm text-ink/85">{result.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
