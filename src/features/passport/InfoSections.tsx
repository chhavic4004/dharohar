import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, BadgeCheck, Camera, ChevronDown, QrCode, UserCheck } from "lucide-react";
import { Reveal } from "../../components/Reveal";
import type { PassportKey } from "../../i18n/pages/passport";
import { REGISTRY_STATS } from "./registry";
import { usePassportText } from "./usePassportText";

export function StatsStrip() {
  const { t, num } = usePassportText();
  const stats: { value: number; label: PassportKey }[] = [
    { value: REGISTRY_STATS.issued, label: "statIssued" },
    { value: REGISTRY_STATS.artisans, label: "statArtisans" },
    { value: REGISTRY_STATS.crafts, label: "statCrafts" },
    { value: REGISTRY_STATS.states, label: "statStates" },
  ];
  return (
    <section aria-label={t("statsLabel")} className="bg-maroon text-white print:hidden">
      <dl className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="font-serif text-3xl sm:text-4xl text-turmeric">{num(s.value)}</dd>
            <dt className="text-sm text-white/80 mt-1">{t(s.label)}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function HowItWorks() {
  const { t, num } = usePassportText();
  const steps: { icon: typeof UserCheck; title: PassportKey; desc: PassportKey }[] = [
    { icon: UserCheck, title: "how1Title", desc: "how1Desc" },
    { icon: Camera, title: "how2Title", desc: "how2Desc" },
    { icon: BadgeCheck, title: "how3Title", desc: "how3Desc" },
    { icon: QrCode, title: "how4Title", desc: "how4Desc" },
  ];
  return (
    <section aria-labelledby="passport-how-title" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 print:hidden">
      <Reveal className="text-center mb-10">
        <h2 id="passport-how-title" className="font-serif text-3xl text-maroon mb-3">
          {t("howTitle")}
        </h2>
        <p className="text-ink/70 max-w-2xl mx-auto">{t("howIntro")}</p>
      </Reveal>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="h-full">
              <Reveal delay={i * 80} className="h-full bg-white rounded-xl border border-maroon/15 p-5 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="w-11 h-11 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="font-serif text-3xl text-maroon/15" aria-hidden="true">
                    {num(i + 1)}
                  </span>
                </div>
                <h3 className="font-medium text-ink mb-1.5">{t(s.title)}</h3>
                <p className="text-sm text-ink/65">{t(s.desc)}</p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ArtisanCta() {
  const { t } = usePassportText();
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 print:hidden">
      <Reveal className="rounded-2xl bg-gradient-to-br from-terracotta to-maroon text-white p-8 sm:p-10 flex flex-col md:flex-row md:items-center gap-6 shadow-xl">
        <div className="flex-1">
          <h2 className="font-serif text-2xl sm:text-3xl mb-2">{t("ctaTitle")}</h2>
          <p className="text-white/85 max-w-xl">{t("ctaDesc")}</p>
        </div>
        <Link
          to="/preserve"
          className="inline-flex items-center justify-center gap-2 bg-white text-maroon font-medium px-6 py-3 rounded-lg hover:bg-parchment transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-maroon"
        >
          {t("ctaBtn")} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}

export function Faq() {
  const { t } = usePassportText();
  const [open, setOpen] = useState<number | null>(0);
  const items: [PassportKey, PassportKey][] = [
    ["faq1q", "faq1a"],
    ["faq2q", "faq2a"],
    ["faq3q", "faq3a"],
    ["faq4q", "faq4a"],
    ["faq5q", "faq5a"],
  ];
  return (
    <section aria-labelledby="passport-faq-title" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 print:hidden">
      <Reveal>
        <h2 id="passport-faq-title" className="font-serif text-3xl text-maroon mb-8 text-center">
          {t("faqTitle")}
        </h2>
        <div className="divide-y divide-maroon/15 border-y border-maroon/15">
          {items.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q}>
                <h3>
                  <button
                    type="button"
                    id={`passport-faq-q${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`passport-faq-a${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-4 text-start font-medium text-ink hover:text-maroon focus:outline-none focus-visible:text-maroon focus-visible:underline"
                  >
                    {t(q)}
                    <ChevronDown className={`w-5 h-5 shrink-0 text-maroon/60 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                </h3>
                <div id={`passport-faq-a${i}`} role="region" aria-labelledby={`passport-faq-q${i}`} hidden={!isOpen} className="pb-5 text-ink/70 text-sm leading-relaxed">
                  {t(a)}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
