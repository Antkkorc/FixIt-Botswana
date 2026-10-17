import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ServiceIcon from "@/components/ServiceIcon";
import {
  Inbox,
  CalendarClock,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  Power,
  Star,
  Phone,
  MapPin,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ProviderDashboard() {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.Provider.filter({}, { sort: "-rating", limit: 50 });
        setProviders(items);
        if (items.length) setActiveId(items[0].id);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      try {
        const [q, b] = await Promise.all([
          base44.entities.QuoteRequest.filter({ provider_id: activeId }, { sort: "-created_date", limit: 50 }),
          base44.entities.Booking.filter({ provider_id: activeId }, { sort: "-date", limit: 50 }),
        ]);
        setRequests(q.items);
        setBookings(b.items);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [activeId]);

  const active = providers.find((p) => p.id === activeId);

  const toggleAvailability = async () => {
    try {
      await base44.entities.Provider.update(activeId, { available: !active.available });
      setProviders((ps) => ps.map((p) => (p.id === activeId ? { ...p, available: !p.available } : p)));
      toast({ title: `You are now ${!active.available ? "available" : "busy"}.` });
    } catch (e) {
      toast({ title: "Could not update availability.", variant: "destructive" });
    }
  };

  const respond = async (req, status, price) => {
    setResponding(req.id);
    try {
      await base44.entities.QuoteRequest.update(req.id, {
        status,
        quoted_price: price != null ? Number(price) : req.quoted_price,
      });
      setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status, quoted_price: price != null ? Number(price) : r.quoted_price } : r)));
      toast({ title: status === "accepted" ? "Quote accepted." : "Quote sent." });
    } catch (e) {
      toast({ title: "Something went wrong.", variant: "destructive" });
    }
    setResponding(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-cyan-400" size={26} />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <GlassCard className="p-12">
          <h2 className="text-xl font-semibold">No provider profiles yet</h2>
          <p className="text-white/55 mt-2">Once providers are recruited and verified, they'll appear here to manage requests.</p>
        </GlassCard>
      </div>
    );
  }

  const upcoming = bookings.filter((b) => b.status === "scheduled");

  return (
    <div className="px-4 sm:px-6 max-w-6xl mx-auto pt-10 pb-16">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Provider dashboard</h1>
          <p className="text-white/55 mt-2">Manage your incoming requests, bookings, and availability.</p>
        </div>
        {active && (
          <GlassButton onClick={toggleAvailability} variant={active.available ? "gradient" : "glass"}>
            <Power size={16} /> {active.available ? "Available now" : "Mark as available"}
          </GlassButton>
        )}
      </div>

      {/* Provider selector */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6 -mx-1 px-1">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`shrink-0 rounded-2xl p-3 border transition-all duration-200 flex items-center gap-3 min-w-[220px] ${
              p.id === activeId ? "bg-white/[0.1] border-cyan-400/50 shadow-[0_0_30px_-12px_rgba(34,211,238,0.5)]" : "bg-white/5 border-white/10 hover:bg-white/[0.08]"
            }`}
          >
            <ServiceIcon category={p.service_category} className="w-10 h-10 shrink-0" size={18} />
            <div className="min-w-0 text-left">
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-xs text-white/50 truncate">{p.service_category}</p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Profile summary */}
          <GlassCard className="p-6 h-fit">
            <div className="flex items-center gap-3">
              <ServiceIcon category={active.service_category} className="w-14 h-14" />
              <div className="min-w-0">
                <h2 className="font-semibold truncate">{active.name}</h2>
                <p className="text-sm text-white/55">{active.service_category}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-white/70"><MapPin size={14} className="text-cyan-400" /> {active.area}</div>
              {active.phone && <div className="flex items-center gap-2 text-white/70"><Phone size={14} className="text-cyan-400" /> {active.phone}</div>}
              <div className="flex items-center gap-2 text-white/70"><Star size={14} className="fill-amber-400 text-amber-400" /> {active.rating?.toFixed(1) ?? "—"} ({active.review_count ?? 0})</div>
              <div className="flex items-center gap-2 text-white/70"><CheckCircle2 size={14} className="text-cyan-400" /> {active.jobs_completed ?? 0} jobs done</div>
            </div>
            <div className={`mt-4 rounded-2xl px-4 py-3 text-sm border ${active.available ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-200" : "bg-amber-400/10 border-amber-400/30 text-amber-200"}`}>
              {active.available ? "Available to take new requests" : "Currently marked busy"}
            </div>
          </GlassCard>

          {/* Incoming requests */}
          <div className="lg:col-span-2 space-y-5">
            <GlassCard className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <Inbox size={18} className="text-cyan-400" /> Incoming quote requests ({requests.length})
              </h2>
              {requests.length === 0 ? (
                <p className="text-sm text-white/50">No requests yet. Customers who request a quote from you will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((r) => (
                    <RequestRow key={r.id} req={r} responding={responding === r.id} onRespond={respond} />
                  ))}
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="font-semibold flex items-center gap-2 mb-4">
                <CalendarClock size={18} className="text-cyan-400" /> Upcoming bookings ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-white/50">No upcoming bookings.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div>
                        <p className="font-medium">{b.service}</p>
                        <p className="text-sm text-white/55">{b.customer_name} · {b.date}{b.time ? ` · ${b.time}` : ""}</p>
                      </div>
                      <span className="text-xs rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 px-3 py-1">Scheduled</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestRow({ req, responding, onRespond }) {
  const [price, setPrice] = useState(req.quoted_price ?? "");
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium">{req.service_needed}</h3>
          <p className="text-sm text-white/55 mt-0.5">{req.customer_name} · {req.customer_phone}</p>
        </div>
        <span className="text-xs rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 px-2.5 py-0.5 capitalize shrink-0">{req.status}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/65">
        <span>{req.location}</span>
        {req.preferred_date && <span>· pref. {req.preferred_date}</span>}
      </div>
      {req.description && <p className="text-sm text-white/55 mt-2">{req.description}</p>}

      {req.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/15 px-3 py-1.5">
            <span className="text-xs text-white/50">P</span>
            <input
              type="number"
              placeholder="Quote price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-transparent w-24 text-sm outline-none"
            />
          </div>
          <GlassButton size="sm" onClick={() => onRespond(req, "accepted", price)} disabled={responding}>
            {responding ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Accept & quote
          </GlassButton>
          <GlassButton size="sm" variant="glass" onClick={() => onRespond(req, "responded", price)} disabled={responding}>
            <Send size={14} /> Send price
          </GlassButton>
          <GlassButton size="sm" variant="ghost" onClick={() => onRespond(req, "declined")} disabled={responding}>
            <XCircle size={14} /> Decline
          </GlassButton>
        </div>
      )}
      {req.quoted_price != null && req.status !== "pending" && (
        <div className="mt-3 text-sm text-white/70">Quoted: <span className="font-semibold text-white">P{req.quoted_price}</span></div>
      )}
    </div>
  );
}