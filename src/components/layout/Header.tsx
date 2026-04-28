"use client";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const pageTitles: Record<string, { title: string }> = {
  "/dashboard":    { title: "Tableau de bord" },
  "/vehicules":    { title: "Véhicules" },
  "/clients":      { title: "Clients" },
  "/reservations": { title: "Réservations" },
  "/contrats":     { title: "Contrats" },
  "/paiements":    { title: "Paiements" },
  "/calendrier":   { title: "Calendrier" },
  "/entretien":    { title: "Entretien" },
  "/rapports":     { title: "Rapports" },
  "/parametres":   { title: "Paramètres" },
};

export function Header() {
  const pathname = usePathname();
  const key = Object.keys(pageTitles).find(k => pathname === k || pathname.startsWith(k + "/")) ?? "/dashboard";
  const { title } = pageTitles[key];

  return (
    <header className="h-16 backdrop-blur-xl border-b border-foreground/[0.06] flex items-center justify-between px-6 sticky top-0 z-20"
      style={{ backgroundColor: "rgb(var(--background) / 0.85)" }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-foreground/30 font-medium">AutoGest</span>
        <ChevronRight className="w-3 h-3 text-foreground/20" />
        <span className="text-violet-500 font-semibold">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search hint */}
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 border"
          style={{
            backgroundColor: "rgb(var(--foreground) / 0.04)",
            borderColor: "rgb(var(--foreground) / 0.07)",
            color: "rgb(var(--foreground) / 0.3)",
          }}>
          <Search className="w-3.5 h-3.5" />
          <span>Rechercher…</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ backgroundColor: "rgb(var(--foreground) / 0.06)" }}>⌘K</kbd>
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-xl transition-colors"
          style={{ color: "rgb(var(--foreground) / 0.4)" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgb(var(--foreground) / 0.06)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer shadow-glow-sm">
          AG
        </div>
      </div>
    </header>
  );
}
