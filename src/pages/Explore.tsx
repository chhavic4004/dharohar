import { useState } from "react";
import { Link } from "react-router";
import { Search, ChevronDown, Grid, List, MapPin, Clock, ShieldCheck, Cpu } from "lucide-react";
import { Reveal } from "../components/Reveal";
import phulkariPhoto from "@/imports/Gemini_Generated_Image_xlttxrxlttxrxltt.png";
import vaisakhiPhoto from "@/imports/image.png";


export default function Explore() {
  const [activeTab, setActiveTab] = useState("All");
  
  const stories = [
    {
      id: "1",
      title: "Lahore Se Amritsar — 1947 Ki Yaadein",
      location: "Amritsar, Punjab",
      lang: "Punjabi",
      duration: "07:23",
      reviewed: true,
      tag: "Oral History",
      image: "https://images.unsplash.com/photo-1757960892265-9ffef99a4f41?w=800&h=600&fit=crop&auto=format"
    },
    {
      id: "2",
      title: "Phulkari — Mere Nani Ki Ungliyon Ki Kala",
      location: "Patiala, Punjab",
      lang: "Punjabi",
      duration: "12:47",
      reviewed: true,
      tag: "Craft & Tradition",
      link: "/explore/phulkari",
      image: phulkariPhoto
    },
    {
      id: "3",
      title: "Mirza Sahiban — Ludhiane Da Lok Geet",
      location: "Ludhiana, Punjab",
      lang: "Punjabi",
      duration: "05:12",
      reviewed: false,
      tag: "Folk Song",
      image: "https://images.unsplash.com/photo-1752760023111-aed0c41f11f9?w=800&h=600&fit=crop&auto=format"
    },
    {
      id: "4",
      title: "Vaisakhi Mele Ki Paramparaa",
      location: "Amritsar, Punjab",
      lang: "Hindi",
      duration: "09:34",
      reviewed: false,
      tag: "Living Tradition",
      image: vaisakhiPhoto
    },
    {
      id: "5",
      title: "Dilli Ke Mohalle Ka Kissa — Shahjahanabad",
      location: "Delhi",
      lang: "Hindi",
      duration: "14:02",
      reviewed: true,
      tag: "Oral History",
      image: "https://images.unsplash.com/photo-1595931848923-43c037a114d1?w=800&h=600&fit=crop&auto=format"
    }
  ];

  const filteredStories = activeTab === "All" ? stories : stories.filter(s => s.tag === activeTab);

  return (
    <div className="flex-1 bg-[#FBF7EE] py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="mb-10 text-center md:text-left">
            <span className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-2 block">LIVING ARCHIVE</span>
            <h1 className="font-serif text-4xl md:text-5xl text-maroon mb-4">Explore Heritage</h1>
            <p className="text-lg text-ink/70 max-w-3xl mx-auto md:mx-0">
              Search and discover preserved oral histories, crafts, folk songs and living traditions from across Punjab, Haryana and Delhi.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-4 w-5 h-5 text-ink/40" />
            <input 
              type="text" 
              placeholder='Search "Phulkari embroidery" or "Partition memories"...' 
              className="w-full bg-white border border-maroon/20 rounded-xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-terracotta transition-colors shadow-sm"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {["All", "Oral History", "Craft & Tradition", "Folk Song", "Living Tradition"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === tab ? "bg-maroon text-white" : "bg-white border border-maroon/10 text-ink/70 hover:border-maroon/30"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-maroon/10 rounded-lg text-sm text-ink/70 hover:border-maroon/30 cursor-pointer">
                All Regions <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-maroon/10 rounded-lg text-sm text-ink/70 hover:border-maroon/30 cursor-pointer">
                All Languages <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-maroon/10 rounded-lg text-sm text-ink/70 hover:border-maroon/30 cursor-pointer">
                All Status <ChevronDown className="w-4 h-4" />
              </button>
              <div className="hidden sm:flex items-center gap-1 ml-2 border-l border-maroon/10 pl-3">
                <button className="p-1.5 text-maroon bg-maroon/5 rounded"><Grid className="w-4 h-4" /></button>
                <button className="p-1.5 text-ink/40 hover:text-maroon rounded"><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          
          <div className="text-sm font-medium text-ink/60 mb-6">{filteredStories.length} stories found</div>
        </Reveal>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredStories.map((story, i) => (
            <Reveal key={story.id} delay={i * 50}>
              <Link 
                to={story.link || `/story/${story.id}`}
                className="block bg-white border border-maroon/10 rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:border-terracotta/40 transition-all duration-300 cursor-pointer group h-full flex flex-col"
              >
                <div className="w-full aspect-[4/3] bg-maroon/5 overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-1 rounded">
                      {story.tag}
                    </span>
                    {story.reviewed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#2C5E3B] bg-[#E8F3EA] px-2 py-1 rounded">
                        <ShieldCheck className="w-3 h-3" /> Community Reviewed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-turmeric bg-turmeric/10 px-2 py-1 rounded">
                        <Cpu className="w-3 h-3" /> AI-assisted
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-serif text-xl text-maroon mb-4 group-hover:text-terracotta transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-maroon/5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink/60">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {story.location}</span>
                    <span className="flex items-center gap-1">{story.lang}</span>
                    <span className="flex items-center gap-1 ml-auto font-medium text-maroon/70"><Clock className="w-3.5 h-3.5" /> {story.duration}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Documented Traditions */}
        <Reveal>
          <div className="border-t border-maroon/10 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="font-serif text-2xl text-maroon">Documented Traditions</h2>
              <Link to="/dashboard" className="text-terracotta text-sm font-medium hover:text-maroon transition-colors flex items-center gap-1">
                View vitality dashboard &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/dashboard/phulkari" className="bg-white border border-maroon/10 rounded-xl p-4 hover:border-terracotta/50 transition-colors group">
                <h4 className="font-serif text-maroon font-medium mb-2 group-hover:text-terracotta">Phulkari</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  <span className="text-xs font-bold text-ink/80">72 — Stable</span>
                </div>
                <div className="text-xs text-ink/60">34 stories · Punjab</div>
              </Link>
              
              <div className="bg-white border border-maroon/10 rounded-xl p-4 hover:border-terracotta/50 transition-colors group cursor-pointer">
                <h4 className="font-serif text-maroon font-medium mb-2 group-hover:text-terracotta line-clamp-1">Punjabi Wedding Folk Songs</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
                  <span className="text-xs font-bold text-ink/80">42 — Vulnerable</span>
                </div>
                <div className="text-xs text-ink/60">18 stories · Punjab, Haryana</div>
              </div>
              
              <div className="bg-white border border-maroon/10 rounded-xl p-4 hover:border-terracotta/50 transition-colors group cursor-pointer">
                <h4 className="font-serif text-maroon font-medium mb-2 group-hover:text-terracotta line-clamp-1">Traditional Village Storytelling</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                  <span className="text-xs font-bold text-ink/80">26 — Needs Attention</span>
                </div>
                <div className="text-xs text-ink/60">9 stories</div>
              </div>
              
              <div className="bg-white border border-maroon/10 rounded-xl p-4 hover:border-terracotta/50 transition-colors group cursor-pointer">
                <h4 className="font-serif text-maroon font-medium mb-2 group-hover:text-terracotta line-clamp-1">Partition Oral Histories</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                  <span className="text-xs font-bold text-ink/80">31 — Needs Attention</span>
                </div>
                <div className="text-xs text-ink/60">12 stories</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}