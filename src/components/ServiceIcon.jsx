import { Droplets, Zap, WashingMachine, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const map = {
  Plumbing: Droplets,
  Electrical: Zap,
  "Appliance Repair": WashingMachine,
};

export default function ServiceIcon({ category, className, size = 24 }) {
  const Icon = map[category] || Wrench;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_20px_-8px_rgba(34,211,238,0.4)]",
        className
      )}
    >
      <Icon size={size} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
    </div>
  );
}