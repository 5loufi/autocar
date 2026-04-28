import { prisma } from "@/lib/prisma";
import { ContratCard } from "./ContratCard";
import { FileText, ArrowRight, CheckCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatCurrency, STATUT_RESERVATION_LABELS, STATUT_RESERVATION_COLORS } from "@/lib/utils";

export default async function ContratsPage() {
  const contrats = await prisma.contrat.findMany({
    orderBy: { createdAt: "desc" },
    include: { reservation: { include: { client: true, vehicule: true } } },
  });

  const reservationsSansContrat = await prisma.reservation.findMany({
    where: { statut: { in: ["CONFIRMEE", "EN_COURS"] }, contrat: null },
    include: { client: true, vehicule: true },
    take: 5,
  });

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Contrats</h2>
          <p className="text-xs text-white/30 mt-1">{contrats.length} contrat{contrats.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {reservationsSansContrat.length > 0 && (
        <div className="surface p-5 border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="text-sm font-semibold text-white/70">Réservations sans contrat</p>
            <span className="ml-auto text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
              {reservationsSansContrat.length}
            </span>
          </div>
          <div className="space-y-2">
            {reservationsSansContrat.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white/90">{r.client.prenom} {r.client.nom}</p>
                  <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                    <span>{r.vehicule.marque} {r.vehicule.modele}</span>
                    <span className="text-white/20">·</span>
                    <span>{formatDate(r.dateDepart)}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>{formatDate(r.dateRetour)}</span>
                  </div>
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
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Contrat</th><th>Client</th><th>Véhicule</th>
                <th>Période</th><th>Montant</th><th>Statut rés.</th><th>Signature</th>
              </tr>
            </thead>
            <tbody>
              {contrats.map(c => (
                <tr key={c.id} className="group">
                  <td>
                    <code className="text-xs font-mono text-violet-400 bg-violet-500/8 border border-violet-500/15 px-2 py-1 rounded-lg">
                      {c.numero}
                    </code>
                  </td>
                  <td>
                    <p className="text-sm font-semibold text-white/90">{c.reservation.client.prenom} {c.reservation.client.nom}</p>
                  </td>
                  <td>
                    <p className="text-sm text-white/60">{c.reservation.vehicule.marque} {c.reservation.vehicule.modele}</p>
                    <code className="text-[11px] font-mono text-white/30">{c.reservation.vehicule.immatriculation}</code>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <span>{formatDate(c.reservation.dateDepart)}</span>
                      <ArrowRight className="w-3 h-3 text-white/20" />
                      <span>{formatDate(c.reservation.dateRetour)}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm font-bold text-white/90">{formatCurrency(c.reservation.prixTotal)}</span>
                  </td>
                  <td>
                    <span className={`badge ${STATUT_RESERVATION_COLORS[c.reservation.statut]}`}>
                      {STATUT_RESERVATION_LABELS[c.reservation.statut]}
                    </span>
                  </td>
                  <td>
                    {c.signe ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle className="w-3 h-3" /> Signé
                      </span>
                    ) : (
                      <span className="text-xs text-white/25 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">En attente</span>
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
