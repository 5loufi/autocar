import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Icon className="w-6 h-6 text-white/20" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/5 to-transparent" />
      </div>
      <h3 className="text-sm font-semibold text-white/60 mb-1">{title}</h3>
      {description && <p className="text-xs text-white/25 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}
