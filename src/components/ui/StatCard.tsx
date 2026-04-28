import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "violet" | "emerald" | "amber" | "rose" | "cyan";
  className?: string;
}

const colorMap = {
  violet: {
    icon:    "from-violet-600/20 to-violet-600/5 text-violet-400",
    border:  "hover:border-violet-500/30",
    glow:    "hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)]",
    dot:     "bg-violet-400",
  },
  emerald: {
    icon:    "from-emerald-600/20 to-emerald-600/5 text-emerald-400",
    border:  "hover:border-emerald-500/30",
    glow:    "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]",
    dot:     "bg-emerald-400",
  },
  amber: {
    icon:    "from-amber-600/20 to-amber-600/5 text-amber-400",
    border:  "hover:border-amber-500/30",
    glow:    "hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]",
    dot:     "bg-amber-400",
  },
  rose: {
    icon:    "from-rose-600/20 to-rose-600/5 text-rose-400",
    border:  "hover:border-rose-500/30",
    glow:    "hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)]",
    dot:     "bg-rose-400",
  },
  cyan: {
    icon:    "from-cyan-600/20 to-cyan-600/5 text-cyan-400",
    border:  "hover:border-cyan-500/30",
    glow:    "hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]",
    dot:     "bg-cyan-400",
  },
};

export function StatCard({ title, value, icon: Icon, trend, color = "violet", className }: StatCardProps) {
  const c = colorMap[color];
  const isPositive = trend && trend.value >= 0;

  return (
    <div className={cn(
      "surface p-5 transition-all duration-300 border",
      c.border, c.glow,
      "group cursor-default",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
          c.icon
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight animate-count-up">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
        <p className="text-xs text-white/40 font-medium">{title}</p>
      </div>
      {trend && (
        <p className="text-[11px] text-white/25 mt-1">{trend.label}</p>
      )}
    </div>
  );
}
