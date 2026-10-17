import { cn } from "@/lib/utils";

export default function GlassButton({ children, className, variant = "gradient", size = "md", as: As = "button", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none";
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const variants = {
    gradient:
      "text-white bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_8px_24px_-8px_rgba(34,211,238,0.6)] hover:shadow-[0_10px_36px_-6px_rgba(99,102,241,0.7)]",
    glass:
      "text-white bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/[0.16]",
    ghost: "text-white/80 hover:text-white hover:bg-white/5",
    outline:
      "text-white border border-white/20 hover:border-cyan-400/60 hover:bg-white/5",
  };
  return (
    <As className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </As>
  );
}