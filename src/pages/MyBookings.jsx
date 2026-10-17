import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import {
  CalendarClock,
  FileText,
  ShieldCheck,
  Receipt,
  Clock,
  CheckCircle2,
  Inbox,
  Loader2,
} from "lucide-react";

export default function MyBookings() {
  const [tab, setTab] = useState("upcoming");
  const [quotes, setQuotes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [q, b] = await Promise.all([
          base44.entities.QuoteRequest.filter({}, { sort: "-created_date", limit: 50 }),
          base44.entities.Booking.filter({}, { sort: "-date", limit: 50 }),
        ]);
        setQuotes(q.items);
        setBookings(b.items);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const upcoming = bookings.filter((b) => b.status === "scheduled");
  const history = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto pt-10 pb-16">
      <h1 className="text-3xl sm:text-4xl font-bold">My bookings</h1>
      <p className="text-white/55 mt-2">Appointments, quote requests, and your service history — all in one place.</p>

      <div className="flex gap-1 mt-8 mb-6 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit">
        {[
          { key: "upcoming", label: "Upcoming", icon: CalendarClock },
          { key: "quotes", label: "Quote requests", icon: Inbox },
          { key: "history", label: "Service history", icon: Receipt },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all duration-200 ${
              tab === t.key ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-white shadow-[0_6px_20px_-8px_rgba(34,211,238,0.6)]" : "text-white/60 hover:text-white"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-cyan-400" size={26} />
        </div>
      ) : tab === "upcoming" ? (
        upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No upcoming appointments"
            text="Book a verified provider and your appointment will appear here with a reminder."
            cta="Find a provider"
            to="/browse"
          />
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <GlassCard key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/15 flex items-center justify-center shrink-0">
                  <CalendarClock size={20} className="text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{b.service}</h3>
                    <span className="text-xs rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 px-2.5 py-0.5">Scheduled</span>
                  </div>
                  <p className="text-sm text-white/60 mt-0.5">with {b.provider_name}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/70">
                    <span className="inline-flex items-center gap-1.5"><CalendarClock size={13} className="text-cyan-400" /> {b.date}{b.time ? ` · ${b.time}` : ""}</span>
                    {b.location && <span>{b.location}</span>}
                  </div>
                </div>
                {b.price != null && (
                  <div className="text-right">
                    <p className="text-xs text-white/50">Quoted</p>
                    <p className="font-semibold">P{b.price}</p>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )
      ) : tab === "quotes" ? (
        quotes.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No quote requests yet"
            text="Request quotes from multiple providers to compare prices before you book."
            cta="Browse providers"
            to="/browse"
          />
        ) : (
          <div className="space-y-4">
            {quotes.map((q) => (
              <GlassCard key={q.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{q.service_needed}</h3>
                    <p className="text-sm text-white/60 mt-0.5">to {q.provider_name}</p>
                  </div>
                  <StatusPill status={q.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-sm text-white/70">
                  <span>{q.location}</span>
                  {q.preferred_date && <span className="inline-flex items-center gap-1.5"><Clock size={13} className="text-cyan-400" /> {q.preferred_date}</span>}
                </div>
                {q.description && <p className="text-sm text-white/55 mt-2">{q.description}</p>}
                {q.quoted_price != null && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-sm">
                    <FileText size={14} className="text-cyan-400" /> Quoted price: <span className="font-semibold">P{q.quoted_price}</span>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No service history yet"
          text="Completed jobs, invoices, and warranties will be recorded here for your records."
          cta="Find a provider"
          to="/browse"
        />
      ) : (
        <div className="space-y-4">
          {history.map((b) => (
            <GlassCard key={b.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{b.service}</h3>
                    {b.status === "completed" ? (
                      <span className="text-xs rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-200 px-2.5 py-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    ) : (
                      <span className="text-xs rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 px-2.5 py-0.5">Cancelled</span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 mt-0.5">with {b.provider_name} · {b.date}</p>
                </div>
                {b.price != null && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-white/50">Invoice</p>
                    <p className="font-semibold">P{b.price}</p>
                  </div>
                )}
              </div>
              {b.warranty && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-sm">
                  <ShieldCheck size={14} className="text-cyan-400" /> Warranty: {b.warranty}
                </div>
              )}
              {b.notes && <p className="text-sm text-white/55 mt-2">{b.notes}</p>}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: "bg-amber-400/15 border-amber-400/30 text-amber-200",
    responded: "bg-cyan-400/15 border-cyan-400/30 text-cyan-200",
    accepted: "bg-emerald-400/15 border-emerald-400/30 text-emerald-200",
    declined: "bg-rose-400/15 border-rose-400/30 text-rose-200",
  };
  return (
    <span className={`text-xs rounded-full border px-3 py-1 capitalize shrink-0 ${map[status] || "bg-white/10 border-white/15 text-white/70"}`}>
      {status}
    </span>
  );
}

function EmptyState({ icon: Icon, title, text, cta, to }) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/15 flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-cyan-300" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-white/55 text-sm mt-1.5 max-w-sm mx-auto">{text}</p>
      {cta && (
        <GlassButton as={Link} to={to} className="mt-6">
          {cta}
        </GlassButton>
      )}
    </GlassCard>
  );
}