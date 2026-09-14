import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, MapPin, Navigation, Search,
  Loader2, LocateFixed, X, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { osmService, type MedicalFacility } from "@/lib/osm-service";
import { cn } from "@/lib/utils";

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const typeColors: Record<string, string> = {
  hospital: "bg-red-50 text-red-700 border-red-200",
  clinic: "bg-emerald-50 text-emerald-700 border-emerald-200",
  doctor: "bg-blue-50 text-blue-700 border-blue-200",
  pharmacy: "bg-amber-50 text-amber-700 border-amber-200",
};

const typeIcon: Record<string, string> = {
  hospital: "🏥",
  clinic: "🩺",
  doctor: "👨‍⚕️",
  pharmacy: "💊",
};

const markerColor: Record<string, string> = {
  hospital: "#E53E3E",
  clinic: "#05050a",
  doctor: "#4c6ef5",
  pharmacy: "#F59E0B",
};

function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090]; // New Delhi default
const FILTERS = ["all", "hospital", "clinic", "pharmacy", "doctor"] as const;
type Filter = typeof FILTERS[number];

export default function MapPage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<MedicalFacility[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [selected, setSelected] = useState<MedicalFacility | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchFacilities = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const data = await osmService.fetchNearbyFacilities(lat, lon, 5000);
      setFacilities(data);
    } catch {
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setMapCenter(coords);
        setLocating(false);
        fetchFacilities(coords[0], coords[1]);
      },
      () => {
        setLocating(false);
        fetchFacilities(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      },
      { timeout: 8000 }
    );
  };

  useEffect(() => {
    locate();
  }, []);

  const selectFacility = (f: MedicalFacility) => {
    setSelected(f);
    setMapCenter([f.lat, f.lon]);
    cardRefs.current[f.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const filtered = facilities
    .filter(f => filter === "all" || f.type === filter)
    .filter(f => !query || f.name.toLowerCase().includes(query.toLowerCase()) || f.address.toLowerCase().includes(query.toLowerCase()));

  return (
    <DashboardLayout currentRole="patient">
      <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05050a] text-[#b8ff00] text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-3 h-3 text-[#b8ff00]" />
              <span>Geolocation Radar</span>
            </div>
            <h1 className="text-[34px] sm:text-[42px] font-black tracking-tighter text-[#05050a] leading-none" style={{ fontFamily: "var(--font-display)" }}>
              Nearby Healthcare
            </h1>
            <p className="text-[14px] text-[#8a8a8a] mt-1 font-medium">
              Locate verified hospitals, clinics, and pharmacies with OpenStreetMap.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={locate}
              disabled={locating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#05050a] text-[12px] font-bold text-[#b8ff00] hover:scale-105 transition-all shadow-md"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
              <span>{locating ? "Locating…" : "My GPS"}</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/5 bg-white text-[12px] font-bold text-[#05050a] hover:bg-black/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>

        {/* Map & Facility Split Container */}
        <div className="premium-card rounded-[32px] overflow-hidden border border-black/5 flex flex-col md:flex-row h-[calc(100vh-230px)] min-h-[600px]">
          {/* Left panel: facility list */}
          <div className="w-full md:w-[400px] shrink-0 flex flex-col border-r border-black/[0.04] bg-white overflow-hidden">
            {/* Search & Filter pills */}
            <div className="p-4 space-y-3 border-b border-black/[0.04] shrink-0 bg-[#fafaf8]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search facilities by name or area…"
                  className="pl-10 h-10 text-[13px] rounded-xl border-black/5 focus:border-[#05050a] bg-white text-[#05050a]"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-[#8a8a8a]" />
                  </button>
                )}
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {FILTERS.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all",
                      filter === t
                        ? "bg-[#05050a] text-[#b8ff00]"
                        : "bg-white border border-black/5 text-[#8a8a8a] hover:text-[#05050a]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-black/[0.03]">
              {loading && (
                <div className="flex items-center justify-center p-12 text-[#8a8a8a] gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">Scanning area…</span>
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="p-12 text-center text-[#8a8a8a] text-xs font-medium">
                  No medical facilities found in this area. Try searching another location or expanding radius.
                </div>
              )}

              <AnimatePresence>
                {filtered.map(f => (
                  <motion.div
                    key={f.id}
                    ref={el => { cardRefs.current[f.id] = el; }}
                    onClick={() => selectFacility(f)}
                    className={cn(
                      "p-4 transition-all cursor-pointer hover:bg-black/[0.02]",
                      selected?.id === f.id && "bg-[#05050a]/[0.03] border-l-4 border-l-[#05050a]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-lg shrink-0">
                        {typeIcon[f.type] ?? "🏥"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="font-black text-[14px] text-[#05050a] truncate" style={{ fontFamily: "var(--font-display)" }}>
                            {f.name}
                          </h3>
                          <span className="text-[9px] font-black uppercase text-[#05050a] bg-[#b8ff00] px-2 py-0.5 rounded shrink-0">
                            {f.distance < 1 ? `${Math.round(f.distance * 1000)}m` : `${f.distance.toFixed(1)}km`}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#8a8a8a] line-clamp-1">{f.address || "Local Healthcare Provider"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pl-12">
                      <button
                        className="px-3 py-1.5 rounded-lg border border-black/5 bg-white text-[11px] font-bold text-[#05050a] hover:bg-black/5 transition-all flex items-center gap-1"
                        onClick={e => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`, "_blank");
                        }}
                      >
                        <Navigation className="w-3 h-3 text-[#4c6ef5]" /> Directions
                      </button>
                      <button
                        className="px-3 py-1.5 rounded-lg bg-[#05050a] text-[11px] font-bold text-[#b8ff00] hover:scale-105 transition-all flex items-center gap-1"
                        onClick={e => { e.stopPropagation(); selectFacility(f); }}
                      >
                        <MapPin className="w-3 h-3" /> Focus
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="px-4 py-2.5 border-t border-black/[0.04] bg-[#fafaf8] shrink-0 text-[11px] text-[#8a8a8a] font-medium flex items-center justify-between">
              <span>{filtered.length} facilities verified</span>
              <span>OpenStreetMap</span>
            </div>
          </div>

          {/* Right panel: Leaflet Map */}
          <div className="hidden md:block flex-1 relative h-full">
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ width: "100%", height: "100%" }}
              zoomControl
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <FlyTo position={selected ? [selected.lat, selected.lon] : userPos} />

              {/* User location pulse marker */}
              {userPos && (
                <Marker
                  position={userPos}
                  icon={L.divIcon({
                    className: "",
                    html: `<div style="width:16px;height:16px;background:#05050a;border:3px solid #b8ff00;border-radius:50%;box-shadow:0 0 0 6px rgba(184,255,0,0.3)"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  })}
                >
                  <Popup><b>📍 Your Current Location</b></Popup>
                </Marker>
              )}

              {/* Facility markers */}
              {filtered.map(f => (
                <Marker
                  key={f.id}
                  position={[f.lat, f.lon]}
                  icon={L.divIcon({
                    className: "",
                    html: `<div style="
                      background:${markerColor[f.type] ?? "#05050a"};
                      color:white;font-size:15px;
                      width:34px;height:34px;
                      border-radius:50% 50% 50% 0;
                      transform:rotate(-45deg);
                      display:flex;align-items:center;justify-content:center;
                      border:2px solid white;
                      box-shadow:0 3px 10px rgba(0,0,0,0.3);
                      ${selected?.id === f.id ? "outline:3px solid #b8ff00;outline-offset:2px;" : ""}
                    "><span style="transform:rotate(45deg)">${typeIcon[f.type] ?? "🏥"}</span></div>`,
                    iconSize: [34, 34],
                    iconAnchor: [17, 34],
                    popupAnchor: [0, -36],
                  })}
                  eventHandlers={{ click: () => selectFacility(f) }}
                >
                  <Popup>
                    <div style={{ minWidth: 190, fontFamily: "Inter, sans-serif" }}>
                      <p style={{ fontWeight: 800, fontSize: 13, color: "#05050a", marginBottom: 2 }}>{f.name}</p>
                      {f.address && <p style={{ fontSize: 11, color: "#8a8a8a" }}>{f.address}</p>}
                      <p style={{ fontSize: 11, color: "#05050a", marginTop: 4, fontWeight: 700 }}>
                        {f.distance < 1 ? `${Math.round(f.distance * 1000)}m away` : `${f.distance.toFixed(1)}km away`}
                      </p>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`, "_blank")}
                        style={{
                          marginTop: 8, width: "100%", fontSize: 11, fontWeight: 700,
                          background: "#05050a", color: "#b8ff00",
                          border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer"
                        }}
                      >
                        Navigate via Google Maps
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
