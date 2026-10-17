import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/GlassCard";
import ProviderCard from "@/components/ProviderCard";
import SearchBar from "@/components/SearchBar";
import { SERVICES, AREAS } from "./Home";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [service, setService] = useState(params.get("service") || "");
  const [location, setLocation] = useState(params.get("area") || "");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const query = {};
      if (service) query.service_category = service;
      if (location) query.area = location;
      if (verifiedOnly) query.verified = true;
      const { items } = await base44.entities.Provider.filter(query, {
        sort: "-rating",
        limit: 50,
      });
      setProviders(items);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, location, verifiedOnly]);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (service) p.set("service", service);
    if (location) p.set("area", location);
    setParams(p, { replace: true });
    load();
  };

  return (
    <div className="px-4 sm:px-6 max-w-6xl mx-auto pt-10 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold">Browse providers</h1>
        <p className="text-white/55 mt-2">
          Verified local professionals across Gaborone. Filter by service and area.
        </p>
      </div>

      <SearchBar
        service={service}
        setService={setService}
        location={location}
        setLocation={setLocation}
        onSearch={handleSearch}
        services={SERVICES}
        areas={AREAS}
      />

      <div className="flex items-center justify-between mt-6 mb-5">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <SlidersHorizontal size={15} />
          <span>{loading ? "Searching…" : `${providers.length} provider${providers.length === 1 ? "" : "s"} found`}</span>
        </div>
        <button
          onClick={() => setVerifiedOnly((v) => !v)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm border transition-all duration-200 active:scale-95 ${
            verifiedOnly
              ? "bg-cyan-400/20 border-cyan-400/50 text-cyan-200"
              : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10"
          }`}
        >
          <ShieldCheck size={15} /> Verified only
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-white/70 font-medium">No providers match your filters yet.</p>
          <p className="text-white/50 text-sm mt-1">
            We're starting small in Gaborone — try a different area or service.
          </p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </div>
  );
}