"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Car, Users, CalendarCheck, CreditCard, Wrench,
  Calendar, BarChart3, FileText, Settings, Search,
  LayoutDashboard, ArrowRight, Hash,
} from "lucide-react";

type Item = { id: string; label: string; sub?: string; icon: React.ElementType; path: string; group: string };

const NAV_ITEMS: Item[] = [
  { id:"dashboard",    label:"Tableau de bord", icon:LayoutDashboard, path:"/dashboard",    group:"Navigation" },
  { id:"vehicules",    label:"Véhicules",        icon:Car,             path:"/vehicules",    group:"Navigation" },
  { id:"clients",      label:"Clients",          icon:Users,           path:"/clients",      group:"Navigation" },
  { id:"reservations", label:"Réservations",     icon:CalendarCheck,   path:"/reservations", group:"Navigation" },
  { id:"paiements",    label:"Paiements",        icon:CreditCard,      path:"/paiements",    group:"Navigation" },
  { id:"entretien",    label:"Entretien",        icon:Wrench,          path:"/entretien",    group:"Navigation" },
  { id:"calendrier",   label:"Calendrier",       icon:Calendar,        path:"/calendrier",   group:"Navigation" },
  { id:"rapports",     label:"Rapports",         icon:BarChart3,       path:"/rapports",     group:"Navigation" },
  { id:"contrats",     label:"Contrats",         icon:FileText,        path:"/contrats",     group:"Navigation" },
  { id:"parametres",   label:"Paramètres",       icon:Settings,        path:"/parametres",   group:"Navigation" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items = query.trim()
    ? NAV_ITEMS.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.group.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_ITEMS;

  const close = useCallback(() => { setOpen(false); setQuery(""); setActive(0); }, []);

  const go = useCallback((item: Item) => {
    router.push(item.path);
    close();
  }, [router, close]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery(""); setActive(0);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    function onOpen() { setOpen(true); setQuery(""); setActive(0); }
    window.addEventListener("open-command-palette" as any, onOpen);
    return () => window.removeEventListener("open-command-palette" as any, onOpen);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (items[active]) go(items[active]);
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const groups = [...new Set(items.map(i => i.group))];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: "rgb(var(--foreground) / 0.25)", backdropFilter: "blur(4px)" }}
      onMouseDown={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl border overflow-hidden animate-slide-up"
        style={{
          backgroundColor: "rgb(var(--surface))",
          borderColor: "rgb(var(--foreground) / 0.08)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: "rgb(var(--foreground) / 0.06)" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgb(var(--foreground) / 0.3)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher ou naviguer…"
            className="flex-1 h-12 bg-transparent outline-none text-sm"
            style={{ color: "rgb(var(--foreground) / 0.85)" }}
          />
          <kbd
            className="hidden sm:flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono flex-shrink-0"
            style={{ backgroundColor: "rgb(var(--foreground) / 0.06)", color: "rgb(var(--foreground) / 0.3)" }}
          >ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="py-2 max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "rgb(var(--foreground) / 0.3)" }}>
              Aucun résultat pour &ldquo;{query}&rdquo;
            </div>
          ) : (
            groups.map(group => (
              <div key={group}>
                <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "rgb(var(--foreground) / 0.25)" }}>{group}</p>
                {items.filter(i => i.group === group).map(item => {
                  const idx = items.indexOf(item);
                  const Icon = item.icon;
                  const isActive = idx === active;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item)}
                      onMouseEnter={() => setActive(idx)}
                      className="w-full flex items-center gap-3 px-3 mx-1 py-2 rounded-xl text-left transition-colors"
                      style={{
                        backgroundColor: isActive ? "rgb(var(--foreground) / 0.06)" : "transparent",
                        width: "calc(100% - 8px)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isActive ? "rgb(139 92 246 / 0.15)" : "rgb(var(--foreground) / 0.05)" }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "rgb(139 92 246)" : "rgb(var(--foreground) / 0.4)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--foreground) / 0.85)" }}>{item.label}</p>
                        {item.sub && <p className="text-xs truncate" style={{ color: "rgb(var(--foreground) / 0.35)" }}>{item.sub}</p>}
                      </div>
                      {isActive && <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgb(139 92 246 / 0.6)" }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t" style={{ borderColor: "rgb(var(--foreground) / 0.05)" }}>
          {[
            { keys: ["↑","↓"], label: "naviguer" },
            { keys: ["↵"],     label: "ouvrir"   },
            { keys: ["Esc"],   label: "fermer"   },
          ].map(({ keys, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="flex gap-1">
                {keys.map(k => (
                  <kbd key={k} className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                    style={{ backgroundColor: "rgb(var(--foreground) / 0.06)", color: "rgb(var(--foreground) / 0.35)" }}>{k}</kbd>
                ))}
              </div>
              <span className="text-[11px]" style={{ color: "rgb(var(--foreground) / 0.25)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
