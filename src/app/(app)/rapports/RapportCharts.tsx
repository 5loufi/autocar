"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type MonthData = { mois: string; revenus: number; locations: number };

function formatMois(mois: string) {
  try { return format(parse(mois, "yyyy-MM", new Date()), "MMM yy", { locale: fr }); }
  catch { return mois; }
}

const TooltipRevenu = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border rounded-xl px-4 py-3 shadow-xl surface">
      <p className="text-xs text-foreground/40 mb-1">{label}</p>
      <p className="text-sm font-bold text-violet-500">{payload[0].value.toLocaleString("fr-FR")} MAD</p>
    </div>
  );
};

const TooltipLocations = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border rounded-xl px-4 py-3 shadow-xl surface">
      <p className="text-xs text-foreground/40 mb-1">{label}</p>
      <p className="text-sm font-bold text-indigo-500">{payload[0].value} location{payload[0].value > 1 ? "s" : ""}</p>
    </div>
  );
};

export function RapportCharts({ monthlyData }: { monthlyData: MonthData[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridStroke = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
  const tickFill   = isDark ? "rgba(255,255,255,0.3)"  : "rgba(13,13,26,0.4)";

  const data = monthlyData.map(d => ({ ...d, mois: formatMois(d.mois) }));

  if (data.length === 0) {
    return (
      <div className="surface p-10 text-center">
        <p className="text-sm text-foreground/25">Pas encore de données pour les graphiques</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Revenus */}
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold text-foreground">Revenus mensuels</p>
            <p className="text-xs text-foreground/30 mt-0.5">Évolution sur 6 mois</p>
          </div>
          <span className="badge bg-violet-500/15 text-violet-500 border border-violet-500/20">MAD</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={isDark ? 0.3 : 0.2} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<TooltipRevenu />} cursor={{ stroke: "rgba(139,92,246,0.2)", strokeWidth: 1 }} />
            <Area type="monotone" dataKey="revenus" stroke="#8b5cf6" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Locations */}
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold text-foreground">Locations par mois</p>
            <p className="text-xs text-foreground/30 mt-0.5">Nombre de réservations</p>
          </div>
          <span className="badge bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">Mois</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: tickFill }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
            <Tooltip content={<TooltipLocations />} cursor={{ fill: isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)" }} />
            <Bar dataKey="locations" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
