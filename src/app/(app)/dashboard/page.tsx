import { Car, Users, CalendarCheck, CreditCard, Clock, ArrowUpRight, AlertCircle, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import {
  formatCurrency, formatDate,
  STATUT_RESERVATION_LABELS, STATUT_RESERVATION_COLORS,
  STATUT_VEHICULE_LABELS, STATUT_VEHICULE_COLORS,
} from "@/lib/utils";

async function getDashboardData() {
  const [
    totalVehicules, vehiculesDisponibles, vehiculesLoues,
    totalClients, reservationsEnCours,
    revenusTotal, paiementsEnAttente,
    reservationsRecentes, retoursAVenir,
  ] = await Promise.all([
    prisma.vehicule.count(),
    prisma.vehicule.count({ where: { statut: "DISPONIBLE" } }),
    prisma.vehicule.count({ where: { statut: "LOUE" } }),
    prisma.client.count(),
    prisma.reservation.count({ where: { statut: "EN_COURS" } }),
    prisma.paiement.aggregate({ _sum: { montant: true }, where: { statut: "PAYE" } }),
    prisma.paiement.aggregate({ _sum: { montant: true }, where: { statut: { in: ["EN_ATTENTE", "PARTIEL"] } } }),
    prisma.reservation.findMany({
      take: 6, orderBy: { createdAt: "desc" },
      include: { client: true, vehicule: true },
    }),
    prisma.reservation.findMany({
      where: { statut: "EN_COURS", dateRetour: { gte: new Date(), lte: new Date(Date.now() + 3 * 86400000) } },
      include: { client: true, vehicule: true },
      orderBy: { dateRetour: "asc" }, take: 5,
    }),
  ]);

  return {
    totalVehicules, vehiculesDisponibles, vehiculesLoues, totalClients,
    reservationsEnCours,
    revenus: revenusTotal._sum.montant ?? 0,
    enAttente: paiementsEnAttente._sum.montant ?? 0,
    reservationsRecentes, retoursAVenir,
  };
}

export default async function DashboardPage() {
  const d = await getDashboardData();

  const tauxOccupation = d.totalVehicules > 0 ? Math.round((d.vehiculesLoues / d.totalVehicules) * 100) : 0;

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Hero greeting */}
      <div className="relative overflow-hidden surface p-6 border-gradient">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-1">Bienvenue</p>
            <h2 className="text-2xl font-bold text-white">Bonjour, Mon Agence 👋</h2>
            <p className="text-sm text-foreground/40 mt-1">
              {d.reservationsEnCours} location{d.reservationsEnCours > 1 ? "s" : ""} en cours · Taux d&apos;occupation : <span className="text-violet-400 font-semibold">{tauxOccupation}%</span>
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-foreground/30">Chiffre d&apos;affaires</p>
              <p className="text-xl font-bold gradient-text">{formatCurrency(d.revenus)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Chiffre d'affaires" value={formatCurrency(d.revenus)} icon={CreditCard} color="violet" trend={{ value: 12, label: "vs mois dernier" }} />
        <StatCard title="Véhicules disponibles" value={`${d.vehiculesDisponibles}/${d.totalVehicules}`} icon={Car} color="emerald" />
        <StatCard title="Locations actives" value={d.reservationsEnCours} icon={CalendarCheck} color="amber" />
        <StatCard title="Clients" value={d.totalClients} icon={Users} color="cyan" trend={{ value: 5, label: "ce mois" }} />
      </div>

      {/* Alerte */}
      {d.enAttente > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl px-5 py-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground/80">
              <span className="font-bold text-amber-400">{formatCurrency(d.enAttente)}</span> de paiements en attente
            </p>
          </div>
          <Link href="/paiements" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors">
            Voir <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Réservations récentes */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Réservations récentes</CardTitle>
            <Link href="/reservations" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="!p-0">
            {d.reservationsRecentes.length === 0 ? (
              <p className="text-sm text-foreground/25 px-5 py-10 text-center">Aucune réservation</p>
            ) : (
              <div>
                {d.reservationsRecentes.map((r) => (
                  <Link key={r.id} href={`/reservations`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-foreground/[0.03] transition-colors border-b border-foreground/[0.04] last:border-0 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-violet-400">
                          {r.client.prenom[0]}{r.client.nom[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                          {r.client.prenom} {r.client.nom}
                        </p>
                        <p className="text-xs text-foreground/30">{r.vehicule.marque} {r.vehicule.modele} · {formatDate(r.dateDepart)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge text-[11px] ${STATUT_RESERVATION_COLORS[r.statut]}`}>
                        {STATUT_RESERVATION_LABELS[r.statut]}
                      </span>
                      <span className="text-sm font-bold text-foreground/80">{formatCurrency(r.prixTotal)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Retours + parc */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retours prévus</CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-foreground/30">
                <Clock className="w-3 h-3" />3 jours
              </div>
            </CardHeader>
            <CardContent className="!p-0">
              {d.retoursAVenir.length === 0 ? (
                <p className="text-xs text-foreground/25 px-5 py-6 text-center">Aucun retour prévu</p>
              ) : (
                <div>
                  {d.retoursAVenir.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-5 py-3 border-b border-foreground/[0.04] last:border-0">
                      <div>
                        <p className="text-xs font-semibold text-foreground/80">{r.vehicule.marque} {r.vehicule.modele}</p>
                        <p className="text-[11px] text-foreground/30">{r.client.prenom} {r.client.nom}</p>
                      </div>
                      <p className="text-xs font-semibold text-amber-400">{formatDate(r.dateRetour)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parc rapide */}
          <Card>
            <CardHeader><CardTitle>État du parc</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { s: "DISPONIBLE", count: d.vehiculesDisponibles, color: "bg-emerald-500" },
                { s: "LOUE",       count: d.vehiculesLoues,       color: "bg-violet-500" },
                { s: "RESERVE",    count: d.totalVehicules - d.vehiculesDisponibles - d.vehiculesLoues, color: "bg-amber-500" },
              ].map(({ s, count, color }) => (
                <div key={s} className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-xs text-foreground/40 flex-1">{STATUT_VEHICULE_LABELS[s]}</span>
                  <span className="text-xs font-bold text-foreground/70">{count}</span>
                  <div className="w-16 h-1 bg-foreground/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${d.totalVehicules > 0 ? (count / d.totalVehicules) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
