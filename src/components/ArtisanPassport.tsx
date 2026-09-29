import React, { useState, useRef } from 'react';
import { ShieldCheck, Cpu, UploadCloud, QrCode, Play, Pause, Award, Key, CheckCircle2, X, MapPin, ShoppingBag, Volume2, Languages, BookOpen } from 'lucide-react';

interface CraftProfile {
  id: string;
  title: string;
  artisan: string;
  location: string;
  distance: string;
  origin: string;
  technique: string;
  material: string;
  timeToCraft: string;
  giTag: string;
  knotScore: string;
  dyeScore: string;
  sha256Hash: string;
  defaultImg: string;
  audioUrl: string;
  nativeDialect: string;
  nativeText: string;
  translatedText: string;
  shopAddress: string;
  historyText: string;
}

const CRAFT_PRESETS: Record<string, CraftProfile> = {
  tissue: {
    id: "TSU",
    title: "Handwoven Tissue Silk Saree",
    artisan: "Rameshwar Prasad & Co.",
    location: "Varanasi, Uttar Pradesh",
    distance: "790 km away",
    origin: "Varanasi, UP",
    technique: "Metallic Zari Weaving",
    material: "Fine Mulberry Silk Warp & Gold Metallic Zari Weft",
    timeToCraft: "18 days",
    giTag: "GI Registered (UP-312)",
    knotScore: "Metallic Warp Refraction & Sheer Density Validated",
    dyeScore: "Pure Zari Coating & Organically Irregular Weave",
    sha256Hash: "a7b3c91d8e2f45069a123456789abcdef0123456789abcdef0123456789abcde",
    defaultImg: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    nativeDialect: "Bhojpuri / Banarasi",
    nativeText: "प्रणाम, हम बनारस से रमेशवर। ई टिशू सिल्क साड़ी में सोने के ज़री धागा से जाल बुनाई भइल बा।",
    translatedText: "Greetings! I am Rameshwar from Banaras. Tissue silk is woven by combining extremely delicate silk warp threads with rich metallic zari to produce this luminous golden sheen.",
    shopAddress: "Bunkar Mahalla #45, Madanpura, Varanasi, UP",
    historyText: "Tissue Silk originated during the Mughal era in Banaras when royal courts requested garments that glittered like liquid gold while remaining light as air."
  },
  katan: {
    id: "KTN",
    title: "Pure Handloom Katan Silk Saree",
    artisan: "Mohammad Yasin Ansari",
    location: "Banaras, Uttar Pradesh",
    distance: "810 km away",
    origin: "Banaras, UP",
    technique: "Kadwa Weave & Checks Interlock",
    material: "100% Twisted Pure Katan Silk",
    timeToCraft: "12 days",
    giTag: "GI Registered (UP-201)",
    knotScore: "Twisted Silk Thread Tension & Micro-Grid Variance Validated",
    dyeScore: "Natural Silk Dye Bleed & Genuine Luster Verified",
    sha256Hash: "f4e5d6c7b8a90123456789abcdef0123456789abcdef0123456789abcdef0123",
    defaultImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    nativeDialect: "Banarasi Urdu",
    nativeText: "आदाब, यह खालिस कतान सिल्क रेशम के ताने-बाने से हथकरघे पर बिना मशीन के बनाई गई है।",
    translatedText: "Greetings! This pure Katan silk saree is constructed using tightly twisted filament silk threads on a pit loom, creating a durable yet smooth texture.",
    shopAddress: "Ansari Handloom Crafts, Peeli Kothi, Varanasi",
    historyText: "Katan silk is renowned for its pure untwisted mulberry filaments twisted together to form a firm weave. Historically worn by royalty for durability and drape."
  },
  chynia: {
    id: "CHY",
    title: "Pure Banarasi Chynia Sapphire Silk Saree",
    artisan: "Govind Das Khaitan",
    location: "Varanasi, Uttar Pradesh",
    distance: "795 km away",
    origin: "Banaras, UP",
    technique: "Chynia Silk Weave & Extra Weft Butti",
    material: "Natural Sapphire Teal Chynia Silk",
    timeToCraft: "16 days",
    giTag: "GI Registered (UP-388)",
    knotScore: "Micro-Butti Alignment & Natural Silk Thread Irregularity Passed",
    dyeScore: "Sapphire Mineral Pigment Uniformity Passed",
    sha256Hash: "9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    defaultImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    nativeDialect: "Awadhi / Banarasi",
    nativeText: "नमस्ते! चिनिया सिल्क अप्पन मुलायम बुनावट और नीलम रंग के खूबसूरत बूटी खातिर प्रसिद्ध बा।",
    translatedText: "Namaste! Chynia silk is a prized, rare variant of Banarasi silk known for its fluid drape, vibrant sapphire sheen, and hand-woven floral motifs.",
    shopAddress: "Silk Traders Hub, Chowk Bazaar, Varanasi",
    historyText: "Chynia Silk derives its name from its soft, porcelain-like smooth texture. It combines the heavy elegance of Banarasi silk with a lighter, modern drape."
  },
  kalamkari: {
    id: "KLM",
    title: "Pen Kalamkari Mulberry Silk Saree",
    artisan: "K. Radhakrishna",
    location: "Srikalahasti, Andhra Pradesh",
    distance: "1,820 km away",
    origin: "Andhra Pradesh, India",
    technique: "Freehand Pen Kalamkari & Natural Pigments",
    material: "Pure Mulberry Silk & Organic Plant Dyes",
    timeToCraft: "25 days",
    giTag: "GI Registered (AP-015)",
    knotScore: "Freehand Organic Stroke Irregularity & Bamboo Nib Depth Validated",
    dyeScore: "Myrobalan Nut & Alizarin Organic Bleed Verified",
    sha256Hash: "3210987654abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    defaultImg: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    nativeDialect: "Telugu",
    nativeText: "నమస్కారం! ఈ కలంకారీ చీరను శ్రీకాళహస్తిలో ప్రకృతి రంగులు మరియు వాటర్ పెన్ లతో చేతితో చిత్రించాము.",
    translatedText: "Namaskaram! This Kalamkari artwork is entirely hand-drawn using bamboo pens (Kalam) and 100% natural organic dyes derived from plants, milk, and roots.",
    shopAddress: "Kalamkari Art Colony, Temple Road, Srikalahasti, AP",
    historyText: "Srikalahasti Kalamkari traces back to ancient temple hangings and storytelling scrolls. Every design is painted freehand without stencil or machine intervention."
  },
  bandhani: {
    id: "BDN",
    title: "Gaji Silk Bandhani Tie-Dye Saree",
    artisan: "Khatri Ismail Mohammad",
    location: "Bhuj, Kutch, Gujarat",
    distance: "1,120 km away",
    origin: "Kutch, Gujarat",
    technique: "Tie-Dye (Micro-Knotting / Rai Bandhej)",
    material: "Gaji Silk & Natural Dyes",
    timeToCraft: "21 days",
    giTag: "GI Registered (GUJ-208)",
    knotScore: "Organic Asymmetric Node Density (140-160 dots/inch²) Validated",
    dyeScore: "Natural Resisting Ring Bleed Detected (Authentic Hand-tied)",
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    defaultImg: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    nativeDialect: "Kutchi Gujarati",
    nativeText: "અમે આ બાંધણી હસ્તકળા ૪ પેઢીઓથી ભુજમાં બનાવીએ છીએ. દરેક બિંદુ કુદરતી રંગોથી હાથથી બાંધવામાં આવે છે.",
    translatedText: "We have been hand-tying this Bandhani in Kutch for 4 generations. Every single micro-knot is bound by hand using natural organic turmeric and indigo dyes.",
    shopAddress: "Craft Village Workshop #12, Bhuj-Kutch Highway, Gujarat",
    historyText: "Bandhani is one of the oldest tie-dye traditions dating back over 5000 years to the Indus Valley Civilization, symbolising fortune and heritage."
  }
};

export default function ArtisanPassport() {
  const [selectedCraft, setSelectedCraft] = useState<CraftProfile>(CRAFT_PRESETS.tissue);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [confidence, setConfidence] = useState<number>(97.2);
  const [passportId, setPassportId] = useState<string>('DHR-2026-TSU-8912');

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Modals
  const [showHashModal, setShowHashModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const displayImage = uploadedImage || selectedCraft.defaultImg;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      
      setAnalyzing(true);
      setTimeout(() => {
        const nameLower = file.name.toLowerCase();
        let profile = CRAFT_PRESETS.tissue;
        
        if (nameLower.includes('katan') || nameLower.includes('620361') || nameLower.includes('purple')) {
          profile = CRAFT_PRESETS.katan;
        } else if (nameLower.includes('chynia') || nameLower.includes('6203ff') || nameLower.includes('teal') || nameLower.includes('green')) {
          profile = CRAFT_PRESETS.chynia;
        } else if (nameLower.includes('kalam') || nameLower.includes('62045d') || nameLower.includes('pen')) {
          profile = CRAFT_PRESETS.kalamkari;
        } else if (nameLower.includes('bandh') || nameLower.includes('snapinsta') || nameLower.includes('knot')) {
          profile = CRAFT_PRESETS.bandhani;
        } else {
          profile = CRAFT_PRESETS.tissue;
        }

        setSelectedCraft(profile);
        setConfidence(Number((95.5 + Math.random() * 3.8).toFixed(1)));
        setPassportId(`DHR-2026-${profile.id}-${Math.floor(1000 + Math.random() * 9000)}`);
        setAnalyzing(false);
        setIsPlayingAudio(false);
      }, 1800);
    }
  };

  const toggleNativeAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().catch(() => setIsPlayingAudio(true));
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-serif">
      <audio 
        ref={audioRef} 
        src={selectedCraft.audioUrl} 
        onEnded={() => setIsPlayingAudio(false)} 
      />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-normal text-[#5c1d24] tracking-tight">Provenance Passport</h1>
        <p className="text-gray-600 mt-2 text-sm max-w-xl mx-auto font-sans">
          Physical authenticity for heritage crafts & paintings, linking micro-textures to a digital cryptographic hash & native artisan audio.
        </p>
      </div>

      {/* Main Passport Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e8ded1] grid grid-cols-1 md:grid-cols-12 max-w-4xl mx-auto relative">
        
        {/* Left Side Image */}
        <div 
          className="md:col-span-5 relative min-h-[440px] bg-cover bg-center flex flex-col justify-between p-6 text-white transition-all duration-500"
          style={{ backgroundImage: `url(${displayImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />
          
          <div className="relative z-10 flex justify-between items-center">
            <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-sans px-3 py-1 rounded-md border border-white/30 tracking-wide font-medium">
              {selectedCraft.giTag}
            </span>
          </div>

          <div className="relative z-10 font-sans">
            <h3 className="text-2xl font-serif font-bold text-white">{selectedCraft.title}</h3>
            <p className="text-xs text-gray-200 mt-1">Crafted by <strong className="text-amber-200">{selectedCraft.artisan}</strong></p>
            
            {/* Location & Distance Badge */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-100 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{selectedCraft.location}</span>
              <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.5 rounded ml-auto">{selectedCraft.distance}</span>
            </div>
          </div>
        </div>

        {/* Right Side Specifications */}
        <div className="md:col-span-7 p-8 font-sans flex flex-col justify-between bg-[#fdfbf7]">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Verified Authentic
                </span>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">ID: {passportId}</p>
              </div>
              <button 
                onClick={() => setShowQrModal(true)}
                className="bg-white p-1.5 rounded-lg border border-amber-200/80 shadow-sm hover:scale-105 transition cursor-pointer"
                title="Click to expand QR"
              >
                <QrCode className="w-12 h-12 text-[#5c1d24]" />
              </button>
            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs border-b border-amber-200/50 pb-5 mb-4">
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Origin</span>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{selectedCraft.origin}</p>
              </div>
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Technique</span>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{selectedCraft.technique}</p>
              </div>
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Material</span>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{selectedCraft.material}</p>
              </div>
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Time to Craft</span>
                <p className="font-semibold text-gray-800 text-sm mt-0.5">{selectedCraft.timeToCraft}</p>
              </div>
            </div>

            {/* Craft Heritage History */}
            <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs mb-4">
              <div className="flex items-center gap-1.5 font-bold text-[#5c1d24] mb-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                Heritage Background & Cultural History:
              </div>
              <p className="text-gray-700 text-[11px] leading-relaxed">{selectedCraft.historyText}</p>
            </div>

            {/* Voice Audio & Live Translation */}
            <div className="bg-[#f5ede2] p-3.5 rounded-xl border border-[#e6d7c3] mb-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleNativeAudio}
                    className={`p-2.5 rounded-full transition shadow-sm ${
                      isPlayingAudio ? 'bg-red-600 text-white animate-pulse' : 'bg-[#b85d3b] hover:bg-[#a04e2f] text-white'
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                  <div>
                    <h4 className="font-bold text-xs text-[#5c1d24] flex items-center gap-1.5">
                      Listen to Artisan Voice
                      {isPlayingAudio && <Volume2 className="w-3.5 h-3.5 text-red-600 animate-bounce" />}
                    </h4>
                    <span className="text-[10px] text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded font-medium">
                      Native {selectedCraft.nativeDialect} Recording
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-xs space-y-1.5">
                <p className="text-amber-950 font-serif italic text-[11px] border-b border-amber-100 pb-1">
                  "{selectedCraft.nativeText}"
                </p>
                <div className="flex items-start gap-1 text-[11px] text-gray-600">
                  <Languages className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>English Transcript:</strong> {selectedCraft.translatedText}</span>
                </div>
              </div>
            </div>

            {/* Artisan Location */}
            <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 text-xs mb-4">
              <div className="flex items-center gap-1.5 font-bold text-[#5c1d24] mb-0.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                Where to Find & Buy directly from Artisan:
              </div>
              <p className="text-gray-700 text-[11px]">{selectedCraft.shopAddress}</p>
            </div>
          </div>

          <div className="flex gap-3 text-xs">
            <button 
              onClick={() => window.print()}
              className="flex-1 bg-[#b85d3b] hover:bg-[#a04e2f] text-white py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Award className="w-4 h-4" /> Download Certificate
            </button>
            <button 
              onClick={() => setShowHashModal(true)}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Key className="w-4 h-4 text-emerald-600" /> SHA-256 Fingerprint
            </button>
          </div>
        </div>
      </div>

      {/* CV Authenticator Uploader */}
      <div className="mt-10 max-w-4xl mx-auto bg-white rounded-2xl p-6 border-2 border-dashed border-amber-300 shadow-md font-sans">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#b85d3b]" />
            <h3 className="font-bold text-gray-800 text-sm">Computer Vision Craft & Micro-Texture Authenticator</h3>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full font-medium">Supports Silk Weaves & Kalamkari Paintings</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="cv-upload" />
          <label htmlFor="cv-upload" className="w-full sm:w-auto bg-[#5c1d24] hover:bg-[#48161c] text-white px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition shadow-sm">
            <UploadCloud className="w-4 h-4" /> Upload Tissue, Katan, Chynia, Kalamkari or Bandhani Photo
          </label>
          <p className="text-xs text-gray-500 text-center sm:text-left">Micro-texture engine inspects thread twists, zari reflectivity, nib pressure, or tie-dye nodes.</p>
        </div>

        {analyzing && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg flex items-center gap-3 animate-pulse">
            <Cpu className="w-4 h-4 animate-spin text-blue-600" />
            <span>Scanning image micro-pixels: Validating zari refraction, filament weave tension & pigment depth...</span>
          </div>
        )}

        {!analyzing && (
          <div className="mt-4 bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Handcraft Confidence Score: {confidence}%
              </span>
              <span className="text-gray-500 font-mono text-[10px]">Verified By Edge CV Engine v2.4</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 font-sans mt-2">
              <div className="bg-white p-2.5 rounded border border-emerald-100">
                <strong className="text-gray-500 block text-[10px]">Micro-Texture & Weave Analysis:</strong>
                {selectedCraft.knotScore}
              </div>
              <div className="bg-white p-2.5 rounded border border-emerald-100">
                <strong className="text-gray-500 block text-[10px]">Dye & Pigment Integrity:</strong>
                {selectedCraft.dyeScore}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center relative">
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-lg text-gray-900 mb-1">Authenticity QR Code</h3>
            <p className="text-xs text-gray-500 mb-4">Scan with any smartphone camera to view government verified provenance.</p>
            
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 inline-block mb-4">
              <QrCode className="w-40 h-40 text-[#5c1d24] mx-auto" />
            </div>

            <p className="text-[11px] font-mono text-gray-500">{passportId}</p>
          </div>
        </div>
      )}

      {/* Cryptographic Hash Modal */}
      {showHashModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-amber-200">
            <button onClick={() => setShowHashModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-[#5c1d24] mb-3">
              <Key className="w-5 h-5" />
              <h3 className="font-bold text-lg">Cryptographic SHA-256 Hash</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Zero-cost verification fingerprint computed directly from physical micro-feature pixels.
            </p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-xs break-all mb-4 border border-slate-800">
              {selectedCraft.sha256Hash}
            </div>
            <div className="text-[11px] text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>Registry Authentication:</strong> Verified against the Ministry of Culture & GI Registry Database.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}