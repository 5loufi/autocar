"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Car, Users, CalendarCheck, FileText,
  CreditCard, Calendar, Wrench, BarChart3, Settings, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",    label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/vehicules",    label: "Véhicules",        icon: Car },
  { href: "/clients",      label: "Clients",          icon: Users },
  { href: "/reservations", label: "Réservations",     icon: CalendarCheck },
  { href: "/contrats",     label: "Contrats",         icon: FileText },
  { href: "/paiements",    label: "Paiements",        icon: CreditCard },
  { href: "/calendrier",   label: "Calendrier",       icon: Calendar },
  { href: "/entretien",    label: "Entretien",        icon: Wrench },
  { href: "/rapports",     label: "Rapports",         icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-foreground/[0.06] flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-foreground/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-glow-sm" />
            <div className="relative flex items-center justify-center w-full h-full">
              <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none tracking-tight">AutoGest</p>
            <p className="text-[11px] text-foreground/30 mt-0.5 font-medium">Location de véhicules</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.15em]">Navigation</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-foreground"
                  : "text-foreground/40 hover:text-foreground/80 hover:bg-foreground/[0.05]"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
              )}
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors",
                active ? "text-violet-500" : "text-foreground/30 group-hover:text-foreground/60"
              )} />
              <span className="flex-1">{label}</span>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Paramètres + User */}
      <div className="px-3 py-3 border-t border-foreground/[0.06]">
        <Link href="/parametres"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            pathname === "/parametres"
              ? "bg-foreground/[0.06] text-foreground"
              : "text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.04]"
          )}
        >
          <Settings className="w-4 h-4 text-foreground/30" />
          <span>Paramètres</span>
        </Link>

        <div className="mt-3 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground/80 truncate">Mon Agence</p>
            <p className="text-[10px] text-foreground/30 truncate">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
