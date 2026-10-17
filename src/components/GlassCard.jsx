import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, strong, glow, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200",
        strong && "bg-white/[0.08] border-white/14",
        glow && "shadow-[0_0_50px_-12px_rgba(34,211,238,0.45)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}