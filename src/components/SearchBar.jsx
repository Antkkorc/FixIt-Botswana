import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchBar({
  service,
  setService,
  location,
  setLocation,
  onSearch,
  services,
  areas,
  className,
}) {
  return (
    <div className={cn("rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-xl p-2 flex flex-col sm:flex-row gap-2 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.7)]", className)}>
      <div className="flex-1 flex items-center gap-2 px-4 min-w-0">
        <Search size={18} className="text-white/50 shrink-0" />
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="bg-transparent w-full text-white py-2.5 outline-none appearance-none [&>option]:bg-slate-900 cursor-pointer"
        >
          <option value="">All services</option>
          {services.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block w-px bg-white/10 my-2" />
      <div className="flex-1 flex items-center gap-2 px-4 min-w-0">
        <MapPin size={18} className="text-white/50 shrink-0" />
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-transparent w-full text-white py-2.5 outline-none appearance-none [&>option]:bg-slate-900 cursor-pointer"
        >
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <button
        onClick={onSearch}
        className="rounded-full px-7 py-3 text-white font-medium bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_8px_24px_-8px_rgba(34,211,238,0.6)] active:scale-95 transition-all duration-200 shrink-0"
      >
        Search
      </button>
    </div>
  );
}