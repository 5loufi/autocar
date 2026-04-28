import { prisma } from "@/lib/prisma";
import { ContratCard } from "./ContratCard";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatCurrency, STATUT_RESERVATION_LABELS, STATUT_RESERVATION_COLORS } from "@/lib/utils";
import Link from "next/link";

export default async function ContratsPage() {
  const contrats = await prisma.contrat.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reservation: {
        include: { client: true, vehicule: true },
      },
    },
  });

  const reservationsSansContrat = await prisma.reservation.findMany({
    where: {
      statut: { in: ["CONFIRMEE", "EN_COURS"] },
      contrat: null,
    },
    include: { client: true, vehicule: true },
    take: 5,
  });

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Contrats</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{contrats.length} contrat{contrats.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {reservationsSansContrat.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Réservations sans contrat</p>
          <div className="space-y-2">
            {reservationsSansContrat.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.client.prenom} {r.client.nom}</p>
                  <p className="text-xs text-zinc-500">{r.vehicule.marque} {r.vehicule.modele} · {formatDate(r.dateDepart)} → {formatDate(r.dateRetour)}</p>
                </div>
                <ContratCard reservationId={r.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {contrats.length === 0 ? (
        <EmptyState icon={FileText} title="Aucun contrat" description="Les contrats seront générés depuis les réservations confirmées." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">N° Contrat</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Véhicule</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Période</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Montant</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Statut résv.</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Signé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {contrats.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-mono font-medium text-blue-600 dark:text-blue-400">{c.numero}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {c.reservation.client.prenom} {c.reservation.client.nom}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {c.reservation.vehicule.marque} {c.reservation.vehicule.modele}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(c.reservation.dateDepart)} → {formatDate(c.reservation.dateRetour)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(c.reservation.prixTotal)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${STATUT_RESERVATION_COLORS[c.reservation.statut]}`}>
                      {STATUT_RESERVATION_LABELS[c.reservation.statut]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {c.signe ? (
                      <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Signé</span>
                    ) : (
                      <span className="badge bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Non signé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
