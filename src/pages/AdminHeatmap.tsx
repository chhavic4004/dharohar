import { AlertTriangle, Users, TrendingDown, Send, BarChart } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { usePageText } from "../i18n/page";
import { adminHeatmapText } from "../i18n/pages/adminHeatmap";

export default function AdminHeatmap() {
  const { t, dir, locale } = usePageText(adminHeatmapText);
  const num = (n: number) => new Intl.NumberFormat(locale).format(n);
  const pct = (n: number, sign = false) => new Intl.NumberFormat(locale, { style: "percent", signDisplay: sign ? "exceptZero" : "auto" }).format(n / 100);
  return (
    <div className="flex-1 bg-[#1a1516] text-parchment py-8" dir={dir}>
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col">
        <Reveal className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <div className="text-turmeric text-sm font-medium tracking-wide uppercase mb-2 flex items-center gap-2">
              <ShieldIcon className="w-4 h-4" /> {t("badge")}
            </div>
            <h1 className="font-serif text-3xl mb-1">{t("title")}</h1>
            <p className="text-parchment/60 text-sm">{t("subtitle")}</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button className="bg-white/5 border border-white/10 px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors">{t("exportCsv")}</button>
            <button className="bg-turmeric text-ink px-4 py-2 rounded text-sm font-medium hover:bg-parchment transition-colors">{t("printReport")}</button>
          </div>
        </Reveal>

        <Reveal delay={100} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1">
          {/* Heatmap Area */}
          <div className="lg:col-span-2 bg-[#241b1d] border border-parchment/10 rounded-xl p-1 relative overflow-hidden flex flex-col min-h-[360px]">
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-3">
              <h3 className="text-sm font-medium mb-2">{t("riskTitle")}</h3>
              <div className="flex items-center gap-2 text-xs text-parchment/70">
                <span className="w-3 h-3 bg-alert rounded-sm" /> {t("legendUrgent", { a: num(30) })}
              </div>
              <div className="flex items-center gap-2 text-xs text-parchment/70 mt-1">
                <span className="w-3 h-3 bg-turmeric rounded-sm" /> {t("legendAtRisk", { a: num(30), b: num(50) })}
              </div>
              <div className="flex items-center gap-2 text-xs text-parchment/70 mt-1">
                <span className="w-3 h-3 bg-heritage rounded-sm" /> {t("legendStable", { b: num(50) })}
              </div>
            </div>
            
            {/* Mock Map Texture */}
            <div className="flex-1 bg-[url('https://images.unsplash.com/photo-1473163928189-364b2c4e1135?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity grayscale contrast-150" />
            
            {/* Heatmap Overlays */}
            <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-alert rounded-full blur-3xl opacity-40 mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-heritage rounded-full blur-3xl opacity-40 mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-turmeric rounded-full blur-3xl opacity-30 mix-blend-screen" />
          </div>

          {/* Telemetry Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#241b1d] border border-alert/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(168,62,34,0.1)]">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <AlertTriangle className="w-24 h-24 text-alert" />
              </div>
              
              <div className="relative z-10">
                <div className="text-alert font-bold tracking-wider text-xs mb-2">{t("urgentBanner")}</div>
                <h3 className="font-serif text-2xl mb-1">{t("artName")}</h3>
                <p className="text-sm text-parchment/60 mb-6">{t("scoreLine", { score: num(24) })}</p>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-parchment/60"><Users className="w-3 h-3 inline mr-1" />{t("ageDecay")}</span>
                      <span className="text-alert">{t("critical")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-alert" />
                    </div>
                    <div className="text-[10px] text-parchment/40 mt-1">{t("ageNote", { pct: pct(85), age: num(65) })}</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-parchment/60"><TrendingDown className="w-3 h-3 inline mr-1" />{t("submissionRate")}</span>
                      <span className="text-turmeric">{t("submissionDelta", { pct: pct(-40, true) })}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="w-[20%] h-full bg-turmeric" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-parchment/60"><BarChart className="w-3 h-3 inline mr-1" />{t("queryGap")}</span>
                      <span className="text-parchment">{t("high")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="w-[60%] h-full bg-parchment/80" />
                    </div>
                    <div className="text-[10px] text-parchment/40 mt-1">{t("queryNote")}</div>
                  </div>
                </div>

                <button className="w-full bg-alert/20 text-alert border border-alert/50 py-3 rounded text-sm font-medium hover:bg-alert hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {t("directTeam")}
                </button>
              </div>
            </div>
            
            <div className="bg-[#241b1d] border border-parchment/10 rounded-xl p-6 flex-1">
              <h4 className="font-medium text-sm mb-4">{t("recentAlerts")}</h4>
              <div className="space-y-3">
                <div className="text-xs text-parchment/70 p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-alert font-bold">{t("vDropLabel")}</span> {t("vDropText", { from: num(34), to: num(31) })}
                </div>
                <div className="text-xs text-parchment/70 p-3 bg-white/5 rounded border border-white/5">
                  <span className="text-turmeric font-bold">{t("anomalyLabel")}</span> {t("anomalyText", { n: num(0) })}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
