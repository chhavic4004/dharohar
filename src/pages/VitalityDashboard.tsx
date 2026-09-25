import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronRight, ArrowRight, BookOpen } from "lucide-react";
import { Reveal } from "../components/Reveal";

const CIRCUMFERENCE = 251.2;
const TARGET_SCORE = 72;

const bgPattern = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='12' height='12' fill='%23c9a87c' fill-opacity='0.07'/%3E%3Crect x='12' y='12' width='12' height='12' fill='%23c9a87c' fill-opacity='0.07'/%3E%3C/svg%3E")`;

export default function VitalityDashboard() {
  const factors = [
    { num: 1, name: "Transmission", weight: 30, score: 68, desc: "Knowledge passed to younger generations" },
    { num: 2, name: "Practitioners", weight: 25, score: 74, desc: "Active practitioners in the community" },
    { num: 3, name: "Documentation", weight: 20, score: 80, desc: "Written, audio, and video records available" },
    { num: 4, name: "Community Interest", weight: 15, score: 70, desc: "Community engagement and awareness" },
    { num: 5, name: "Practice Frequency", weight: 10, score: 62, desc: "How often the tradition is actively practised" },
  ];

  const [donutAnimated, setDonutAnimated] = useState(false);
  const [count, setCount] = useState(0);
  const [barsReady, setBarsReady] = useState(false);
  const [barWidths, setBarWidths] = useState<number[]>(factors.map(() => 0));

  // Kick off all animations after mount
  useEffect(() => {
    const t1 = setTimeout(() => setDonutAnimated(true), 300);
    const t2 = setTimeout(() => {
      setBarsReady(true);
      setBarWidths(factors.map(f => f.score));
    }, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Counter for donut label: 0 → 72
  useEffect(() => {
    if (!donutAnimated) return;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= TARGET_SCORE) {
        setCount(TARGET_SCORE);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [donutAnimated]);

  const dashOffset = donutAnimated
    ? CIRCUMFERENCE - (TARGET_SCORE / 100) * CIRCUMFERENCE
    : CIRCUMFERENCE;

  // Re-animate a bar on hover
  const handleBarHover = (index: number) => {
    setBarWidths(prev => {
      const next = [...prev];
      next[index] = 0;
      return next;
    });
    setTimeout(() => {
      setBarWidths(prev => {
        const next = [...prev];
        next[index] = factors[index].score;
        return next;
      });
    }, 30);
  };

  const barColor = (score: number) =>
    score > 75 ? "#10B981" : score > 65 ? "#F59E0B" : "#EF4444";

  return (
    <div
      className="flex-1 bg-[#FBF7EE] py-10 px-4 sm:px-6 md:px-8"
      style={{ backgroundImage: bgPattern }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Reveal>
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs font-medium text-ink/50 mb-6">
              <Link to="/dashboard" className="hover:text-maroon transition-colors">Dashboard</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-maroon">Phulkari</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl text-maroon mb-2">
                  Phulkari <span className="text-turmeric/80 text-3xl md:text-4xl">फुलकारी</span>
                </h1>
                <p className="text-ink/70">Punjab · 34 stories in archive</p>
              </div>
              <div className="flex items-center gap-2 bg-[#E8F3EA] text-[#2C5E3B] px-4 py-2 rounded-full font-bold shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                72 — Stable
              </div>
            </div>
          </div>
        </Reveal>

        {/* Top Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Animated Donut Gauge */}
          <Reveal delay={100}>
            <div className="bg-white border border-maroon/10 rounded-2xl p-8 flex flex-col items-center justify-center h-full shadow-sm text-center">
              <div className="relative w-48 h-48 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3ecda" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-serif text-maroon tabular-nums">{count}</span>
                  <span className="text-xs font-medium text-ink/50 mt-1">/ 100</span>
                </div>
              </div>
              <h3 className="font-bold text-lg text-ink mb-2">Overall Vitality</h3>
              <p className="text-sm text-ink/70 max-w-xs">
                The tradition maintains a stable foundation, though practice frequency is showing signs of vulnerability in urban areas.
              </p>
            </div>
          </Reveal>

          {/* Radar Chart */}
          <Reveal delay={200}>
            <div className="bg-white border border-maroon/10 rounded-2xl p-8 flex flex-col items-center justify-center h-full shadow-sm">
              <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
                    <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#7A1F35" strokeWidth="1"/>
                    <polygon points="100,40 157,81 135,149 65,149 43,81" fill="none" stroke="#7A1F35" strokeWidth="1"/>
                    <polygon points="100,60 138,88 123,132 77,132 62,88" fill="none" stroke="#7A1F35" strokeWidth="1"/>
                    <line x1="100" y1="100" x2="100" y2="20" stroke="#7A1F35" strokeWidth="1"/>
                    <line x1="100" y1="100" x2="176" y2="75" stroke="#7A1F35" strokeWidth="1"/>
                    <line x1="100" y1="100" x2="147" y2="165" stroke="#7A1F35" strokeWidth="1"/>
                    <line x1="100" y1="100" x2="53" y2="165" stroke="#7A1F35" strokeWidth="1"/>
                    <line x1="100" y1="100" x2="24" y2="75" stroke="#7A1F35" strokeWidth="1"/>
                  </svg>
                  <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                    <polygon points="100,45 160,82 140,150 60,155 35,80" fill="rgba(201,98,46,0.2)" stroke="#C9622E" strokeWidth="2" strokeLinejoin="round"/>
                    <circle cx="100" cy="45" r="4" fill="#C9622E" />
                    <circle cx="160" cy="82" r="4" fill="#C9622E" />
                    <circle cx="140" cy="150" r="4" fill="#C9622E" />
                    <circle cx="60" cy="155" r="4" fill="#C9622E" />
                    <circle cx="35" cy="80" r="4" fill="#C9622E" />
                  </svg>
                </div>
                <span className="absolute top-0 text-[10px] font-bold text-ink/70">Transmission</span>
                <span className="absolute right-0 top-[35%] text-[10px] font-bold text-ink/70 translate-x-4">Practitioners</span>
                <span className="absolute right-[15%] bottom-[10%] text-[10px] font-bold text-ink/70 translate-x-2 translate-y-4">Documentation</span>
                <span className="absolute left-[10%] bottom-[10%] text-[10px] font-bold text-ink/70 -translate-x-2 translate-y-4">Community</span>
                <span className="absolute left-0 top-[35%] text-[10px] font-bold text-ink/70 -translate-x-4">Practice</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Score Breakdown Bar Chart */}
        <Reveal delay={300}>
          <div className="bg-white border border-maroon/10 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
            <h2 className="font-serif text-2xl text-maroon mb-8">Score Breakdown</h2>
            <div className="space-y-6">
              {factors.map((f, i) => (
                <div
                  key={f.name}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 group cursor-default"
                  onMouseEnter={() => barsReady && handleBarHover(i)}
                >
                  <div className="w-full sm:w-40 shrink-0 text-sm font-bold text-ink/80 flex justify-between">
                    <span>{f.name}</span>
                    <span className="text-maroon font-serif text-base">{f.score}</span>
                  </div>
                  <div className="flex-1 h-3 bg-parchment rounded-full overflow-hidden relative">
                    <div
                      className="absolute top-0 left-0 bottom-0 rounded-full"
                      style={{
                        width: `${barWidths[i]}%`,
                        backgroundColor: barColor(f.score),
                        transition: "width 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Five Factors Explained */}
        <Reveal delay={400}>
          <div className="mb-16">
            <h2 className="font-serif text-2xl text-maroon mb-6">Five Factors Explained</h2>
            <div className="space-y-4">
              {factors.map((f, i) => (
                <div
                  key={f.num}
                  className="bg-white border border-maroon/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:border-terracotta/40 transition-colors group cursor-default"
                  onMouseEnter={() => barsReady && handleBarHover(i)}
                >
                  <div className="w-12 h-12 bg-parchment text-maroon font-serif text-xl rounded-full flex items-center justify-center shrink-0 border border-maroon/10">
                    {f.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-ink text-base mb-1">{f.name}</h3>
                    <p className="text-sm text-ink/70">{f.desc}</p>
                  </div>
                  <div className="shrink-0 flex flex-col md:items-end w-full md:w-auto">
                    <div className="flex items-center gap-4 mb-2 w-full md:w-auto justify-between md:justify-end">
                      <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Weight {f.weight}%</span>
                      <span className="font-serif text-2xl text-maroon">{f.score}</span>
                    </div>
                    <div className="w-full md:w-32 h-1.5 bg-parchment rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${barWidths[i]}%`,
                          backgroundColor: barColor(f.score),
                          transition: "width 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Footer Actions */}
        <Reveal delay={500}>
          <div className="border-t border-maroon/10 pt-8 pb-12 flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/preserve" className="bg-terracotta text-white px-8 py-3.5 rounded-lg font-medium hover:bg-maroon transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer w-full sm:w-auto text-center">
                Preserve a Story for this Tradition <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/explore" className="bg-white text-maroon border border-maroon/30 px-8 py-3.5 rounded-lg font-medium hover:bg-maroon/5 transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-center">
                <BookOpen className="w-4 h-4" /> Explore Archive Stories
              </Link>
            </div>
            <p className="text-xs text-ink/40 text-center max-w-sm mt-4">
              Disclaimer: Dashboard data is simulated for this prototype based on current archive submissions.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
