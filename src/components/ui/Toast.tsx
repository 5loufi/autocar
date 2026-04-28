"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";
interface ToastItem { id: string; type: ToastType; message: string; }

interface ToastCtx {
  toast: {
    success: (msg: string) => void;
    error:   (msg: string) => void;
    warning: (msg: string) => void;
    info:    (msg: string) => void;
  };
}

const ToastContext = createContext<ToastCtx | null>(null);

const CONFIG: Record<ToastType, { icon: React.ElementType; border: string; iconColor: string; bar: string }> = {
  success: { icon: CheckCircle2, border: "border-emerald-500/30", iconColor: "text-emerald-400", bar: "bg-emerald-500" },
  error:   { icon: XCircle,      border: "border-rose-500/30",    iconColor: "text-rose-400",    bar: "bg-rose-500"    },
  warning: { icon: AlertTriangle, border: "border-amber-500/30",  iconColor: "text-amber-400",   bar: "bg-amber-500"   },
  info:    { icon: Info,          border: "border-blue-500/30",   iconColor: "text-blue-400",    bar: "bg-blue-500"    },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const c = CONFIG[item.type];
  const Icon = c.icon;
  return (
    <div
      className={cn(
        "pointer-events-auto relative flex items-center gap-3 pl-4 pr-3 py-3.5 rounded-xl border backdrop-blur-xl shadow-lg animate-slide-in-right overflow-hidden",
        "min-w-[300px] max-w-[380px]",
        c.border,
      )}
      style={{ backgroundColor: "rgb(var(--surface) / 0.95)" }}
    >
      <div className={cn("absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl", c.bar)} />
      <Icon className={cn("w-4 h-4 flex-shrink-0", c.iconColor)} />
      <p className="text-sm font-medium flex-1" style={{ color: "rgb(var(--foreground) / 0.85)" }}>{item.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg transition-colors"
        style={{ color: "rgb(var(--foreground) / 0.35)" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgb(var(--foreground) / 0.08)")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(p => [...p.slice(-4), { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const remove = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), []);

  const toast = {
    success: (m: string) => add("success", m),
    error:   (m: string) => add("error", m),
    warning: (m: string) => add("warning", m),
    info:    (m: string) => add("info", m),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast requires ToastProvider");
  return ctx;
}
