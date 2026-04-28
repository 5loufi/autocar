"use client";
import { usePathname } from "next/navigation";
import { Bell, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard":    "Tableau de bord",
  "/vehicules":    "Véhicules",
  "/clients":      "Clients",
  "/reservations": "Réservations",
  "/contrats":     "Contrats",
  "/paiements":    "Paiements",
  "/calendrier":   "Calendrier",
  "/entretien":    "Entretien",
  "/rapports":     "Rapports",
  "/parametres":   "Paramètres",
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const title = pageTitles[pathname] ?? pageTitles[Object.keys(pageTitles).find(k => pathname.startsWith(k)) ?? ""] ?? "";

  return (
    <header className="h-14 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>

      <div className="flex items-center gap-1">
        {/* Thème */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Basculer le thème"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-zinc-500" />
              : <Moon className="w-4 h-4 text-zinc-500" />
            }
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <Bell className="w-4 h-4 text-zinc-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="ml-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          AG
        </div>
      </div>
    </header>
  );
}
