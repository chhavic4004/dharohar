import { ShieldCheck, QrCode, FileCheck, CheckCircle2, Mic } from "lucide-react";
import { Reveal } from "../components/Reveal";

export default function Passport() {
  return (
    <div className="flex-1 bg-parchment py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal className="text-center mb-12">
          <h1 className="font-serif text-4xl text-maroon mb-4">Provenance Passport</h1>
          <p className="text-ink/70 max-w-xl mx-auto">
            Cryptographic authenticity for heritage crafts, directly linking the artifact to the artisan's verified voice and origin.
          </p>
        </Reveal>

        <Reveal delay={100} className="bg-white rounded-xl shadow-xl card-shadow border border-maroon/20 overflow-hidden flex flex-col md:flex-row">

          {/* Artifact Preview */}
          <div className="w-full md:w-2/5 bg-ink relative min-h-[280px]">
            <img
              src="https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=1200&auto=format&fit=crop"
              alt="Handwoven Kanchipuram silk fabric with gold zari"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded px-3 py-1 text-xs font-medium inline-block mb-3">
                GI Registered
              </div>
              <h3 className="font-serif text-2xl mb-1">Kanchipuram Silk</h3>
              <p className="text-white/80 text-sm">Woven by Meenakshi Ammal</p>
            </div>
          </div>

          {/* Certificate Data */}
          <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 text-heritage font-medium mb-1">
                  <CheckCircle2 className="w-5 h-5" /> Verified Authentic
                </div>
                <div className="text-xs font-mono text-ink/40">ID: DHR-8492-KNC-2024</div>
              </div>
              <QrCode className="w-12 h-12 text-maroon" />
            </div>

            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-maroon/10">
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-wider mb-1">Origin</div>
                  <div className="font-medium text-ink">Tamil Nadu, India</div>
                </div>
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-wider mb-1">Technique</div>
                  <div className="font-medium text-ink">Handloom (Korvai)</div>
                </div>
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-wider mb-1">Material</div>
                  <div className="font-medium text-ink">Pure Mulberry Silk</div>
                </div>
                <div>
                  <div className="text-xs text-ink/50 uppercase tracking-wider mb-1">Time to craft</div>
                  <div className="font-medium text-ink">14 days</div>
                </div>
              </div>

              {/* Audio Watermark Section */}
              <div className="bg-turmeric/10 border border-turmeric/30 rounded-lg p-4 flex gap-4 items-start">
                <div className="bg-turmeric text-ink p-2 rounded-full shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-ink mb-1 text-sm">Listen to the Artisan</h4>
                  <p className="text-xs text-ink/70 mb-3">
                    Meenakshi explains the motif on this exact saree in her native dialect.
                  </p>
                  <button className="flex items-center gap-2 text-xs font-medium text-maroon hover:text-terracotta transition-colors">
                    ▶ Play embedded story
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-terracotta text-white py-3 rounded font-medium hover:bg-maroon transition-colors flex justify-center items-center gap-2 shadow-sm">
                <FileCheck className="w-4 h-4" /> Generate Certificate
              </button>
              <button className="flex-1 bg-parchment border border-maroon/20 text-maroon py-3 rounded font-medium hover:bg-parchment/70 transition-colors flex justify-center items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> View Crypto Signature
              </button>
            </div>
            <div className="text-center mt-4 text-[10px] text-ink/40 font-mono">
              Original recording watermarked against unauthorized AI scraping
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
