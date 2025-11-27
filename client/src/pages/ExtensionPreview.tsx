import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Globe, Mail, Phone, Server, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Company {
  name: string;
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  hr_email?: string;
  source: string;
}

export default function ExtensionPreview() {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    // Simulate backend check
    const timer = setTimeout(() => {
        setBackendStatus("disconnected"); // In preview we assume disconnected
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const searchCompanies = async () => {
    if (!query.trim()) return;
    setLoading(true);

    // Simulate API Call latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // MOCK DATA GENERATOR (Matching the logic in popup.js)
    const mockData: Company[] = [
      {
        name: `Infotech Solutions ${query}`,
        address: `102, Silicon Valley Complex, ${query}, Ahmedabad`,
        phone: "+91 98765 43210",
        website: "https://infotech-demo.com",
        email: "contact@infotech-demo.com",
        hr_email: "hr@infotech-demo.com",
        source: "Google"
      },
      {
        name: `CyberWeb Systems`,
        address: `Opp. City Mall, ${query} Main Road`,
        phone: "+91 98989 89898",
        website: "https://cyberweb.io",
        email: "info@cyberweb.io",
        hr_email: "careers@cyberweb.io",
        source: "JustDial"
      },
      {
        name: `DevX Digital Labs`,
        address: `4th Floor, Tech Park, Near ${query} Circle`,
        phone: "079-23232323",
        website: "https://devx-labs.com",
        email: "hello@devx-labs.com",
        hr_email: "jobs@devx-labs.com",
        source: "Sulekha"
      },
      {
        name: `Global IT Services`,
        address: `Block B, Commerce Six Roads, ${query}`,
        phone: "+91 99000 99000",
        website: "https://global-it.net",
        hr_email: "hr@global-it.net",
        source: "IndiaMart"
      }
    ];

    setCompanies(mockData);
    setLoading(false);
    toast({
        title: "Scraping Complete",
        description: `Found ${mockData.length} companies in ${query}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[380px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-100 text-center">
          <h2 className="font-bold text-lg text-blue-600">IT Company Finder</h2>
          <p className="text-xs text-slate-500">Powered by Web Scraping</p>
        </div>

        {/* Search Section */}
        <div className="p-4 bg-white border-b border-slate-100 shadow-sm z-10">
          <div className="mb-3 relative">
             <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
             <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchCompanies()}
                placeholder="Enter location (e.g. Vastral)"
                className="pl-9 h-10"
              />
          </div>

          <div className="flex items-center justify-center gap-2 mb-3 text-[11px] text-slate-500">
             <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
             <span>Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected (Preview Mode)'}</span>
          </div>

          <Button 
            onClick={searchCompanies} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scraping Directories...
                </>
            ) : "Search IT Companies"}
          </Button>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 bg-slate-50 p-4">
          {companies.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 mt-8">
                <Search className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Enter a location to scrape real data.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
                {companies.map((company, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{company.name}</h3>
                            <Badge variant="secondary" className="text-[9px] h-5 bg-blue-50 text-blue-600 hover:bg-blue-50">
                                {company.source}
                            </Badge>
                        </div>

                        <div className="space-y-1.5 mb-3">
                            <div className="flex items-start gap-2 text-xs text-slate-500">
                                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{company.address}</span>
                            </div>
                            {company.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{company.phone}</span>
                                </div>
                            )}
                            {company.website && (
                                <div className="flex items-center gap-2 text-xs text-blue-600">
                                    <Globe className="w-3.5 h-3.5" />
                                    <a href={company.website} target="_blank" className="hover:underline truncate max-w-[200px]">
                                        {company.website}
                                    </a>
                                </div>
                            )}
                        </div>

                        {(company.hr_email || company.email) && (
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                                {[company.hr_email, company.email].filter(Boolean).map((email, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 text-[10px] rounded border border-amber-100 cursor-pointer hover:bg-amber-100"
                                          onClick={() => {
                                              navigator.clipboard.writeText(email!);
                                              toast({ description: "Email copied!" });
                                          }}>
                                        <Mail className="w-3 h-3 mr-1" />
                                        {email}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-3 flex gap-2">
                             <Button variant="outline" size="sm" className="flex-1 h-7 text-xs bg-slate-50" onClick={() => window.open(`https://www.google.com/search?q=${company.name}`, '_blank')}>
                                Google Search
                             </Button>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </ScrollArea>

        <div className="bg-yellow-50 p-2 text-[10px] text-yellow-800 text-center border-t border-yellow-100">
            Preview Mode. Download "extension" folder for real backend code.
        </div>

      </div>
    </div>
  );
}
