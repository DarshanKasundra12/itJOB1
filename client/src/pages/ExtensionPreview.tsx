import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Globe, Mail, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Fix Leaflet icons in React
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Map Controller to handle view changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 14);
  }, [center, map]);
  return null;
}

interface Company {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    "addr:postcode"?: string;
    website?: string;
  };
}

export default function ExtensionPreview() {
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<[number, number]>([23.0225, 72.5714]); // Default Ahmedabad
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Fetch IP Location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setCenter([data.latitude, data.longitude]);
          setQuery(data.city || "");
          // Auto search
          searchCompanies(data.latitude, data.longitude);
        }
      } catch (err) {
        console.error("Failed to fetch IP location", err);
        toast({
            title: "Location Error",
            description: "Could not detect location automatically. Using default.",
            variant: "destructive"
        });
      } finally {
        setLocationLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const searchPlace = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCenter([lat, lon]);
        searchCompanies(lat, lon);
      } else {
        toast({
            title: "Not Found",
            description: "Could not find that place. Try a different name.",
            variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
          title: "Error",
          description: "Search failed.",
          variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async (lat: number, lon: number) => {
    // Overpass API
    const overpassQuery = `[out:json];node["office"="it"](around:3000,${lat},${lon});out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      overpassQuery
    )}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setCompanies(data.elements || []);
      if (data.elements.length === 0) {
        toast({
            title: "No Results",
            description: "No IT companies found within 3km.",
        });
      }
    } catch (err) {
      console.error("Overpass Error", err);
    }
  };

  const generateEmails = (name: string, website?: string) => {
    let domain = "";
    if (website) {
      try {
        // Basic URL cleanup
        const cleanUrl = website.startsWith("http") ? website : `http://${website}`;
        domain = new URL(cleanUrl).hostname.replace("www.", "");
      } catch (e) {
        domain = website.split("/")[0];
      }
    } else if (name) {
      domain = name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
    }

    if (!domain) return [];
    return [`hr@${domain}`, `careers@${domain}`];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white shadow-md z-10">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            IT Company Finder
          </h1>
          <p className="text-blue-100 text-xs mt-1">Chrome Extension Preview</p>
        </div>

        {/* Search */}
        <div className="p-3 bg-white border-b border-slate-100 flex gap-2 z-10">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPlace()}
            placeholder="Enter place (e.g. Vastral)"
            className="h-9 text-sm"
          />
          <Button
            size="sm"
            onClick={searchPlace}
            disabled={loading || locationLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Map */}
        <div className="h-[250px] w-full relative z-0">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} />
            
            {/* User Marker */}
            <Marker position={center} icon={blueIcon}>
              <Popup>Search Location</Popup>
            </Marker>

            {/* Company Markers */}
            {companies.map((company) => (
              <Marker
                key={company.id}
                position={[company.lat, company.lon]}
                icon={redIcon}
              >
                <Popup>
                  <div className="font-semibold">{company.tags.name || "IT Company"}</div>
                  <div className="text-xs text-gray-500 truncate w-32">
                    {company.tags["addr:street"]}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 bg-slate-50">
          <div className="p-0">
            <div className="bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
              Nearby IT Companies ({companies.length})
            </div>
            
            {companies.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-400 text-sm">
                No companies found in this area.
              </div>
            )}

            <ul className="divide-y divide-slate-100">
              {companies.map((company) => {
                const name = company.tags.name || "Unknown Company";
                const address = [
                    company.tags["addr:street"],
                    company.tags["addr:city"]
                ].filter(Boolean).join(", ") || "Address unavailable";
                const website = company.tags.website;
                const emails = generateEmails(name, website);

                return (
                  <li
                    key={company.id}
                    className="p-4 hover:bg-blue-50 transition-colors cursor-pointer group bg-white"
                    onClick={() => setCenter([company.lat, company.lon])}
                  >
                    <div className="font-semibold text-slate-800 mb-1 group-hover:text-blue-700">
                      {name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-start gap-1.5 mb-2">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        {address}
                    </div>
                    
                    {website && (
                        <div className="text-xs text-blue-600 flex items-center gap-1.5 mb-2">
                            <Globe className="w-3 h-3" />
                            <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">
                                {website}
                            </a>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {emails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          {email}
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </ScrollArea>
        
        <div className="bg-yellow-50 p-2 text-[10px] text-yellow-800 text-center border-t border-yellow-100">
            Preview Mode. Actual extension files are in /extension folder.
        </div>
      </div>
    </div>
  );
}
