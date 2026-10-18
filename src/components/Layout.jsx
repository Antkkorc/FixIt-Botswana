import { Outlet, Link, useLocation } from "react-router-dom";
import { Wrench, Menu } from "lucide-react";
import { useState } from "react";
import GlassButton from "./GlassButton";
import { cn } from "@/lib/utils";
import { useLocalization } from '@/lib/LocalizationProvider';

const nav = [
  { labelKey: "nav.browse", to: "/browse" },
  { labelKey: "nav.how", to: "/#how" },
  { labelKey: "nav.for_providers", to: "/provider-dashboard" },
  { labelKey: "nav.my_bookings", to: "/my-bookings" },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLocalization();

  const toggleLocale = () => setLocale(locale === 'en' ? 'tn' : 'en');

  return (
    <div className="min-h-screen text-white relative">
      <div className="fixed inset-0 -z-20 bg-[#070b16]" />
      <div className="fixed -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyan-500/20 blur-[130px] -z-10 animate-blob" />
      <div className="fixed top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[130px] -z-10 animate-blob" style={{ animationDelay: "3s" }} />
      <div className="fixed bottom-0 left-1/3 w-[420px] h-[420px] rounded-full bg-blue-600/12 blur-[130px] -z-10 animate-blob" style={{ animationDelay: "6s" }} />

      <header className="sticky top-0 z-50 px-4 sm:px-6 pt-4">
        <div className="max-w-6xl mx-auto rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.7)]">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Fix<span className="text-gradient">It</span> BW
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all duration-200",
                  pathname === n.to ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {t(n.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleLocale} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm">
              {locale === 'en' ? 'EN' : 'TN'}
            </button>
            <GlassButton size="sm" as={Link} to="/browse" className="hidden sm:inline-flex animate-pulse-glow">
              {t('nav.get_started')}
            </GlassButton>
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-3xl bg-white/[0.07] border border-white/10 backdrop-blur-xl p-3 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-full text-sm text-white/80 hover:bg-white/5"
              >
                {t(n.labelKey)}
              </Link>
            ))}
          </div>
        )}
      </header>

      <main className="relative">
        <Outlet />
      </main>

      <footer className="relative px-6 py-12 mt-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center">
              <Wrench size={14} className="text-white" />
            </div>
            <span>FixIt BW — {t('footer.trusted_local_services')}</span>
          </div>
          <p>{t('footer.launching_in')}</p>
        </div>
      </footer>
    </div>
  );
}
