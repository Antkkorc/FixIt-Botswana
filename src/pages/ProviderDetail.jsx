import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ServiceIcon from "@/components/ServiceIcon";
import {
  Star,
  MapPin,
  BadgeCheck,
  Phone,
  Clock,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  Send,
  CalendarPlus,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // quote form
  const [qf, setQf] = useState({ customer_name: "", customer_phone: "", service_needed: "", location: "", description: "", preferred_date: "" });
  // booking form
  const [bf, setBf] = useState({ customer_name: "", service: "", location: "", date: "", time: "", notes: "" });

  useEffect(() => {
    (async () => {
      try {
        const p = await base44.entities.Provider.get(id);
        setProvider(p);
        const { items } = await base44.entities.Review.filter({ provider_id: id }, { sort: "-created_date", limit: 50 });
        setReviews(items);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [id]);

  const submitQuote = async () => {
    if (!qf.customer_name || !qf.customer_phone || !qf.service_needed || !qf.location) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.QuoteRequest.create({
        provider_id: id,
        provider_name: provider.name,
        ...qf,
        status: "pending",
      });
      toast({ title: "Quote request sent!", description: `${provider.name} will respond soon.` });
      setQuoteOpen(false);
      setQf({ customer_name: "", customer_phone: "", service_needed: "", location: "", description: "", preferred_date: "" });
    } catch (e) {
      toast({ title: "Something went wrong.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const submitBooking = async () => {
    if (!bf.customer_name || !bf.service || !bf.date) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Booking.create({
        provider_id: id,
        provider_name: provider.name,
        ...bf,
        status: "scheduled",
      });
      toast({ title: "Appointment booked!", description: "You'll get a reminder before the visit." });
      setBookOpen(false);
      setBf({ customer_name: "", service: "", location: "", date: "", time: "", notes: "" });
    } catch (e) {
      toast({ title: "Something went wrong.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={28} />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-white/70">Provider not found.</p>
        <GlassButton as={Link} to="/browse" className="mt-4">Back to browse</GlassButton>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto pt-8 pb-16">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6">
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <GlassCard strong className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <ServiceIcon category={provider.service_category} className="w-20 h-20 shrink-0" size={34} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">{provider.name}</h1>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-200 px-3 py-1 text-xs font-medium">
                  <BadgeCheck size={14} /> Verified
                </span>
              )}
            </div>
            <p className="text-white/60 mt-1">{provider.service_category}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-cyan-400" /> {provider.area}</span>
              <span className="inline-flex items-center gap-1.5"><Star size={14} className="fill-amber-400 text-amber-400" /> {provider.rating?.toFixed(1) ?? "—"} ({provider.review_count ?? 0} reviews)</span>
              <span className="inline-flex items-center gap-1.5"><Briefcase size={14} className="text-cyan-400" /> {provider.jobs_completed ?? 0} jobs done</span>
              {provider.years_experience && (
                <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-cyan-400" /> {provider.years_experience} yrs experience</span>
              )}
            </div>
            {provider.bio && <p className="text-white/70 mt-4 max-w-2xl">{provider.bio}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <GlassButton onClick={() => setQuoteOpen(true)} size="lg">
            <Send size={16} /> Request a quote
          </GlassButton>
          <GlassButton onClick={() => setBookOpen(true)} variant="glass" size="lg">
            <CalendarPlus size={16} /> Book appointment
          </GlassButton>
          {provider.phone && (
            <GlassButton as="a" href={`tel:${provider.phone}`} variant="outline" size="lg">
              <Phone size={16} /> {provider.phone}
            </GlassButton>
          )}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {/* Credentials */}
        <GlassCard className="p-6 md:col-span-1">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-cyan-400" /> Credentials
          </h2>
          {provider.credentials?.length ? (
            <ul className="space-y-2.5">
              {provider.credentials.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                  <BadgeCheck size={15} className="text-cyan-400 mt-0.5 shrink-0" /> {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/50">No credentials listed yet.</p>
          )}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/50">Response time</span>
              <span className="text-white/80">{provider.response_time || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Availability</span>
              <span className={provider.available ? "text-emerald-300" : "text-amber-300"}>
                {provider.available ? "Available now" : "Currently busy"}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Reviews */}
        <GlassCard className="p-6 md:col-span-2">
          <h2 className="font-semibold mb-4">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-white/50">No reviews yet — be the first to leave one after your job.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{r.customer_name}</span>
                    <span className="inline-flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < (r.rating || 0) ? "fill-amber-400 text-amber-400" : "text-white/20"} />
                      ))}
                    </span>
                  </div>
                  {r.job_type && <p className="text-xs text-cyan-300/80 mt-0.5">{r.job_type}</p>}
                  <p className="text-sm text-white/70 mt-2">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Quote dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="bg-white/[0.07] border border-white/15 backdrop-blur-2xl text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle>Request a quote from {provider.name}</DialogTitle>
            <DialogDescription className="text-white/55">
              Describe the job. The provider will respond with a price and availability.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Your name *">
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.customer_name} onChange={(e) => setQf({ ...qf, customer_name: e.target.value })} />
              </Field>
              <Field label="Phone *">
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.customer_phone} onChange={(e) => setQf({ ...qf, customer_phone: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Service needed *">
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" placeholder="e.g. Burst pipe" value={qf.service_needed} onChange={(e) => setQf({ ...qf, service_needed: e.target.value })} />
              </Field>
              <Field label="Location *">
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.location} onChange={(e) => setQf({ ...qf, location: e.target.value })} />
              </Field>
            </div>
            <Field label="Preferred date">
              <input type="date" className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.preferred_date} onChange={(e) => setQf({ ...qf, preferred_date: e.target.value })} />
            </Field>
            <Field label="Describe the job">
              <textarea rows={3} className="glass-input rounded-xl px-3 py-2.5 w-full text-sm resize-none" value={qf.description} onChange={(e) => setQf({ ...qf, description: e.target.value })} />
            </Field>
            <GlassButton onClick={submitQuote} className="w-full" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send request
            </GlassButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="bg-white/[0.07] border border-white/15 backdrop-blur-2xl text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle>Book an appointment with {provider.name}</DialogTitle>
            <DialogDescription className="text-white/55">
              Pick a date and time. You'll receive a reminder before the visit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Your name *">
              <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.customer_name} onChange={(e) => setBf({ ...bf, customer_name: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Service *">
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.service} onChange={(e) => setBf({ ...bf, service: e.target.value })} />
              </Field>
              <Field label="Location">
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.location} onChange={(e) => setBf({ ...bf, location: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Date *">
                <input type="date" className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.date} onChange={(e) => setBf({ ...bf, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <input type="time" className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.time} onChange={(e) => setBf({ ...bf, time: e.target.value })} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea rows={2} className="glass-input rounded-xl px-3 py-2.5 w-full text-sm resize-none" value={bf.notes} onChange={(e) => setBf({ ...bf, notes: e.target.value })} />
            </Field>
            <GlassButton onClick={submitBooking} className="w-full" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} Confirm booking
            </GlassButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-white/60 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}