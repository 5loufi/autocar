"use client";
import { useState, useMemo } from "react";
import { Plus, Search, CalendarCheck, Edit2, Trash2, Car, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatCurrency, formatDate,
  STATUT_RESERVATION_LABELS, STATUT_RESERVATION_COLORS,
} from "@/lib/utils";
import { differenceInDays } from "date-fns";

type Vehicule = { id: string; marque: string; modele: string; immatriculation: string; prixJour: number; caution: number };
type Client   = { id: string; nom: string; prenom: string; telephone: string };
type Paiement = { id: string; montant: number; statut: string };
type Reservation = {
  id: string; vehiculeId: string; clientId: string;
  dateDepart: Date; dateRetour: Date;
  prixTotal: number; caution: number; statut: string; notes: string | null;
  vehicule: Vehicule; client: Client; paiements: Paiement[];
};

const STATUTS = ["EN_ATTENTE", "CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE"];

const defaultForm = {
  vehiculeId: "", clientId: "",
  dateDepart: "", dateRetour: "",
  prixTotal: "", caution: "", statut: "EN_ATTENTE", notes: "",
};

export function ReservationsClient({
  reservations: initial, vehicules, clients,
}: { reservations: Reservation[]; vehicules: Vehicule[]; clients: Client[] }) {
  const [reservations, setReservations] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRes, setEditRes] = useState<Reservation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => reservations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.client.nom.toLowerCase().includes(q)
      || r.client.prenom.toLowerCase().includes(q)
      || r.vehicule.marque.toLowerCase().includes(q)
      || r.vehicule.immatriculation.toLowerCase().includes(q);
    const matchStatut = !filterStatut || r.statut === filterStatut;
    return matchSearch && matchStatut;
  }), [reservations, search, filterStatut]);

  // Calculer le prix automatiquement
  const computedPrix = useMemo(() => {
    if (!form.vehiculeId || !form.dateDepart || !form.dateRetour) return "";
    const v = vehicules.find(v => v.id === form.vehiculeId);
    if (!v) return "";
    const days = differenceInDays(new Date(form.dateRetour), new Date(form.dateDepart));
    if (days <= 0) return "";
    return (days * v.prixJour).toString();
  }, [form.vehiculeId, form.dateDepart, form.dateRetour, vehicules]);

  function openCreate() {
    setEditRes(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(r: Reservation) {
    setEditRes(r);
    setForm({
      vehiculeId: r.vehiculeId, clientId: r.clientId,
      dateDepart: new Date(r.dateDepart).toISOString().split("T")[0],
      dateRetour: new Date(r.dateRetour).toISOString().split("T")[0],
      prixTotal: r.prixTotal.toString(), caution: r.caution.toString(),
      statut: r.statut, notes: r.notes ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.vehiculeId || !form.clientId || !form.dateDepart || !form.dateRetour) return;
    setLoading(true);
    try {
      const body = {
        vehiculeId: form.vehiculeId, clientId: form.clientId,
        dateDepart: new Date(form.dateDepart),
        dateRetour: new Date(form.dateRetour),
        prixTotal: parseFloat(form.prixTotal || computedPrix || "0"),
        caution: parseFloat(form.caution || "0"),
        statut: form.statut, notes: form.notes || null,
      };
      if (editRes) {
        const res = await fetch(`/api/reservations/${editRes.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const updated = await res.json();
        const v = vehicules.find(v => v.id === updated.vehiculeId)!;
        const c = clients.find(c => c.id === updated.clientId)!;
        setReservations(prev => prev.map(r => r.id === updated.id ? { ...updated, vehicule: v, client: c, paiements: editRes.paiements } : r));
      } else {
        const res = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const created = await res.json();
        const v = vehicules.find(v => v.id === created.vehiculeId)!;
        const c = clients.find(c => c.id === created.clientId)!;
        setReservations(prev => [{ ...created, vehicule: v, client: c, paiements: [] }, ...prev]);
      }
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/reservations/${deleteId}`, { method: "DELETE" });
      setReservations(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  }

  const montantPaye = (r: Reservation) => r.paiements.filter(p => p.statut === "PAYE").reduce((s, p) => s + p.montant, 0);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Réservations</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{reservations.length} réservation{reservations.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Nouvelle réservation</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, véhicule…" className="input-base pl-9" />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input-base w-auto">
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_RESERVATION_LABELS[s]}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Aucune réservation"
          description="Créez votre première réservation."
          action={<Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5" /> Créer</Button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Véhicule</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Période</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Montant</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(r => {
                const days = differenceInDays(new Date(r.dateRetour), new Date(r.dateDepart));
                const paye = montantPaye(r);
                return (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.client.prenom} {r.client.nom}</p>
                          <p className="text-xs text-zinc-400">{r.client.telephone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Car className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{r.vehicule.marque} {r.vehicule.modele}</p>
                          <p className="text-xs font-mono text-zinc-400">{r.vehicule.immatriculation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">{formatDate(r.dateDepart)} → {formatDate(r.dateRetour)}</p>
                      <p className="text-xs text-zinc-400">{days} jour{days > 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(r.prixTotal)}</p>
                      {paye < r.prixTotal && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Reste: {formatCurrency(r.prixTotal - paye)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUT_RESERVATION_COLORS[r.statut]}`}>
                        {STATUT_RESERVATION_LABELS[r.statut]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRes ? "Modifier la réservation" : "Nouvelle réservation"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={loading}>{editRes ? "Enregistrer" : "Créer"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Client *</label>
            <select value={form.clientId} onChange={e => setForm(p => ({...p, clientId: e.target.value}))} className="input-base">
              <option value="">Choisir un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Véhicule *</label>
            <select value={form.vehiculeId} onChange={e => setForm(p => ({...p, vehiculeId: e.target.value}))} className="input-base">
              <option value="">Choisir un véhicule</option>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele} — {v.immatriculation}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date de départ *</label>
            <input type="date" value={form.dateDepart} onChange={e => setForm(p => ({...p, dateDepart: e.target.value}))} className="input-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date de retour *</label>
            <input type="date" value={form.dateRetour} onChange={e => setForm(p => ({...p, dateRetour: e.target.value}))} className="input-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Prix total (MAD)
              {computedPrix && !form.prixTotal && (
                <span className="text-xs text-blue-500 ml-2">→ {formatCurrency(parseFloat(computedPrix))} calculé</span>
              )}
            </label>
            <input
              type="number"
              value={form.prixTotal || computedPrix}
              onChange={e => setForm(p => ({...p, prixTotal: e.target.value}))}
              className="input-base"
              placeholder={computedPrix ? `${computedPrix} (calculé)` : "0"}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Caution (MAD)</label>
            <input
              type="number"
              value={form.caution || (form.vehiculeId ? (vehicules.find(v => v.id === form.vehiculeId)?.caution.toString() ?? "") : "")}
              onChange={e => setForm(p => ({...p, caution: e.target.value}))}
              className="input-base"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({...p, statut: e.target.value}))} className="input-base">
              {STATUTS.map(s => <option key={s} value={s}>{STATUT_RESERVATION_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
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
        title="Supprimer cette réservation"
        description="Cette action est irréversible. La réservation et ses paiements associés seront supprimés."
      />
    </div>
  );
}
