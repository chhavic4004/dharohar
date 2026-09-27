import { useState } from "react";
import { Link } from "react-router";
import { Play, Pause, ChevronRight, ShieldCheck, MapPin, Users, Globe, ExternalLink, Scissors, Map, Palette, Image as ImageIcon, BookOpen } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { HeritageMiniMap, HeritageQuizCard } from "../features/quiz";
import { usePageText } from "../i18n/page";
import { traditionText } from "../i18n/pages/tradition";

export default function TraditionDetail() {
  const [playing, setPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState("pa");
  const { t, lang, dir, locale } = usePageText(traditionText);
  const num = (n: number) => n.toLocaleString(locale);
  // Renders *text* segments of a translation in italics.
  const em = (s: string) => s.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));

  return (
    <div dir={dir} className="flex-1 bg-[#FBF7EE]">
      {/* Breadcrumb & Hero Banner */}
      <div className="bg-ink text-parchment pt-6 pb-12 px-4 sm:px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <img src="https://images.unsplash.com/photo-1605380536761-e0e90c213af3?w=1200&auto=format&fit=crop" alt={t("heroAlt")} className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs font-medium text-parchment/60 mb-6">
            <Link to="/" className="hover:text-parchment transition-colors">{t("crumbHome")}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/explore" className="hover:text-parchment transition-colors">{t("crumbExplore")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-parchment">{t("phulkari")}</span>
          </div>
          
          <Reveal>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/20 px-2 py-1 rounded mb-4">
              {t("categoryBadge")}
            </span>
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
              <h1 className="font-serif text-4xl md:text-6xl text-parchment leading-none">{t("phulkari")}</h1>
              {lang === "en" && (
                <div className="flex items-center gap-4 text-xl md:text-2xl text-turmeric/80 font-serif mb-1">
                  <span>ਫੁਲਕਾਰੀ</span>
                  <span className="opacity-30">|</span>
                  <span>फूलों का काम</span>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Main Content (Left 70%) */}
          <div className="lg:col-span-8 space-y-12">
            
            <Reveal>
              <section className="prose prose-lg prose-maroon max-w-none font-serif text-ink/80 leading-relaxed">
                <h2 className="text-2xl text-maroon mb-6 font-medium">{t("aboutHeading")}</h2>
                <p>{t("about1")}</p>
                <p>{em(t("about2"))}</p>
                <p>{em(t("about3"))}</p>
              </section>
            </Reveal>

            <Reveal delay={100}>
              <section>
                <h2 className="font-serif text-2xl text-maroon mb-6">{t("voiceHeading")}</h2>
                <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="shrink-0 flex flex-col items-center sm:items-start gap-4">
                       <button 
                        onClick={() => setPlaying(!playing)}
                        aria-label={playing ? t("pauseAria") : t("playAria")}
                        className="w-16 h-16 rounded-full bg-terracotta hover:bg-maroon transition-colors flex items-center justify-center text-white shadow-lg cursor-pointer"
                      >
                        {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                      <div className="text-xs font-medium text-ink/60 bg-parchment px-3 py-1 rounded-full border border-maroon/10">12:47</div>
                    </div>
                    
                    <div className="flex-1">
                      <blockquote className="font-serif text-xl md:text-2xl text-maroon/90 italic leading-snug mb-6">
                        {t("quote")}
                      </blockquote>
                      
                      <div className="flex items-center gap-2 mb-4 border-b border-maroon/10 pb-2">
                        <button onClick={() => setActiveLang('pa')} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${activeLang === 'pa' ? 'bg-maroon text-white' : 'text-ink/60 hover:text-maroon'}`}>{t("transcriptPunjabi")}</button>
                        <button onClick={() => setActiveLang('hi')} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${activeLang === 'hi' ? 'bg-maroon text-white' : 'text-ink/60 hover:text-maroon'}`}>{t("transcriptHindi")}</button>
                        <button onClick={() => setActiveLang('en')} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${activeLang === 'en' ? 'bg-maroon text-white' : 'text-ink/60 hover:text-maroon'}`}>{t("transcriptEnglish")}</button>
                      </div>
                      
                      <div className="text-sm text-ink/80 leading-relaxed font-serif min-h-[4rem]">
                         {activeLang === 'pa' && <p>ਫੁਲਕਾਰੀ ਸਿਰਫ਼ ਕੱਢਾਈ ਨਹੀਂ ਹੈ। ਇਹ ਇੱਕ ਔਰਤ ਦੀ ਆਵਾਜ਼ ਸੀ ਜਦੋਂ ਉਹ ਬੋਲ ਨਹੀਂ ਸਕਦੀ ਸੀ।</p>}
                         {activeLang === 'hi' && <p>फुलकारी सिर्फ कढ़ाई नहीं है। यह एक महिला की आवाज़ थी जब वह बोल नहीं सकती थी।</p>}
                         {activeLang === 'en' && <p>Phulkari is not merely embroidery. It was a woman's voice when she could not speak.</p>}
                      </div>
                      <div className="mt-4 text-xs font-medium text-ink/50">— {t("attribution")}</div>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>

            <HeritageQuizCard heritageId="phulkari" />

            <Reveal delay={200}>
              <section>
                <h2 className="font-serif text-2xl text-maroon mb-6">{t("materialsHeading")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Map className="w-5 h-5" />, title: t("matBaseTitle"), desc: t("matBaseDesc") },
                    { icon: <Scissors className="w-5 h-5" />, title: t("matThreadTitle"), desc: t("matThreadDesc") },
                    { icon: <Palette className="w-5 h-5" />, title: t("matStitchTitle"), desc: t("matStitchDesc") },
                    { icon: <ImageIcon className="w-5 h-5" />, title: t("matPatternsTitle"), desc: t("matPatternsDesc") },
                    { icon: <BookOpen className="w-5 h-5" />, title: t("matTypesTitle"), desc: t("matTypesDesc") },
                    { icon: <Users className="w-5 h-5" />, title: t("matLearningTitle"), desc: t("matLearningDesc") }
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-maroon/10 p-4 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-maroon/5 text-maroon rounded-lg shrink-0">{item.icon}</div>
                      <div>
                        <h4 className="text-sm font-bold text-maroon mb-1">{item.title}</h4>
                        <p className="text-xs text-ink/70 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
            
            <Reveal delay={300}>
               <section className="rounded-2xl overflow-hidden h-64 relative border border-maroon/10">
                 <img src="https://images.unsplash.com/photo-1528399127814-1e0e84bfa4d8?q=80&w=1200&auto=format&fit=crop" alt={t("contextAlt")} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-parchment text-sm font-medium">{t("contextCaption")}</span>
                 </div>
               </section>
            </Reveal>

            <Reveal delay={400}>
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl text-maroon">{t("storiesHeading")}</h2>
                  <Link to="/explore" className="text-sm font-medium text-terracotta hover:text-maroon transition-colors flex items-center gap-1">
                    {t("viewAll", { count: num(34) })} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {[
                    { id: "1", title: t("story1Title"), loc: t("story1Loc"), time: "12:47", rev: true },
                    { id: "2", title: t("story2Title"), loc: t("story2Loc"), time: "18:22", rev: true },
                    { id: "3", title: t("story3Title"), loc: t("story3Loc"), time: "09:15", rev: false },
                  ].map((s, i) => (
                    <Link key={i} to={`/story/${s.id}`} className="snap-start shrink-0 w-64 bg-white border border-maroon/10 p-4 rounded-xl hover:border-terracotta/50 transition-colors group block cursor-pointer">
                       <h4 className="font-serif text-maroon font-medium mb-3 group-hover:text-terracotta line-clamp-2">{s.title}</h4>
                       <div className="flex items-center justify-between text-xs text-ink/60">
                         <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.loc}</span>
                         <span className="font-medium">{s.time}</span>
                       </div>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>

          </div>

          {/* Sticky Sidebar (Right 30%) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
            <Reveal delay={200}>
              {/* Heritage Profile */}
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-6">{t("profileHeading")}</h3>
                
                <dl className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">{t("localNameLabel")}</dt>
                    <dd className="font-medium text-maroon">{t("localNameValue")}</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">{t("regionLabel")}</dt>
                    <dd className="font-medium text-maroon">{t("regionValue")}</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">{t("practitionersLabel")}</dt>
                    <dd className="font-medium text-maroon">{t("practitionersValue", { count: num(210) })}</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">{t("archivedLabel")}</dt>
                    <dd className="font-medium text-maroon">{num(34)}</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">{t("languagesLabel")}</dt>
                    <dd className="font-medium text-maroon">{t("languagesValue")}</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-ink/60">{t("unescoLabel")}</dt>
                    <dd className="font-medium text-maroon">{t("unescoValue")}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <HeritageMiniMap heritageId="phulkari" />
            </Reveal>

            <Reveal delay={300}>
              {/* Heritage Vitality */}
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-4">{t("vitalityHeading")}</h3>
                
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-4xl font-serif text-maroon leading-none">{num(72)}</span>
                  <span className="text-sm text-ink/50 font-medium mb-1">/ {num(100)}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                  <span className="text-sm font-bold text-ink">{num(72)} — {t("statusStable")}</span>
                </div>
                
                <p className="text-xs text-ink/70 leading-relaxed mb-5">
                  {t("vitalityNote")}
                </p>
                
                <Link to="/dashboard/phulkari" className="block w-full text-center bg-parchment text-maroon text-sm font-medium py-2.5 rounded-lg border border-maroon/20 hover:bg-maroon hover:text-white transition-colors cursor-pointer">
                  {t("vitalityLink")} &rarr;
                </Link>
              </div>
            </Reveal>

            <Reveal delay={400}>
              {/* Verification Status */}
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-4">{t("sourceHeading")}</h3>
                
                <div className="flex items-start gap-3 bg-[#E8F3EA] text-[#2C5E3B] p-3 rounded-lg">
                  <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sm block">{t("communityReviewed")}</span>
                    <span className="text-xs opacity-80 leading-tight block mt-1">{t("validatedBy")}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}