import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, Car, Users, AlertCircle } from "lucide-react";
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
      by: ["vehiculeId"],
      _count: true,
      orderBy: { _count: { vehiculeId: "desc" } },
      take: 5,
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
    ...v,
    vehicule: vehiculeDetails.find(vd => vd.id === v.vehiculeId)!,
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

  return (
    <div className="space-y-5 animate-slide-up">
      <h2 className="section-title">Rapports</h2>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Chiffre d'affaires total", value: formatCurrency(stats.totalRevenus), icon: TrendingUp, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
          { label: "Total réservations", value: stats.totalReservations.toString(), icon: Car, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Total clients", value: stats.totalClients.toString(), icon: Users, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Véhicules en parc", value: stats.totalVehicules.toString(), icon: Car, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <RapportCharts monthlyData={stats.monthlyData} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Véhicules les plus loués */}
        <Card>
          <CardHeader>
            <CardTitle>Véhicules les plus loués</CardTitle>
          </CardHeader>
          <CardContent className="!p-0">
            {stats.vehiculesPopulaires.length === 0 ? (
              <p className="text-sm text-zinc-400 px-6 py-8 text-center">Aucune donnée</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.vehiculesPopulaires.map((v, i) => (
                  <div key={v.vehiculeId} className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{v.vehicule?.marque} {v.vehicule?.modele}</p>
                        <p className="text-xs font-mono text-zinc-400">{v.vehicule?.immatriculation}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{v._count} location{v._count > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paiements en attente */}
        <Card>
          <CardHeader>
            <CardTitle>Paiements en attente</CardTitle>
            {stats.paiementsEnAttente.length > 0 && (
              <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {formatCurrency(stats.paiementsEnAttente.reduce((s, p) => s + p.montant, 0))}
              </span>
            )}
          </CardHeader>
          <CardContent className="!p-0">
            {stats.paiementsEnAttente.length === 0 ? (
              <div className="flex items-center gap-2 px-6 py-8 justify-center">
                <AlertCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Tous les paiements sont à jour</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.paiementsEnAttente.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {p.reservation.client.prenom} {p.reservation.client.nom}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(p.montant)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
