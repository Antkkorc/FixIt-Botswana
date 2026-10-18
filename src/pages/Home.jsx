import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/GlassCard";
import GlassButton from "@/components/GlassButton";
import ServiceIcon from "@/components/ServiceIcon";
import ProviderCard from "@/components/ProviderCard";
import SearchBar from "@/components/SearchBar";
import {
  ShieldCheck,
  FileText,
  CalendarClock,
  Bell,
  ArrowRight,
  Sparkles,
  Quote,
  CheckCircle2,
  HandCoins,
} from "lucide-react";
import { useLocalization } from '@/lib/LocalizationProvider';

export const SERVICES = ["Plumbing", "Electrical", "Appliance Repair"];
export const AREAS = [
  "Gaborone - Block 3",
  "Gaborone - Phakalane",
  "Gaborone - Broadhurst",
  "Gaborone - Extension 10",
  "Gaborone - Tlokweng",
];

export default function Home() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const { t } = useLocalization();

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.Provider.filter(
          { verified: true },
          { sort: "-rating", limit: 6 }
        );
        setProviders(items);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (location) params.set("area", location);
    navigate(`/browse?${params.toString()}`);
  };

  const steps = [
    { icon: SearchIconSmall, title: t('home.how_step1_title') || "Search by service & area", text: t('home.how_step1_text') || "Find verified professionals near you in Gaborone." },
    { icon: FileText, title: t('home.how_step2_title') || "Request clear quotes", text: t('home.how_step2_text') || "Send your job to multiple providers and compare prices." },
    { icon: CalendarClock, title: t('home.how_step3_title') || "Book & track", text: t('home.how_step3_text') || "Schedule the job and keep invoices, warranties, and history." },
  ];

  const trust = [
    { icon: ShieldCheck, title: t('home.trust1_title') || "Verified providers", text: t('home.trust1_text') || "We check credentials before anyone is listed." },
    { icon: FileText, title: t('home.trust2_title') || "Clear quotations", text: t('home.trust2_text') || "No hidden costs — agree the price before the work starts." },
    { icon: HandCoins, title: t('home.trust3_title') || "Report & resolve", text: t('home.trust3_text') || "Flag an incomplete job and we help sort it out." },
  ];

  return (
    <div className="px-4 sm:px-6">
      {/* Hero */}
      <section className="max-w-6xl mx-auto pt-12 sm:pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs text-white/70 backdrop-blur-md mb-6">
          <Sparkles size={13} className="text-cyan-400" />
          {t('home.hero_badge')}
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl mx-auto">
          {t('home.hero_title')}
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-2xl mx-auto">
          {t('home.hero_subtitle')}
        </p>

        <div className="mt-10 max-w-3xl mx-auto">
          <SearchBar
            service={service}
            setService={setService}
            location={location}
            setLocation={setLocation}
            onSearch={handleSearch}
            services={SERVICES}
            areas={AREAS}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-cyan-400" /> {t('home.trust1_title')}</span>
          <span className="inline-flex items-center gap-1.5"><FileText size={15} className="text-cyan-400" /> {t('home.trust2_title')}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarClock size={15} className="text-cyan-400" /> Booking reminders</span>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">{t('home.categories_title')}</h2>
          <Link to="/browse" className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1">
            {t('nav.browse')} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <Link key={s} to={`/browse?service=${encodeURIComponent(s)}`} className="group">
              <GlassCard className="p-6 h-full group-hover:bg-white/[0.08] group-hover:-translate-y-1 group-hover:shadow-[0_22px_55px_-22px_rgba(34,211,238,0.5)]">
                <ServiceIcon category={s} className="w-16 h-16 mb-4" size={28} />
                <h3 className="text-lg font-semibold">{s}</h3>
                <p className="text-sm text-white/55 mt-1">{t('home.verified_providers_text') || 'Verified professionals across Gaborone.'}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-300">
                  {t('home.find_a')} {s.toLowerCase()} <ArrowRight size={14} />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      <section className="max-w-6xl mx-auto py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">{t('home.verified_providers')}</h2>
            <p className="text-white/55 mt-1">Reliable first, breadth later — every listing is checked.</p>
          </div>
          <Link to="/browse" className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <GlassCard className="p-10 text-center text-white/60">No verified providers yet — check back soon.</GlassCard>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto py-16 scroll-mt-28">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t('home.how_title')}</h2>
        <p className="text-white/55 text-center mb-10 max-w-xl mx-auto">
          {t('home.how_text')}
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <GlassCard key={i} className="p-6 relative overflow-hidden">
              <div className="absolute -top-6 -right-2 text-7xl font-black text-white/[0.04] select-none">
                {i + 1}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/15 flex items-center justify-center mb-4">
                <s.icon size={22} className="text-cyan-300" />
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-white/55 mt-1.5">{s.text}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Trust / differentiator */}
      <section className="max-w-6xl mx-auto py-16">
        <GlassCard strong className="p-8 sm:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                Built on <span className="text-gradient">reliability</span>, not on listing every business
              </h2>
              <p className="text-white/60 mt-4">
                We start small and verify. Every provider is checked, every quote is clear, and every
                customer has a way to report an incomplete job or dispute. That's the difference.
              </p>
              <GlassButton as={Link} to="/browse" className="mt-6">
                {t('home.find_trusted') || 'Find a trusted provider'} <ArrowRight size={16} />
              </GlassButton>
            </div>
            <div className="space-y-3">
              {trust.map((tItem, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 border border-white/15 flex items-center justify-center shrink-0">
                    <tItem.icon size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-medium">{tItem.title}</h4>
                    <p className="text-sm text-white/55">{tItem.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Provider CTA */}
      <section className="max-w-6xl mx-auto py-16">
        <GlassCard glow className="p-8 sm:p-12 text-center">
          <Quote size={28} className="text-cyan-300 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold">{t('home.provider_cta_title') || 'Are you a service professional?'}</h2>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">
            {t('home.provider_cta_text') || 'Join FixIt BW to receive job requests, manage your availability, and build a trusted reputation. Premium profiles and lead tools available as we grow.'}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <GlassButton as={Link} to="/provider-dashboard" size="lg">
              {t('home.provider_dashboard') || 'Open provider dashboard'} <ArrowRight size={16} />
            </GlassButton>
            <GlassButton as={Link} to="/browse" variant="glass" size="lg">
              {t('home.see_whos_listed') || "See who's listed"}
            </GlassButton>
          </div>
          <p className="text-xs text-white/40 mt-5 inline-flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-cyan-400" /> {t('home.provider_recruit_note') || 'Recruit providers first, customers later.'}
          </p>
        </GlassCard>
      </section>
    </div>
  );
}

function SearchIconSmall(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
