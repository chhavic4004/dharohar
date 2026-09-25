import { useState } from "react";
import { Camera, Volume2, MessageSquare, Info, History, MapPin } from "lucide-react";

export default function ARWalk() {
  const [activeTab, setActiveTab] = useState("story");

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-ink text-parchment md:overflow-hidden md:h-[calc(100vh-64px)]">
      {/* AR Viewfinder Area */}
      <div className="flex-1 relative border-b md:border-b-0 md:border-r border-parchment/10 min-h-[45vh] md:min-h-0 bg-ink">
        <img
          src="https://images.unsplash.com/photo-1695395550316-8995ae9d35ff?q=80&w=2000&auto=format&fit=crop"
          alt="Hawa Mahal, the Palace of Winds in Jaipur"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        
        {/* Viewfinder Brackets */}
        <div className="absolute inset-6 border-2 border-transparent border-t-parchment/50 border-l-parchment/50 w-16 h-16" />
        <div className="absolute inset-6 right-6 border-2 border-transparent border-t-parchment/50 border-r-parchment/50 w-16 h-16 left-auto" />
        <div className="absolute inset-6 bottom-6 border-2 border-transparent border-b-parchment/50 border-l-parchment/50 w-16 h-16 top-auto" />
        <div className="absolute inset-6 bottom-6 right-6 border-2 border-transparent border-b-parchment/50 border-r-parchment/50 w-16 h-16 top-auto left-auto" />

        {/* Overlay Tags */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-parchment/10 backdrop-blur-md border border-parchment/30 text-xs px-3 py-1.5 rounded-full font-mono text-turmeric flex items-center gap-2">
          <span className="w-2 h-2 bg-turmeric rounded-full animate-pulse" /> AR Overlay Detected
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-center">
          <div className="bg-ink/60 backdrop-blur-lg border border-parchment/20 rounded-full px-6 py-3 text-xs text-parchment/70 flex items-center gap-2">
            <Camera className="w-4 h-4 text-parchment" /> Simulated AR for demo — full build anchors to a live camera feed
          </div>
        </div>

        {/* Hotspot */}
        <button className="absolute top-1/2 left-1/2 w-10 h-10 bg-white/20 backdrop-blur-md border-2 border-white rounded-full flex items-center justify-center animate-bounce hover:scale-110 transition-transform">
          <div className="w-2 h-2 bg-white rounded-full" />
        </button>
      </div>

      {/* Info Panel */}
      <div className="w-full md:w-[400px] bg-ink flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-parchment/10">
          <h2 className="font-serif text-3xl text-parchment mb-2">Hawa Mahal</h2>
          <div className="flex items-center gap-2 text-sm text-turmeric mb-6">
            <MapPin className="w-4 h-4" /> Jaipur, Rajasthan
          </div>
          
          <button className="w-full bg-parchment text-ink py-3 rounded font-medium hover:bg-parchment/90 transition-colors flex justify-center items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5" /> Ghost Guide (Hindi/English)
          </button>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-parchment/5 p-1 rounded-lg">
            {[
              { id: "story", label: "Story", icon: <Info className="w-4 h-4" /> },
              { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
              { id: "chat", label: "Ask", icon: <MessageSquare className="w-4 h-4" /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors ${
                  activeTab === tab.id ? "bg-ink text-turmeric shadow-sm" : "text-parchment/60 hover:text-parchment hover:bg-parchment/10"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          {activeTab === "story" && (
            <div className="space-y-4">
              <p className="text-parchment/80 leading-relaxed font-light">
                Known as the "Palace of Winds", it was built from red and pink sandstone. Its five-floor exterior is akin to the honeycomb of a beehive with its 953 small windows called Jharokhas.
              </p>
              <p className="text-parchment/80 leading-relaxed font-light">
                The original intent was to allow royal ladies to observe everyday life and festivals celebrated in the street below without being seen.
              </p>
            </div>
          )}
          
          {activeTab === "history" && (
            <div className="space-y-4 text-parchment/80">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-parchment/10">
                <div>
                  <div className="text-xs text-parchment/50 uppercase">Built By</div>
                  <div>Maharaja Sawai Pratap Singh</div>
                </div>
                <div>
                  <div className="text-xs text-parchment/50 uppercase">Year</div>
                  <div>1799</div>
                </div>
              </div>
              <p className="font-light text-sm">Designed by Lal Chand Ustad in the form of the crown of Krishna.</p>
            </div>
          )}
          
          {activeTab === "chat" && (
            <div className="flex flex-col h-full space-y-4">
              <div className="bg-parchment/10 p-4 rounded-lg rounded-tl-none border border-parchment/20 text-sm text-parchment/90">
                I am the spirit of the Lal Chand Ustad, the architect. Ask me anything about this palace.
              </div>
              
              <div className="flex justify-end">
                <button className="bg-turmeric/20 text-turmeric border border-turmeric/30 px-3 py-1.5 rounded-full text-sm hover:bg-turmeric/30 transition-colors">
                  Why are the pillars hollow here?
                </button>
              </div>
              
              <div className="mt-auto">
                <input 
                  type="text" 
                  placeholder="Ask this place a question..." 
                  className="w-full bg-parchment/5 border border-parchment/20 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-turmeric transition-colors text-parchment"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
