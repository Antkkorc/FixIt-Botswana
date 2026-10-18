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
import { useLocalization } from '@/lib/LocalizationProvider';
import { whatsappLink } from '@/utils/whatsapp';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();
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
      toast({ title: t('provider.fill_required') || "Please fill in all required fields.", variant: "destructive" });
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
      toast({ title: t('provider.request_sent') || "Quote request sent!", description: `${provider.name} ${t('provider.will_respond') || 'will respond soon.'}` });
      setQuoteOpen(false);
      setQf({ customer_name: "", customer_phone: "", service_needed: "", location: "", description: "", preferred_date: "" });
    } catch (e) {
      toast({ title: t('provider.error') || "Something went wrong.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const submitBooking = async () => {
    if (!bf.customer_name || !bf.service || !bf.date) {
      toast({ title: t('provider.fill_required') || "Please fill in all required fields.", variant: "destructive" });
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
      toast({ title: t('provider.booking_confirmed') || "Appointment booked!", description: t('provider.booking_reminder') || "You'll get a reminder before the visit." });
      setBookOpen(false);
      setBf({ customer_name: "", service: "", location: "", date: "", time: "", notes: "" });
    } catch (e) {
      toast({ title: t('provider.error') || "Something went wrong.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const openWhatsAppForProvider = () => {
    if (!provider?.phone) {
      toast({ title: t('provider.no_phone') || 'Provider phone number not available.', variant: 'destructive' });
      return;
    }
    const msg = `${t('provider.hi')} ${provider.name}! ${t('provider.inquiry_prefix') || 'I am interested in your services.'}`;
    window.open(whatsappLink(provider.phone, msg), '_blank');
  };

  const sendQuoteViaWhatsApp = () => {
    if (!provider?.phone) {
      toast({ title: t('provider.no_phone') || 'Provider phone number not available.', variant: 'destructive' });
      return;
    }
    const parts = [];
    parts.push(`${t('provider.quote_msg_intro') || 'Hello'} ${provider.name},`);
    if (qf.customer_name) parts.push(`${t('provider.customer_name_label') || 'Name'}: ${qf.customer_name}`);
    if (qf.customer_phone) parts.push(`${t('provider.customer_phone_label') || 'Phone'}: ${qf.customer_phone}`);
    if (qf.service_needed) parts.push(`${t('provider.service_label') || 'Service'}: ${qf.service_needed}`);
    if (qf.location) parts.push(`${t('provider.location_label') || 'Location'}: ${qf.location}`);
    if (qf.preferred_date) parts.push(`${t('provider.preferred_date_label') || 'Preferred date'}: ${qf.preferred_date}`);
    if (qf.description) parts.push(`${t('provider.notes_label') || 'Notes'}: ${qf.description}`);

    const message = parts.join(' \n');
    window.open(whatsappLink(provider.phone, message), '_blank');
  };

  const sendBookingViaWhatsApp = () => {
    if (!provider?.phone) {
      toast({ title: t('provider.no_phone') || 'Provider phone number not available.', variant: 'destructive' });
      return;
    }
    const parts = [];
    parts.push(`${t('provider.booking_msg_intro') || 'Hello'} ${provider.name},`);
    if (bf.customer_name) parts.push(`${t('provider.customer_name_label') || 'Name'}: ${bf.customer_name}`);
    if (bf.service) parts.push(`${t('provider.service_label') || 'Service'}: ${bf.service}`);
    if (bf.location) parts.push(`${t('provider.location_label') || 'Location'}: ${bf.location}`);
    if (bf.date) parts.push(`${t('provider.date_label') || 'Date'}: ${bf.date}`);
    if (bf.time) parts.push(`${t('provider.time_label') || 'Time'}: ${bf.time}`);
    if (bf.notes) parts.push(`${t('provider.notes_label') || 'Notes'}: ${bf.notes}`);

    const message = parts.join(' \n');
    window.open(whatsappLink(provider.phone, message), '_blank');
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
        <p className="text-white/70">{t('provider.not_found') || 'Provider not found.'}</p>
        <GlassButton as={Link} to="/browse" className="mt-4">{t('nav.browse') || 'Back to browse'}</GlassButton>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto pt-8 pb-16">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-6">
        <ArrowLeft size={15} /> {t('provider.back') || 'Back'}
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
                  <BadgeCheck size={14} /> {t('provider.verified')}
                </span>
              )}
            </div>
            <p className="text-white/60 mt-1">{provider.service_category}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-cyan-400" /> {provider.area}</span>
              <span className="inline-flex items-center gap-1.5"><Star size={14} className="fill-amber-400 text-amber-400" /> {provider.rating?.toFixed(1) ?? "—"} ({provider.review_count ?? 0})</span>
              <span className="inline-flex items-center gap-1.5"><Briefcase size={14} className="text-cyan-400" /> {provider.jobs_completed ?? 0} {t('provider.jobs_done') || 'jobs done'}</span>
              {provider.years_experience && (
                <span className="inline-flex items-center gap-1.5"><Clock size={14} className="text-cyan-400" /> {provider.years_experience} {t('provider.years_experience') || 'yrs experience'}</span>
              )}
            </div>
            {provider.bio && <p className="text-white/70 mt-4 max-w-2xl">{provider.bio}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <GlassButton onClick={() => setQuoteOpen(true)} size="lg">
            <Send size={16} /> {t('provider.request_quote')}
          </GlassButton>
          <GlassButton onClick={() => setBookOpen(true)} variant="glass" size="lg">
            <CalendarPlus size={16} /> {t('provider.book_appointment')}
          </GlassButton>
          {provider.phone && (
            <div className="flex items-center gap-2">
              <GlassButton as="a" href={`tel:${provider.phone}`} variant="outline" size="lg">
                <Phone size={16} /> {provider.phone}
              </GlassButton>
              <GlassButton onClick={openWhatsAppForProvider} variant="outline" size="lg">
                <Send size={16} /> {t('provider.message_whatsapp')}
              </GlassButton>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {/* Credentials */}
        <GlassCard className="p-6 md:col-span-1">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-cyan-400" /> {t('provider.credentials')}
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
            <p className="text-sm text-white/50">{t('provider.no_credentials')}</p>
          )}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/50">{t('provider.response_time')}</span>
              <span className="text-white/80">{provider.response_time || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">{t('provider.availability')}</span>
              <span className={provider.available ? "text-emerald-300" : "text-amber-300"}>
                {provider.available ? t('provider.available_now') : t('provider.currently_busy')}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Reviews */}
        <GlassCard className="p-6 md:col-span-2">
          <h2 className="font-semibold mb-4">{t('provider.reviews') || `Reviews (${reviews.length})`}</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-white/50">{t('provider.no_reviews') || 'No reviews yet — be the first to leave one after your job.'}</p>
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
            <DialogTitle>{t('provider.request_quote')} {provider.name}</DialogTitle>
            <DialogDescription className="text-white/55">
              {t('provider.quote_description') || 'Describe the job. The provider will respond with a price and availability.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t('provider.your_name') || 'Your name *'}>
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.customer_name} onChange={(e) => setQf({ ...qf, customer_name: e.target.value })} />
              </Field>
              <Field label={t('provider.phone') || 'Phone *'}>
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.customer_phone} onChange={(e) => setQf({ ...qf, customer_phone: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t('provider.service_needed') || 'Service needed *'}>
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" placeholder={t('provider.service_placeholder') || 'e.g. Burst pipe'} value={qf.service_needed} onChange={(e) => setQf({ ...qf, service_needed: e.target.value })} />
              </Field>
              <Field label={t('provider.location') || 'Location *'}>
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.location} onChange={(e) => setQf({ ...qf, location: e.target.value })} />
              </Field>
            </div>
            <Field label={t('provider.preferred_date') || 'Preferred date'}>
              <input type="date" className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={qf.preferred_date} onChange={(e) => setQf({ ...qf, preferred_date: e.target.value })} />
            </Field>
            <Field label={t('provider.describe_job') || 'Describe the job'}>
              <textarea rows={3} className="glass-input rounded-xl px-3 py-2.5 w-full text-sm resize-none" value={qf.description} onChange={(e) => setQf({ ...qf, description: e.target.value })} />
            </Field>
            <div className="flex gap-2">
              <GlassButton onClick={submitQuote} className="flex-1" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {t('provider.send_request') || 'Send request'}
              </GlassButton>
              <GlassButton onClick={sendQuoteViaWhatsApp} variant="outline" className="flex-1">
                <Send size={16} /> {t('provider.send_whatsapp') || 'Send via WhatsApp'}
              </GlassButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="bg-white/[0.07] border border-white/15 backdrop-blur-2xl text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t('provider.book_appointment')} {provider.name}</DialogTitle>
            <DialogDescription className="text-white/55">
              {t('provider.booking_description') || "Pick a date and time. You'll receive a reminder before the visit."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label={t('provider.your_name') || 'Your name *'}>
              <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.customer_name} onChange={(e) => setBf({ ...bf, customer_name: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t('provider.service') || 'Service *'}>
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.service} onChange={(e) => setBf({ ...bf, service: e.target.value })} />
              </Field>
              <Field label={t('provider.location') || 'Location'}>
                <input className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.location} onChange={(e) => setBf({ ...bf, location: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={t('provider.date') || 'Date *'}>
                <input type="date" className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.date} onChange={(e) => setBf({ ...bf, date: e.target.value })} />
              </Field>
              <Field label={t('provider.time') || 'Time'}>
                <input type="time" className="glass-input rounded-xl px-3 py-2.5 w-full text-sm" value={bf.time} onChange={(e) => setBf({ ...bf, time: e.target.value })} />
              </Field>
            </div>
            <Field label={t('provider.notes') || 'Notes'}>
              <textarea rows={2} className="glass-input rounded-xl px-3 py-2.5 w-full text-sm resize-none" value={bf.notes} onChange={(e) => setBf({ ...bf, notes: e.target.value })} />
            </Field>
            <div className="flex gap-2">
              <GlassButton onClick={submitBooking} className="flex-1" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />} {t('provider.confirm_booking') || 'Confirm booking'}
              </GlassButton>
              <GlassButton onClick={sendBookingViaWhatsApp} variant="outline" className="flex-1">
                <Send size={16} /> {t('provider.send_whatsapp') || 'Send via WhatsApp'}
              </GlassButton>
            </div>
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
