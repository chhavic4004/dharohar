import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Mic, ArrowRight, ShieldCheck, Search, Activity, BookOpen, Clock, Heart, Map as MapIcon, HelpCircle, Award } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { usePageText } from "../i18n/page";
import { homeText } from "../i18n/pages/home";

function AnimatedCounter({ end, duration = 2000, locale }: { end: number; duration?: number; locale?: string }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Fast start and smooth tick-up curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.max(1, Math.floor(1 + easeOut * (end - 1)));
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <>{count.toLocaleString(locale)}</>;
}

export default function Home() {
  const { t, lang, dir, locale } = usePageText(homeText);
  const [recordedPre, recordedPost] = t("recordedBy").split("{name}");
  return (
    <div dir={dir} className="w-full flex flex-col shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] filter-none">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[520px] flex items-center overflow-hidden bg-ink">
        <div className="absolute inset-0 bg-ink/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1721508490084-1b1de5b230d4?q=80&w=2400&auto=format&fit=crop"
          alt={t("heroImgAlt")}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl text-parchment">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-4">
              {t("heroTitle")}
            </h1>
            {lang === "en" && (
              <p className="font-devanagari text-xl sm:text-2xl text-turmeric mb-6 sm:mb-8 opacity-90">
                हमारी विरासत को सहेजने वाली आवाज़ों को सुरक्षित करें
              </p>
            )}
            <p className="text-lg sm:text-xl opacity-90 mb-8 sm:mb-10 max-w-xl font-light">
              {t("heroDesc")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/preserve" className="bg-terracotta text-white px-8 py-4 rounded text-lg font-medium hover:bg-maroon transition-colors flex items-center gap-2 cursor-pointer">
                <Mic className="w-5 h-5" /> {t("recordStory")}
              </Link>
              <Link to="/quiz" className="bg-turmeric text-ink px-8 py-4 rounded text-lg font-medium hover:bg-parchment transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
                <HelpCircle className="w-5 h-5" /> {t("takeQuiz")}
              </Link>
              <Link to="/explore" className="bg-parchment/10 backdrop-blur-md border border-parchment/30 text-parchment px-8 py-4 rounded text-lg font-medium hover:bg-parchment/20 transition-colors flex items-center gap-2">
                {t("exploreArchive")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Counter Strip */}
      <div className="bg-maroon text-parchment py-6 border-b-4 border-turmeric">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-parchment/20">
          <div className="px-4 text-center md:text-left">
            <div className="font-serif text-3xl font-bold"><AnimatedCounter end={12408} locale={locale} /></div>
            <div className="text-sm opacity-80 mt-1">{t("statStories")}</div>
          </div>
          <div className="px-4 text-center md:text-left">
            <div className="font-serif text-3xl font-bold"><AnimatedCounter end={842} locale={locale} /></div>
            <div className="text-sm opacity-80 mt-1">{t("statTraditions")}</div>
          </div>
          <div className="px-4 text-center md:text-left">
            <div className="font-serif text-3xl font-bold"><AnimatedCounter end={46} locale={locale} /></div>
            <div className="text-sm opacity-80 mt-1">{t("statLanguages")}</div>
          </div>
          <div className="px-4 text-center md:text-left">
            <div className="font-serif text-3xl font-bold"><AnimatedCounter end={3120} locale={locale} /></div>
            <div className="text-sm opacity-80 mt-1">{t("statBearers")}</div>
          </div>
        </div>
      </div>

      {/* Three Pillars */}
      <Reveal as="section" className="py-16 sm:py-20 bg-parchment">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-turmeric/20 text-turmeric rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-maroon">{t("preserve")}</h3>
              <p className="text-ink/80 leading-relaxed">
                {t("preserveDesc")}
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-heritage/20 text-heritage rounded-full flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-maroon">{t("discover")}</h3>
              <p className="text-ink/80 leading-relaxed">
                {t("discoverDesc")}
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-terracotta/20 text-terracotta rounded-full flex items-center justify-center mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-maroon">{t("passOn")}</h3>
              <p className="text-ink/80 leading-relaxed">
                {t("passOnDesc")}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* How a story gets preserved (5 steps) */}
      <Reveal as="section" className="py-16 sm:py-20 border-t border-maroon/10 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-4xl text-maroon mb-4">{t("stepsTitle")}</h2>
            <p className="text-ink/70 max-w-2xl mx-auto">{t("stepsDesc")}</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start relative">
            <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-maroon/10 z-0" />
            
            {[
              { num: (1).toLocaleString(locale), title: t("step1Title"), desc: t("step1Desc") },
              { num: (2).toLocaleString(locale), title: t("step2Title"), desc: t("step2Desc") },
              { num: (3).toLocaleString(locale), title: t("step3Title"), desc: t("step3Desc") },
              { num: (4).toLocaleString(locale), title: t("step4Title"), desc: t("step4Desc") },
              { num: (5).toLocaleString(locale), title: t("step5Title"), desc: t("step5Desc") }
            ].map((step, i) => (
              <div
                key={i}
                className="group relative z-10 flex flex-col items-center mb-8 md:mb-0 w-full md:w-1/5 p-4 rounded-xl transition-all duration-300 hover:-translate-y-2 hover:bg-maroon hover:shadow-xl cursor-pointer border border-transparent hover:border-turmeric/40"
              >
                <div className="w-12 h-12 rounded-full bg-parchment border-2 border-maroon text-maroon flex items-center justify-center font-serif text-xl font-bold mb-4 shadow-sm card-shadow transition-all duration-300 group-hover:scale-125 group-hover:bg-turmeric group-hover:text-maroon group-hover:border-parchment group-hover:rotate-6 group-hover:shadow-md">
                  {step.num}
                </div>
                <h4 className="font-medium text-ink text-center mb-1 transition-colors duration-300 group-hover:text-parchment group-hover:font-semibold">{step.title}</h4>
                <p className="text-sm text-ink/60 text-center transition-colors duration-300 group-hover:text-parchment/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Featured Story Cards */}
      <Reveal as="section" className="py-16 sm:py-20 bg-parchment border-t border-maroon/10 relative">
        <div className="absolute top-0 inset-x-0 h-4 pattern-phulkari opacity-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8 sm:mb-10">
            <div>
              <h2 className="font-serif text-4xl text-maroon mb-2">{t("livingTitle")}</h2>
              <p className="text-ink/70">{t("livingDesc")}</p>
            </div>
            <Link to="/map" className="hidden md:flex items-center gap-2 text-terracotta hover:text-maroon font-medium transition-colors">
              {t("viewAllMap")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "https://images.unsplash.com/photo-1638042791745-221dae5a623b?q=80&w=1200&auto=format&fit=crop",
                tag: t("tagCraft"),
                title: t("story1Title"),
                author: t("story1Author"),
                loc: t("story1Loc"),
                verified: true
              },
              {
                img: "https://images.unsplash.com/photo-1757311475307-5657a7892179?q=80&w=1200&auto=format&fit=crop",
                tag: t("tagFolkSong"),
                title: t("story2Title"),
                author: t("story2Author"),
                loc: t("story2Loc"),
                verified: true
              },
              {
                img: "https://images.unsplash.com/photo-1707978932202-751b08324daf?q=80&w=1200&auto=format&fit=crop",
                tag: t("tagPartition"),
                title: t("story3Title"),
                author: t("story3Author"),
                loc: t("story3Loc"),
                verified: false
              }
            ].map((story, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden stitch-border hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-48 relative overflow-hidden bg-maroon/10">
                  <img src={story.img} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-ink/80 backdrop-blur-sm text-parchment text-xs font-medium px-3 py-1 rounded-full">
                    {story.tag}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl text-maroon mb-2 leading-snug group-hover:text-terracotta transition-colors">{story.title}</h3>
                  <div className="text-sm text-ink/70 mb-4 flex-1">
                    {recordedPre}<span className="font-medium text-ink">{story.author}</span>{recordedPost}<br/>
                    {story.loc}
                  </div>
                  {story.verified ? (
                    <div className="flex items-center gap-2 text-xs text-heritage font-medium bg-heritage/10 px-3 py-1.5 rounded w-fit">
                      <ShieldCheck className="w-3.5 h-3.5" /> {t("communityReviewed")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-turmeric font-medium bg-turmeric/10 px-3 py-1.5 rounded w-fit">
                      <Activity className="w-3.5 h-3.5" /> {t("aiPending")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full md:hidden mt-8 flex items-center justify-center gap-2 text-terracotta font-medium py-4 border border-terracotta/30 rounded">
            {t("viewAllMap")} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>

      {/* Footer Teaser / Map Entry */}
      <Reveal as="section" className="py-20 sm:py-24 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1473163928189-364b2c4e1135?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover" alt={t("mapImgAlt")} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-parchment mb-6">{t("mapTitle")}</h2>
          <p className="text-parchment/70 text-lg mb-10 max-w-2xl mx-auto">
            {t("mapDesc")}
          </p>
          <Link to="/map" className="inline-flex items-center gap-2 bg-turmeric text-ink px-8 py-4 rounded text-lg font-medium hover:bg-parchment transition-colors shadow-sm card-shadow">
            <MapIcon className="w-5 h-5" /> {t("exploreMap")}
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
