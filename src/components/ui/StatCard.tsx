import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "emerald" | "amber" | "red" | "purple";
  className?: string;
}

const colorClasses = {
  blue:    { icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  emerald: { icon: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
  amber:   { icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
  red:     { icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  purple:  { icon: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
};

export function StatCard({ title, value, icon: Icon, trend, color = "blue", className }: StatCardProps) {
  const isPositive = trend && trend.value >= 0;
  return (
    <div className={cn("card px-6 py-5", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{value}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{isPositive ? "+" : ""}{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClasses[color].icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
