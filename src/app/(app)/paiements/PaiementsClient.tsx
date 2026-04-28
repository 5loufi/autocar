"use client";
import { useState, useMemo } from "react";
import { Plus, CreditCard, Banknote, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatCurrency, formatDate,
  STATUT_PAIEMENT_LABELS, STATUT_PAIEMENT_COLORS,
  MODE_PAIEMENT_LABELS, TYPE_PAIEMENT_LABELS,
} from "@/lib/utils";

type ResInfo = { id: string; client: { nom: string; prenom: string }; vehicule: { marque: string; modele: string }; prixTotal: number };
type Paiement = {
  id: string; montant: number; modePaiement: string; statut: string;
  type: string; reference: string | null; notes: string | null;
  createdAt: Date; reservation: ResInfo;
};

const MODES = ["ESPECES", "CARTE", "VIREMENT", "CHEQUE"];
const TYPES = ["ACOMPTE", "SOLDE", "CAUTION", "REMBOURSEMENT"];
const STATUTS = ["EN_ATTENTE", "PARTIEL", "PAYE", "REMBOURSE"];

const defaultForm = { reservationId: "", montant: "", modePaiement: "ESPECES", statut: "PAYE", type: "SOLDE", reference: "", notes: "" };

export function PaiementsClient({ paiements: initial, reservations }: { paiements: Paiement[]; reservations: ResInfo[] }) {
  const [paiements, setPaiements] = useState(initial);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => paiements.filter(p => {
    const q = search.toLowerCase();
    return !q || p.reservation.client.nom.toLowerCase().includes(q) || p.reservation.client.prenom.toLowerCase().includes(q) || p.reservation.vehicule.marque.toLowerCase().includes(q);
  }), [paiements, search]);

  const totalPaye = paiements.filter(p => p.statut === "PAYE").reduce((s, p) => s + p.montant, 0);
  const totalEnAttente = paiements.filter(p => p.statut !== "PAYE").reduce((s, p) => s + p.montant, 0);

  async function handleSave() {
    if (!form.reservationId || !form.montant) return;
    setLoading(true);
    try {
      const body = {
        reservationId: form.reservationId,
        montant: parseFloat(form.montant),
        modePaiement: form.modePaiement,
        statut: form.statut,
        type: form.type,
        reference: form.reference || null,
        notes: form.notes || null,
      };
      const res = await fetch("/api/paiements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const created = await res.json();
      const reservation = reservations.find(r => r.id === form.reservationId)!;
      setPaiements(prev => [{ ...created, reservation }, ...prev]);
      setModalOpen(false);
      setForm(defaultForm);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/paiements/${deleteId}`, { method: "DELETE" });
      setPaiements(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Paiements</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{paiements.length} transaction{paiements.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Enregistrer un paiement
        </Button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-xs text-zinc-500 mb-1">Total encaissé</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaye)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-zinc-500 mb-1">En attente</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalEnAttente)}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, véhicule…" className="input-base pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="Aucun paiement" description="Enregistrez votre premier paiement." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Client / Véhicule</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Mode</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Montant</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Statut</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.reservation.client.prenom} {p.reservation.client.nom}</p>
                    <p className="text-xs text-zinc-400">{p.reservation.vehicule.marque} {p.reservation.vehicule.modele}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{TYPE_PAIEMENT_LABELS[p.type]}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {p.modePaiement === "CARTE" ? <CreditCard className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                      {MODE_PAIEMENT_LABELS[p.modePaiement]}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(p.montant)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${STATUT_PAIEMENT_COLORS[p.statut]}`}>{STATUT_PAIEMENT_LABELS[p.statut]}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-zinc-400">{formatDate(p.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enregistrer un paiement"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={loading}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Réservation *</label>
            <select value={form.reservationId} onChange={e => setForm(p => ({...p, reservationId: e.target.value}))} className="input-base">
              <option value="">Choisir une réservation</option>
              {reservations.map(r => <option key={r.id} value={r.id}>{r.client.prenom} {r.client.nom} — {r.vehicule.marque} ({formatCurrency(r.prixTotal)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Montant (MAD) *</label>
              <input type="number" value={form.montant} onChange={e => setForm(p => ({...p, montant: e.target.value}))} className="input-base" placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mode</label>
              <select value={form.modePaiement} onChange={e => setForm(p => ({...p, modePaiement: e.target.value}))} className="input-base">
                {MODES.map(m => <option key={m} value={m}>{MODE_PAIEMENT_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="input-base">
                {TYPES.map(t => <option key={t} value={t}>{TYPE_PAIEMENT_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Statut</label>
              <select value={form.statut} onChange={e => setForm(p => ({...p, statut: e.target.value}))} className="input-base">
                {STATUTS.map(s => <option key={s} value={s}>{STATUT_PAIEMENT_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Référence</label>
            <input value={form.reference} onChange={e => setForm(p => ({...p, reference: e.target.value}))} className="input-base" placeholder="N° reçu, chèque…" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-base resize-none" rows={2} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={loading}
        title="Supprimer ce paiement"
        description="Ce paiement sera supprimé définitivement."
      />
    </div>
  );
}
