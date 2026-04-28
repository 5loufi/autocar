import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Car, Users, Wallet, Trophy, AlertCircle } from "lucide-react";
import { RapportCharts } from "./RapportCharts";

async function getStats() {
  const [
    totalReservations, totalClients, totalVehicules,
    paiementsStats, vehiculesPopulaires, paiementsEnAttente,
    reservationsParMois,
  ] = await Promise.all([
    prisma.reservation.count(),
    prisma.client.count(),
    prisma.vehicule.count(),
    prisma.paiement.aggregate({ _sum: { montant: true }, where: { statut: "PAYE" } }),
    prisma.reservation.groupBy({
      by: ["vehiculeId"], _count: true,
      orderBy: { _count: { vehiculeId: "desc" } }, take: 5,
    }),
    prisma.paiement.findMany({
      where: { statut: { in: ["EN_ATTENTE", "PARTIEL"] } },
      include: { reservation: { include: { client: true } } },
    }),
    prisma.reservation.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, prixTotal: true },
    }),
  ]);

  const vehiculeIds = vehiculesPopulaires.map(v => v.vehiculeId);
  const vehiculeDetails = await prisma.vehicule.findMany({
    where: { id: { in: vehiculeIds } },
    select: { id: true, marque: true, modele: true, immatriculation: true },
  });

  const vehiculesAvecStats = vehiculesPopulaires.map(v => ({
    ...v, vehicule: vehiculeDetails.find(vd => vd.id === v.vehiculeId)!,
  }));

  const monthlyData: Record<string, { revenus: number; locations: number }> = {};
  reservationsParMois.forEach(r => {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyData[key]) monthlyData[key] = { revenus: 0, locations: 0 };
    monthlyData[key].revenus += r.prixTotal;
    monthlyData[key].locations += 1;
  });

  return {
    totalReservations, totalClients, totalVehicules,
    totalRevenus: paiementsStats._sum.montant ?? 0,
    vehiculesPopulaires: vehiculesAvecStats,
    paiementsEnAttente,
    monthlyData: Object.entries(monthlyData).sort().map(([mois, d]) => ({ mois, ...d })),
  };
}

export default async function RapportsPage() {
  const stats = await getStats();
  const totalEnAttente = stats.paiementsEnAttente.reduce((s, p) => s + p.montant, 0);

  const kpis = [
    { label: "Chiffre d'affaires", value: formatCurrency(stats.totalRevenus), icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
    { label: "Total réservations",  value: stats.totalReservations.toString(),  icon: Car,        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Clients",             value: stats.totalClients.toString(),        icon: Users,      color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Véhicules en parc",   value: stats.totalVehicules.toString(),      icon: Car,        color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="section-title">Rapports</h2>
        <p className="text-xs text-foreground/30 mt-1">Vue d&apos;ensemble des performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(s => (
          <div key={s.label} className="surface p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-foreground/30 leading-tight">{s.label}</p>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <RapportCharts monthlyData={stats.monthlyData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top véhicules */}
        <div className="surface overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-foreground/[0.06]">
            <Trophy className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-foreground/80">Véhicules les plus loués</p>
          </div>
          {stats.vehiculesPopulaires.length === 0 ? (
            <p className="text-sm text-foreground/25 px-5 py-8 text-center">Aucune donnée disponible</p>
          ) : (
            <div className="divide-y divide-foreground/[0.04]">
              {stats.vehiculesPopulaires.map((v, i) => (
                <div key={v.vehiculeId} className="flex items-center justify-between px-5 py-3.5 hover:bg-foreground/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-500/15 text-amber-400" :
                      i === 1 ? "bg-foreground/[0.08] text-foreground/50" :
                      i === 2 ? "bg-orange-500/10 text-orange-400/70" :
                      "bg-foreground/[0.04] text-foreground/25"
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground/90">{v.vehicule?.marque} {v.vehicule?.modele}</p>
                      <code className="text-[11px] font-mono text-foreground/30">{v.vehicule?.immatriculation}</code>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground/60">{v._count} location{v._count > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paiements en attente */}
        <div className="surface overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-foreground/[0.06]">
            <Wallet className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-foreground/80">Paiements en attente</p>
            {totalEnAttente > 0 && (
              <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                {formatCurrency(totalEnAttente)}
              </span>
            )}
          </div>
          {stats.paiementsEnAttente.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-5 py-8">
              <AlertCircle className="w-4 h-4 text-emerald-400" />
              <p className="text-sm text-emerald-400">Tous les paiements sont à jour</p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/[0.04]">
              {stats.paiementsEnAttente.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-foreground/[0.02] transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{p.reservation.client.prenom} {p.reservation.client.nom}</p>
                    <p className="text-xs text-foreground/30 mt-0.5">{p.statut === "PARTIEL" ? "Paiement partiel" : "En attente"}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{formatCurrency(p.montant)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
