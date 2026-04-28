"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Car, Users, CalendarCheck, FileText,
  CreditCard, Calendar, Wrench, BarChart3, Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",    label: "Tableau de bord",  icon: LayoutDashboard },
  { href: "/vehicules",    label: "Véhicules",         icon: Car },
  { href: "/clients",      label: "Clients",           icon: Users },
  { href: "/reservations", label: "Réservations",      icon: CalendarCheck },
  { href: "/contrats",     label: "Contrats",          icon: FileText },
  { href: "/paiements",    label: "Paiements",         icon: CreditCard },
  { href: "/calendrier",   label: "Calendrier",        icon: Calendar },
  { href: "/entretien",    label: "Entretien",         icon: Wrench },
  { href: "/rapports",     label: "Rapports",          icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">AutoGest</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Location de véhicules</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-blue-500 dark:text-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Paramètres */}
      <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800">
        <Link
          href="/parametres"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname === "/parametres"
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
          )}
        >
          <Settings className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <span>Paramètres</span>
        </Link>
      </div>
    </aside>
  );
}
