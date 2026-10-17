import { Star, MapPin, BadgeCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard";
import ServiceIcon from "./ServiceIcon";
import { formatCurrency } from '@/utils/formatCurrency';
import { useLocalization } from '@/lib/LocalizationProvider';

export default function ProviderCard({ provider }) {
  const { t } = useLocalization();

  return (
    <Link to={`/provider/${provider.id}`} className="block group h-full">
      <GlassCard className="p-5 h-full group-hover:bg-white/[0.08] group-hover:-translate-y-1 group-hover:shadow-[0_22px_55px_-22px_rgba(34,211,238,0.55)]">
        <div className="flex items-start gap-4">
          <ServiceIcon category={provider.service_category} className="w-14 h-14 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-white truncate">{provider.name}</h3>
              {provider.verified && <BadgeCheck size={16} className="text-cyan-400 shrink-0" />}
            </div>
            <p className="text-sm text-white/60">{provider.service_category}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-white/70">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{provider.area}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-white">{provider.rating?.toFixed(1) ?? "—"}</span>
            <span className="text-xs text-white/50">({provider.review_count ?? 0})</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">{formatCurrency(provider.base_price ?? 0)}</span>
            <a href={`https://wa.me/${provider.phone}`} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1">
              Message
            </a>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
