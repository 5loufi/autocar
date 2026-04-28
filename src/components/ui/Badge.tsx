import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "violet";
}

const variantClasses = {
  default: "bg-white/[0.08] text-white/60",
  violet:  "bg-violet-500/15 text-violet-300 border border-violet-500/20",
  success: "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/12 text-amber-400 border border-amber-500/20",
  danger:  "bg-rose-500/12 text-rose-400 border border-rose-500/20",
  info:    "bg-blue-500/12 text-blue-400 border border-blue-500/20",
  neutral: "bg-white/[0.06] text-white/40",
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("badge", variantClasses[variant], className)}>
      {children}
    </span>
  );
}
