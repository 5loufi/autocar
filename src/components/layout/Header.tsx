"use client";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronRight } from "lucide-react";
import { useState } from "react";

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/dashboard":    { title: "Tableau de bord",  sub: "Vue d'ensemble de votre activité" },
  "/vehicules":    { title: "Véhicules",         sub: "Gestion de votre parc automobile" },
  "/clients":      { title: "Clients",           sub: "Base de données clients" },
  "/reservations": { title: "Réservations",      sub: "Suivi des réservations" },
  "/contrats":     { title: "Contrats",          sub: "Contrats de location" },
  "/paiements":    { title: "Paiements",         sub: "Transactions et encaissements" },
  "/calendrier":   { title: "Calendrier",        sub: "Planning et disponibilités" },
  "/entretien":    { title: "Entretien",         sub: "Maintenance du parc" },
  "/rapports":     { title: "Rapports",          sub: "Statistiques et analyses" },
  "/parametres":   { title: "Paramètres",        sub: "Configuration de l'agence" },
};

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const key = Object.keys(pageTitles).find(k => pathname === k || pathname.startsWith(k + "/")) ?? "/dashboard";
  const { title, sub } = pageTitles[key];

  return (
    <header className="h-16 bg-[#0a0a10]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Breadcrumb + Title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-0.5">
            <span>AutoGest</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-violet-400">{title}</span>
          </div>
          <h1 className="text-sm font-bold text-white leading-none">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] rounded-xl text-white/30 text-xs transition-all duration-200"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Rechercher…</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.06] rounded text-[10px] font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/[0.06] rounded-xl transition-colors">
          <Bell className="w-4 h-4 text-white/40" />
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
