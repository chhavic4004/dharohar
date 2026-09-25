import { useState } from "react";
import { Play, Pause, MapPin, CheckCircle, Info, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "../components/Reveal";

export default function StoryDetail() {
  const [playing, setPlaying] = useState(false);
  const [activeLang, setActiveLang] = useState("pa");

  return (
    <div className="flex-1 bg-[#FBF7EE]">
      {/* Top Metadata Bar */}
      <div className="bg-parchment border-b border-maroon/10 py-3 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium text-ink/70">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-terracotta" /> Patiala, Punjab</span>
          <span className="hidden sm:inline text-maroon/30">|</span>
          <span>January 2026</span>
          <span className="hidden sm:inline text-maroon/30">|</span>
          <span>Punjabi</span>
          <span className="hidden sm:inline text-maroon/30">|</span>
          <span>~Traditional, documented 2026</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <Reveal>
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-5xl text-maroon mb-4 leading-tight">
              Phulkari — Mere Nani Ki Ungliyon Ki Kala
            </h1>
            <p className="text-lg text-ink/70 max-w-3xl">
              A detailed account of the Bagh stitch, passed down through four generations, as remembered by Bibi Surjit Kaur.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content (Left 70%) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Audio Player Card */}
            <Reveal delay={100}>
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                <div className="text-[10px] font-bold tracking-widest text-maroon/60 uppercase mb-4">
                  Original Recording — Preserved As-Is
                </div>
                
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setPlaying(!playing)}
                    className="w-16 h-16 shrink-0 rounded-full bg-terracotta hover:bg-maroon transition-colors flex items-center justify-center text-white shadow-lg cursor-pointer"
                  >
                    {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="h-1.5 bg-parchment rounded-full w-full mb-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 bg-terracotta w-1/3 rounded-full" />
                    </div>
                    <div className="flex justify-between text-xs font-medium text-ink/60">
                      <span>04:15</span>
                      <span>12:47</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-maroon/10 text-xs text-ink/60 flex items-center gap-2">
                  <Info className="w-4 h-4 text-maroon/40" />
                  Original recording preserved in its entirety — AI-generated transcript below is supplementary
                </div>
              </div>
            </Reveal>

            {/* Transcript Section */}
            <Reveal delay={200}>
              <div className="bg-white rounded-2xl border border-maroon/10 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-maroon/10 px-6 py-4 bg-parchment/50">
                  <div className="flex gap-2">
                    <button onClick={() => setActiveLang('pa')} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${activeLang === 'pa' ? 'bg-maroon text-white' : 'bg-transparent text-ink/60 hover:text-maroon'}`}>ਪੰਜਾਬੀ (Original)</button>
                    <button onClick={() => setActiveLang('hi')} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${activeLang === 'hi' ? 'bg-maroon text-white' : 'bg-transparent text-ink/60 hover:text-maroon'}`}>हिन्दी</button>
                    <button onClick={() => setActiveLang('en')} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${activeLang === 'en' ? 'bg-maroon text-white' : 'bg-transparent text-ink/60 hover:text-maroon'}`}>English</button>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-turmeric bg-turmeric/10 px-2.5 py-1 rounded">
                    AI-assisted transcription & translation
                  </div>
                </div>
                
                <div className="p-6 md:p-8 text-lg leading-relaxed text-ink/80 font-serif">
                  {activeLang === 'pa' && (
                    <p>
                      ਫੁਲਕਾਰੀ ਸਿਰਫ਼ ਕੱਢਾਈ ਨਹੀਂ, ਇਹ ਸਾਡੀ ਰੂਹ ਦਾ ਹਿੱਸਾ ਹੈ। ਮੇਰੀ ਨਾਨੀ ਕਹਿੰਦੇ ਹੁੰਦੇ ਸੀ ਕਿ ਹਰ ਧਾਗਾ ਇੱਕ ਕਹਾਣੀ ਬੁਣਦਾ ਹੈ। ਜਦੋਂ ਅਸੀਂ ਬਾਗ਼ ਦੀ ਕੱਢਾਈ ਕਰਦੇ ਹਾਂ, ਤਾਂ ਅਸੀਂ ਸਿਰਫ਼ ਕੱਪੜੇ ਤੇ ਰੰਗ ਨਹੀਂ ਭਰਦੇ, ਅਸੀਂ ਆਪਣੇ ਸੁਪਨੇ, ਆਪਣੀਆਂ ਆਸਾਂ ਅਤੇ ਆਪਣਾ ਪਿਆਰ ਉਸ ਵਿੱਚ ਗੁੰਦਦੇ ਹਾਂ...
                    </p>
                  )}
                  {activeLang === 'hi' && (
                    <p>
                      फुलकारी सिर्फ कढ़ाई नहीं, यह हमारी रूह का हिस्सा है। मेरी नानी कहती थीं कि हर धागा एक कहानी बुनता है। जब हम बाघ की कढ़ाई करते हैं, तो हम सिर्फ कपड़े पर रंग नहीं भरते, हम अपने सपने, अपनी उम्मीदें और अपना प्यार उसमें गूंथते हैं...
                    </p>
                  )}
                  {activeLang === 'en' && (
                    <p>
                      Phulkari is not just embroidery, it is a part of our soul. My grandmother used to say that every thread weaves a story. When we do the Bagh embroidery, we don't just fill colors on the cloth, we weave our dreams, our hopes, and our love into it...
                    </p>
                  )}
                </div>
              </div>
            </Reveal>

            {/* About this story */}
            <Reveal delay={300}>
              <div className="prose prose-maroon max-w-none">
                <h3 className="font-serif text-2xl text-maroon mb-4">About this story</h3>
                <p className="text-ink/80">
                  Bibi Surjit Kaur, age 78, demonstrates the traditional Bagh stitch, a specific style of Phulkari where the embroidery covers the entire fabric so that the base cloth is completely hidden. She recalls how these garments were traditionally woven by women for special occasions and weddings, carrying not just aesthetic value but also familial blessings.
                </p>
                <div className="mt-8 p-4 bg-parchment rounded-xl border border-maroon/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-sm text-ink/80">
                    <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center text-maroon">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold block">Location — Patiala, Punjab</span>
                      <span className="text-ink/60 text-xs">Recorded at Village Chappar</span>
                    </div>
                  </div>
                  <Link to="/map" className="text-terracotta hover:text-maroon text-sm font-medium flex items-center gap-1.5 transition-colors">
                    Explore on Heritage Map <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sidebar Metadata (Right 30%) */}
          <div className="lg:col-span-4 space-y-6">
            <Reveal delay={200}>
              {/* Heritage Context */}
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-6">Heritage Context</h3>
                
                <dl className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">Tradition</dt>
                    <dd className="font-medium text-maroon">Phulkari</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">Category</dt>
                    <dd className="font-medium text-maroon">Craft & Tradition</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">Region</dt>
                    <dd className="font-medium text-maroon">Patiala, Punjab</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">Language</dt>
                    <dd className="font-medium text-maroon">Punjabi</dd>
                  </div>
                  <div className="grid grid-cols-2 border-b border-maroon/5 pb-4">
                    <dt className="text-ink/60">Period</dt>
                    <dd className="font-medium text-maroon">Traditional, documented 2026</dd>
                  </div>
                  <div className="grid grid-cols-2">
                    <dt className="text-ink/60">Contributor</dt>
                    <dd className="font-medium text-maroon">Surjit Kaur</dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            <Reveal delay={300}>
              {/* Verification Status */}
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm">
                <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-4">Verification Status</h3>
                
                <div className="flex items-start gap-3 bg-[#E8F3EA] text-[#2C5E3B] p-3 rounded-lg mb-4">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sm block">Community Reviewed</span>
                    <span className="text-xs opacity-80 leading-tight block mt-1">This story has been verified by 3 local knowledge keepers in the Patiala district.</span>
                  </div>
                </div>

                <div className="text-[10px] text-ink/50 bg-parchment p-3 rounded border border-maroon/10">
                  <strong className="text-maroon font-semibold">Disclaimer:</strong> AI-assisted translations and transcripts represent AI output and not necessarily historical fact. Original audio is preserved for accuracy.
                </div>
              </div>
            </Reveal>

            <Reveal delay={400}>
              {/* Related Tradition */}
              <div className="bg-white rounded-2xl border border-maroon/10 p-6 shadow-sm hover:border-terracotta/50 transition-colors cursor-pointer group">
                <h3 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-4">Related Tradition</h3>
                
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-maroon/10 rounded-lg overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1605380536761-e0e90c213af3?w=200&h=200&fit=crop" alt="Embroidery" className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="font-serif text-maroon font-medium group-hover:text-terracotta transition-colors">Phulkari Embroidery</h4>
                    <p className="text-xs text-ink/60 mt-1 line-clamp-2">Learn about the history, stitches, and cultural significance of this Punjab craft.</p>
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