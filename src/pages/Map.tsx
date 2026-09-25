import { useState } from "react";
import { Search, MapPin, Clock, Filter, Navigation, X } from "lucide-react";
import { Link } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom colored icons
const createIcon = (color: string) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const icons = {
  "Oral History": createIcon("#3B82F6"), // Blue
  "Craft & Tradition": createIcon("#C9622E"), // Terracotta/Orange
  "Folk Song": createIcon("#10B981"), // Green
  "Living Tradition": createIcon("#D97706"), // Gold
};

const mapCenter: [number, number] = [31.1471, 75.3412]; // Punjab region

export default function Map() {
  const [showMigrationPath, setShowMigrationPath] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Oral History", "Craft & Tradition", "Folk Song", "Living Tradition"];

  const stories = [
    {
      id: "lahore-amritsar",
      title: "Lahore Se Amritsar — 1947 Ki Yaadein",
      tag: "Oral History",
      loc: "Amritsar, Punjab",
      coords: [31.6340, 74.8723] as [number, number],
      preview: "Partition memory from a family that crossed the border in August 1947.",
    },
    {
      id: "phulkari",
      title: "Phulkari — Mere Nani Ki Ungliyon Ki Kala",
      tag: "Craft & Tradition",
      loc: "Patiala, Punjab",
      coords: [30.3398, 76.3869] as [number, number],
      preview: "Bibi Surjit Kaur, age 78, demonstrates the traditional Bagh stitch.",
    },
    {
      id: "mirza-sahiban",
      title: "Mirza Sahiban",
      tag: "Folk Song",
      loc: "Jalandhar, Punjab",
      coords: [31.3260, 75.5762] as [number, number],
      preview: "A traditional rendition of the Mirza Sahiban folk love tragedy.",
    },
    {
      id: "vaisakhi",
      title: "Vaisakhi Mele Ki Paramparaa",
      tag: "Living Tradition",
      loc: "Anandpur Sahib, Punjab",
      coords: [31.2343, 76.4996] as [number, number],
      preview: "Documentation of the annual Vaisakhi gathering rituals.",
    },
  ];

  const migrationPath: [number, number][] = [
    [31.5204, 74.3587], // Lahore
    [31.57, 74.6],
    [31.6340, 74.8723], // Amritsar
  ];

  const filteredStories = activeFilter === "All" 
    ? stories 
    : stories.filter(s => s.tag === activeFilter);

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] w-full overflow-hidden bg-parchment">
      {/* Sidebar */}
      <div className="w-full md:w-[340px] bg-[#FBF7EE] border-r border-maroon/10 flex flex-col z-[1000] shadow-xl md:overflow-hidden shrink-0 order-2 md:order-1 relative">
        <div className="p-5 border-b border-maroon/10">
          <h2 className="font-serif text-2xl text-maroon mb-4">Heritage Map</h2>
          
          <p className="text-xs text-ink/70 mb-4 font-medium">Punjab · Haryana · Delhi pilot region. Click any pin to preview a story.</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 border rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === filter 
                    ? "bg-maroon text-white border-maroon" 
                    : "bg-white border-maroon/20 text-ink/70 hover:text-maroon hover:border-maroon/40"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-maroon/10">
            <span className="text-xs font-medium text-ink/80 max-w-[200px]">
              Partition migration path (Lahore ↔ Amritsar · Historical reference)
            </span>
            <button 
              onClick={() => setShowMigrationPath(!showMigrationPath)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer ${showMigrationPath ? 'bg-terracotta' : 'bg-maroon/20'}`}
            >
              <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${showMigrationPath ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredStories.map((story) => (
            <div key={story.id} className="p-3 border border-maroon/10 rounded-lg hover:border-terracotta/50 hover:bg-parchment/30 transition-all cursor-pointer group">
              <div className="text-[10px] font-bold uppercase tracking-wider text-terracotta mb-1">{story.tag}</div>
              <h4 className="font-serif text-[15px] leading-tight text-maroon group-hover:text-terracotta transition-colors mb-2">{story.title}</h4>
              <div className="flex items-center gap-1 text-xs text-ink/60">
                <MapPin className="w-3 h-3" /> {story.loc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-[#e3dcc8] min-h-[60vh] md:min-h-0 order-1 md:order-2 z-0">
        
        {/* Top Banner Alert */}
        <div className="absolute top-0 left-0 right-0 bg-turmeric/90 backdrop-blur text-ink text-xs font-medium py-2 px-4 text-center z-[1000] shadow-sm border-b border-turmeric/50 flex justify-center items-center gap-2">
          Historical reference — Partition migration paths are approximate, based on community memory, not verified historical routes.
        </div>

        <MapContainer 
          center={mapCenter} 
          zoom={8} 
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          {/* Free publicly accessible basemap (CartoDB Positron) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {showMigrationPath && (
            <Polyline 
              positions={migrationPath} 
              pathOptions={{ color: "#A83E22", weight: 3, dashArray: "5, 10" }} 
            />
          )}

          {filteredStories.map((story) => (
            <Marker 
              key={story.id} 
              position={story.coords} 
              icon={icons[story.tag as keyof typeof icons] || icons["Oral History"]}
            >
              <Popup className="heritage-popup" closeButton={false}>
                <div className="p-1 max-w-[220px]">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">{story.tag}</div>
                  <h4 className="font-serif text-sm leading-tight text-maroon mb-2">{story.title}</h4>
                  <p className="text-xs text-ink/70 mb-3 leading-snug">{story.preview}</p>
                  <Link to={`/story/${story.id}`} className="text-xs text-terracotta font-medium hover:text-maroon flex items-center gap-1 transition-colors">
                    Read full story &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-maroon/10 z-[1000] w-64">
          <h4 className="text-xs font-bold tracking-widest text-maroon/60 uppercase mb-3">Story Types</h4>
          <div className="space-y-2 text-xs text-ink/80">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6] border border-white shadow-sm" /> Oral History
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C9622E] border border-white shadow-sm" /> Craft & Tradition
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981] border border-white shadow-sm" /> Folk Song
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#D97706] border border-white shadow-sm" /> Living Tradition
            </div>
            {showMigrationPath && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-maroon/10 text-[11px]">
                <div className="w-8 border-t-2 border-dashed border-[#A83E22]" /> Partition Path
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .leaflet-container {
          background: #e3dcc8;
        }
        .heritage-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          border: 1px solid rgba(122, 31, 53, 0.1);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .heritage-popup .leaflet-popup-content {
          margin: 12px;
        }
        .heritage-popup .leaflet-popup-tip {
          background: white;
          border-top: 1px solid rgba(122, 31, 53, 0.1);
          border-left: 1px solid rgba(122, 31, 53, 0.1);
        }
        .leaflet-control-container {
          display: none;
        }
      `}</style>
    </div>
  );
}