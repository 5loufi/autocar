import {
  Car, Users, CalendarCheck, CreditCard,
  Clock, ArrowUpRight, AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  formatCurrency, formatDate,
  STATUT_RESERVATION_LABELS, STATUT_RESERVATION_COLORS,
  STATUT_VEHICULE_LABELS, STATUT_VEHICULE_COLORS,
} from "@/lib/utils";

async function getDashboardData() {
  const [
    totalVehicules, vehiculesDisponibles, vehiculesLoues,
    totalClients, totalReservations, reservationsEnCours,
    revenusTotal, paiementsEnAttente,
    reservationsRecentes, retoursAVenir,
  ] = await Promise.all([
    prisma.vehicule.count(),
    prisma.vehicule.count({ where: { statut: "DISPONIBLE" } }),
    prisma.vehicule.count({ where: { statut: "LOUE" } }),
    prisma.client.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { statut: "EN_COURS" } }),
    prisma.paiement.aggregate({ _sum: { montant: true }, where: { statut: "PAYE" } }),
    prisma.paiement.aggregate({ _sum: { montant: true }, where: { statut: { in: ["EN_ATTENTE", "PARTIEL"] } } }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true, vehicule: true },
    }),
    prisma.reservation.findMany({
      where: {
        statut: "EN_COURS",
        dateRetour: { gte: new Date(), lte: new Date(Date.now() + 3 * 86400000) },
      },
      include: { client: true, vehicule: true },
      orderBy: { dateRetour: "asc" },
      take: 5,
    }),
  ]);

  return {
    totalVehicules, vehiculesDisponibles, vehiculesLoues,
    totalClients, totalReservations, reservationsEnCours,
    revenus: revenusTotal._sum.montant ?? 0,
    enAttente: paiementsEnAttente._sum.montant ?? 0,
    reservationsRecentes, retoursAVenir,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Chiffre d'affaires"
          value={formatCurrency(data.revenus)}
          icon={CreditCard}
          color="blue"
          trend={{ value: 12, label: "ce mois" }}
        />
        <StatCard
          title="Véhicules disponibles"
          value={`${data.vehiculesDisponibles} / ${data.totalVehicules}`}
          icon={Car}
          color="emerald"
        />
        <StatCard
          title="Locations en cours"
          value={data.reservationsEnCours}
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title="Clients"
          value={data.totalClients}
          icon={Users}
          color="purple"
          trend={{ value: 5, label: "ce mois" }}
        />
      </div>

      {/* Alerte paiements en attente */}
      {data.enAttente > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3.5">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <span className="font-semibold">{formatCurrency(data.enAttente)}</span> de paiements en attente
          </p>
          <Link href="/paiements" className="ml-auto text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline">
            Voir →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Réservations récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Réservations récentes</CardTitle>
            <Link href="/reservations" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="!p-0">
            {data.reservationsRecentes.length === 0 ? (
              <p className="text-sm text-zinc-400 px-6 py-8 text-center">Aucune réservation pour l&apos;instant</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.reservationsRecentes.map((r) => (
                  <Link key={r.id} href={`/reservations/${r.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Car className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {r.client.prenom} {r.client.nom}
                        </p>
                        <p className="text-xs text-zinc-400">{r.vehicule.marque} {r.vehicule.modele}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${STATUT_RESERVATION_COLORS[r.statut]}`}>
                        {STATUT_RESERVATION_LABELS[r.statut]}
                      </span>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {formatCurrency(r.prixTotal)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Retours à venir */}
        <Card>
          <CardHeader>
            <CardTitle>Retours prévus</CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock className="w-3 h-3" />
              <span>3 prochains jours</span>
            </div>
          </CardHeader>
          <CardContent className="!p-0">
            {data.retoursAVenir.length === 0 ? (
              <p className="text-sm text-zinc-400 px-6 py-8 text-center">Aucun retour prévu dans les 3 prochains jours</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.retoursAVenir.map((r) => (
                  <Link key={r.id} href={`/reservations/${r.id}`} className="flex items-center justify-between px-6 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Car className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {r.vehicule.marque} {r.vehicule.modele}
                        </p>
                        <p className="text-xs text-zinc-400">{r.client.prenom} {r.client.nom}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{formatDate(r.dateRetour)}</p>
                      <p className="text-xs text-zinc-400">{r.vehicule.immatriculation}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Parc par statut */}
      <Card>
        <CardHeader>
          <CardTitle>État du parc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { statut: "DISPONIBLE", count: data.vehiculesDisponibles },
              { statut: "LOUE",       count: data.vehiculesLoues },
              { statut: "RESERVE",    count: data.totalVehicules - data.vehiculesDisponibles - data.vehiculesLoues },
              { statut: "ENTRETIEN",  count: 0 },
              { statut: "INDISPONIBLE", count: 0 },
            ].map(({ statut, count }) => (
              <Link key={statut} href={`/vehicules?statut=${statut}`} className="text-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{count}</p>
                <span className={`badge text-xs ${STATUT_VEHICULE_COLORS[statut]}`}>
                  {STATUT_VEHICULE_LABELS[statut]}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
