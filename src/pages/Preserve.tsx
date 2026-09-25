import { useState, useRef, useEffect } from "react";
import { Mic, CheckCircle2, ChevronRight, PenTool, Music } from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "../components/Reveal";

export default function Preserve() {
  const [step, setStep] = useState(1);
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio recording mock state
  const handleRecord = () => {
    if (recording) {
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setRecording(true);
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 bg-[#FBF7EE] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-between md:justify-center md:gap-12 mb-16 max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-maroon/20 -z-10" />
          {[
            { num: 1, label: "Story Type" },
            { num: 2, label: "Record" },
            { num: 3, label: "Review" },
            { num: 4, label: "Preserve" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-[#FBF7EE] px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  step >= s.num
                    ? "bg-maroon border-maroon text-parchment"
                    : "bg-parchment border-maroon/20 text-maroon/50"
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5 text-parchment" /> : s.num}
              </div>
              <span
                className={`text-xs font-medium ${
                  step >= s.num ? "text-maroon" : "text-maroon/50"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <Reveal>
            <div className="text-center mb-12">
              <h1 className="font-serif text-3xl md:text-5xl text-maroon mb-4">
                What would you like to preserve?
              </h1>
              <p className="text-ink/70 text-lg">
                Choose the type of story that best describes what you want to share.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Card 1 */}
              <button
                onClick={() => setStep(2)}
                className="bg-parchment border border-maroon/10 rounded-2xl p-6 text-left hover:border-terracotta/50 hover:shadow-xl transition-all group flex flex-col cursor-pointer"
              >
                <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6 text-maroon" />
                </div>
                <h3 className="font-serif text-xl text-maroon mb-1">Oral History</h3>
                <span className="text-xs text-maroon/70 mb-4 font-medium">मौखिक इतिहास</span>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Partition memories</span>
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Family migration stories</span>
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Village histories</span>
                </div>
              </button>

              {/* Card 2 */}
              <button
                onClick={() => setStep(2)}
                className="bg-parchment border border-maroon/10 rounded-2xl p-6 text-left hover:border-terracotta/50 hover:shadow-xl transition-all group flex flex-col cursor-pointer"
              >
                <div className="w-12 h-12 bg-turmeric/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PenTool className="w-6 h-6 text-turmeric" />
                </div>
                <h3 className="font-serif text-xl text-maroon mb-1">Craft & Tradition</h3>
                <span className="text-xs text-maroon/70 mb-4 font-medium">शिल्प और परम्परा</span>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Phulkari embroidery</span>
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Pottery techniques</span>
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Weaving traditions</span>
                </div>
              </button>

              {/* Card 3 */}
              <button
                onClick={() => setStep(2)}
                className="bg-parchment border border-maroon/10 rounded-2xl p-6 text-left hover:border-terracotta/50 hover:shadow-xl transition-all group flex flex-col cursor-pointer"
              >
                <div className="w-12 h-12 bg-terracotta/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6 text-terracotta" />
                </div>
                <h3 className="font-serif text-xl text-maroon mb-1">Folk Song</h3>
                <span className="text-xs text-maroon/70 mb-4 font-medium">लोकगीत</span>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Wedding songs</span>
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Harvest songs</span>
                  <span className="text-[10px] bg-maroon/5 text-maroon px-2 py-1 rounded-full border border-maroon/10">Lullabies</span>
                </div>
              </button>
            </div>

            <div className="mt-12 text-center text-sm text-ink/60">
              You can record in Hindi, Punjabi, or English · Original voice always preserved
            </div>
          </Reveal>
        )}

        {step === 2 && (
          <Reveal delay={100}>
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-serif text-3xl md:text-5xl text-maroon mb-4">
                Record in your own language
              </h1>
              <p className="text-ink/70 text-base md:text-lg mb-1">
                Speak naturally. You can pause, restart, or upload an existing recording.
              </p>
              <p className="text-terracotta text-sm font-medium mb-12">
                अपनी भाषा में बोलें · ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ
              </p>

              <div className="bg-parchment border border-maroon/10 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-6xl md:text-8xl font-serif text-maroon tracking-tighter mb-4 tabular-nums">
                  {formatTime(time)}
                </div>
                <div className="text-sm text-ink/50 mb-12">
                  {recording ? "Recording... Click to pause" : "Press the microphone to begin"}
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button
                    onClick={handleRecord}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      recording
                        ? "bg-maroon animate-pulse shadow-[0_0_40px_rgba(122,31,53,0.4)]"
                        : "bg-terracotta hover:bg-maroon hover:scale-105 shadow-xl"
                    }`}
                  >
                    <Mic className="w-10 h-10 text-white" />
                  </button>

                  <button className="text-sm font-medium text-maroon/70 hover:text-terracotta transition-colors border border-maroon/20 rounded-full px-6 py-2 cursor-pointer bg-white/50">
                    Upload existing audio
                  </button>
                </div>
              </div>

              {time > 5 && !recording && (
                <div className="mt-8">
                  <button onClick={() => setStep(3)} className="bg-terracotta text-white px-8 py-3 rounded-full font-medium hover:bg-maroon transition-colors flex items-center gap-2 mx-auto cursor-pointer">
                    Continue to Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mt-8 bg-turmeric/10 border border-turmeric/20 rounded-xl p-4 text-left">
                <p className="text-sm text-ink/80 leading-relaxed">
                  <strong className="text-maroon">Tip:</strong> Speak in the language you feel most comfortable in. You can also speak a mix — Dharohar will transcribe what it hears. Translator assistance is AI-assisted.
                </p>
              </div>
            </div>
          </Reveal>
        )}
        
        {step === 3 && (
          <Reveal>
             <div className="text-center">
              <h1 className="font-serif text-3xl md:text-5xl text-maroon mb-4">
                Review your story
              </h1>
              <div className="mt-8">
                <button onClick={() => setStep(1)} className="bg-parchment text-maroon border border-maroon/20 px-8 py-3 rounded-full font-medium hover:bg-maroon/5 transition-colors cursor-pointer">
                  Start Over
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}