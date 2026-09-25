import { AlertTriangle, Info, Activity, ShieldCheck, ShieldAlert } from "lucide-react";
import { Reveal } from "../components/Reveal";

export default function Dashboard() {
  const data = [
    { name: "Koodiyattam", region: "Kerala", score: 24, status: "Critical", trend: "down" },
    { name: "Majuli Rogan Art", region: "Gujarat", score: 31, status: "At Risk", trend: "down" },
    { name: "Paitkar Painting", region: "Jharkhand", score: 45, status: "Vulnerable", trend: "up" },
    { name: "Kalamkari Weaving", region: "Andhra Pradesh", score: 78, status: "Stable", trend: "up" },
    { name: "Phulkari Embroidery", region: "Punjab", score: 82, status: "Stable", trend: "up" }
  ];

  return (
    <div className="flex-1 bg-parchment py-12">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-maroon mb-2 flex items-center gap-3">
              Heritage Vulnerability Index <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-alert shrink-0" />
            </h1>
            <p className="text-ink/70 max-w-2xl text-lg">
              Live intelligence identifying living traditions at critical risk of disappearing within the next decade.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-maroon/20 shadow-sm card-shadow text-xs text-ink/80 max-w-sm">
            <div className="font-medium text-maroon mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Assessment Formula
            </div>
            <code className="bg-parchment px-2 py-1 rounded block text-maroon font-medium mb-1">
              V = 0.30·Transmission + 0.25·Practitioners + 0.20·Documentation + 0.15·Interest + 0.10·Freq
            </code>
            <div className="opacity-70">Scores &lt; 30 require urgent field documentation.</div>
          </div>
        </Reveal>

        <div className="bg-turmeric/20 text-ink px-4 py-3 rounded-md border border-turmeric/40 text-sm font-medium mb-8 flex items-start gap-3">
          <Activity className="w-5 h-5 shrink-0 text-turmeric mt-0.5" />
          <p>This is an illustrative prototype indicator for SIH, not an official government ranking.</p>
        </div>

        <Reveal delay={100} className="bg-white rounded-xl shadow-sm border border-maroon/10 overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-maroon/10 bg-parchment/30 text-xs font-medium uppercase tracking-wider text-ink/60">
            <div className="col-span-4">Tradition & Region</div>
            <div className="col-span-6">Vulnerability Score</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          <div className="divide-y divide-maroon/5">
            {data.map((item, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-4 items-start sm:items-center hover:bg-parchment/10 transition-colors">
                <div className="sm:col-span-4">
                  <div className="font-serif text-lg text-ink">{item.name}</div>
                  <div className="text-xs text-ink/60">{item.region}</div>
                </div>

                <div className="sm:col-span-6 flex items-center gap-4">
                  <div className="w-full bg-parchment rounded-full h-3 overflow-hidden border border-maroon/10">
                    <div 
                      className={`h-full ${
                        item.score < 30 ? 'bg-alert' : 
                        item.score < 50 ? 'bg-turmeric' : 
                        'bg-heritage'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="font-mono text-sm font-medium w-8 text-right">{item.score}</div>
                </div>
                
                <div className="sm:col-span-2 flex justify-start sm:justify-end">
                  <span className={`px-3 py-1 rounded text-xs font-medium border ${
                    item.score < 30 ? 'bg-alert/10 text-alert border-alert/20' : 
                    item.score < 50 ? 'bg-turmeric/10 text-turmeric border-turmeric/20' : 
                    'bg-heritage/10 text-heritage border-heritage/20'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
