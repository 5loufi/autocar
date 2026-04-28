"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Car, Edit2, Trash2, Gauge, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatCurrency, formatNumber,
  STATUT_VEHICULE_LABELS, STATUT_VEHICULE_COLORS,
} from "@/lib/utils";
import { useRouter } from "next/navigation";

type Vehicule = {
  id: string; marque: string; modele: string; annee: number;
  immatriculation: string; couleur: string; kilometrage: number;
  prixJour: number; caution: number; statut: string; notes: string | null;
  _count: { reservations: number };
};

const STATUTS = ["DISPONIBLE", "RESERVE", "LOUE", "ENTRETIEN", "INDISPONIBLE"];

const defaultForm = {
  marque: "", modele: "", annee: new Date().getFullYear().toString(),
  immatriculation: "", couleur: "", kilometrage: "0",
  prixJour: "", caution: "0", statut: "DISPONIBLE", notes: "",
};

export function VehiculesClient({ vehicules: initial }: { vehicules: Vehicule[] }) {
  const router = useRouter();
  const [vehicules, setVehicules] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicule, setEditVehicule] = useState<Vehicule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => vehicules.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.marque.toLowerCase().includes(q) || v.modele.toLowerCase().includes(q) || v.immatriculation.toLowerCase().includes(q);
    const matchStatut = !filterStatut || v.statut === filterStatut;
    return matchSearch && matchStatut;
  }), [vehicules, search, filterStatut]);

  function openCreate() {
    setEditVehicule(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(v: Vehicule) {
    setEditVehicule(v);
    setForm({
      marque: v.marque, modele: v.modele, annee: v.annee.toString(),
      immatriculation: v.immatriculation, couleur: v.couleur,
      kilometrage: v.kilometrage.toString(), prixJour: v.prixJour.toString(),
      caution: v.caution.toString(), statut: v.statut, notes: v.notes ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.marque || !form.modele || !form.immatriculation || !form.prixJour) return;
    setLoading(true);
    try {
      const body = {
        marque: form.marque, modele: form.modele, annee: parseInt(form.annee),
        immatriculation: form.immatriculation.toUpperCase(), couleur: form.couleur,
        kilometrage: parseInt(form.kilometrage) || 0, prixJour: parseFloat(form.prixJour),
        caution: parseFloat(form.caution) || 0, statut: form.statut, notes: form.notes || null,
      };
      if (editVehicule) {
        const res = await fetch(`/api/vehicules/${editVehicule.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const updated = await res.json();
        setVehicules(prev => prev.map(v => v.id === updated.id ? { ...updated, _count: v._count } : v));
      } else {
        const res = await fetch("/api/vehicules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const created = await res.json();
        setVehicules(prev => [{ ...created, _count: { reservations: 0 } }, ...prev]);
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
      await fetch(`/api/vehicules/${deleteId}`, { method: "DELETE" });
      setVehicules(prev => prev.filter(v => v.id !== deleteId));
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="section-title">Véhicules</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{vehicules.length} véhicule{vehicules.length > 1 ? "s" : ""} dans le parc</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Ajouter un véhicule
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher marque, modèle, immatriculation…"
            className="input-base pl-9"
          />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input-base w-auto">
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_VEHICULE_LABELS[s]}</option>)}
        </select>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Aucun véhicule"
          description="Ajoutez votre premier véhicule pour commencer."
          action={<Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5" /> Ajouter</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div key={v.id} className="card p-5 space-y-4 hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Car className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{v.marque} {v.modele}</p>
                    <p className="text-xs text-zinc-400">{v.annee} · {v.couleur}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                  <button onClick={() => setDeleteId(v.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge ${STATUT_VEHICULE_COLORS[v.statut]}`}>
                  {STATUT_VEHICULE_LABELS[v.statut]}
                </span>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  {v.immatriculation}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-400">Prix/jour</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(v.prixJour)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Kilométrage</p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Gauge className="w-3 h-3" />{formatNumber(v.kilometrage)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Locations</p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{v._count.reservations}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal créer/éditer */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editVehicule ? "Modifier le véhicule" : "Ajouter un véhicule"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={loading}>
              {editVehicule ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Marque *</label>
            <input value={form.marque} onChange={e => setForm(p => ({...p, marque: e.target.value}))} className="input-base" placeholder="Ex: Toyota" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Modèle *</label>
            <input value={form.modele} onChange={e => setForm(p => ({...p, modele: e.target.value}))} className="input-base" placeholder="Ex: Corolla" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Immatriculation *</label>
            <input value={form.immatriculation} onChange={e => setForm(p => ({...p, immatriculation: e.target.value}))} className="input-base" placeholder="Ex: 234-A-50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Année</label>
            <input type="number" value={form.annee} onChange={e => setForm(p => ({...p, annee: e.target.value}))} className="input-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Couleur</label>
            <input value={form.couleur} onChange={e => setForm(p => ({...p, couleur: e.target.value}))} className="input-base" placeholder="Ex: Blanc" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kilométrage</label>
            <input type="number" value={form.kilometrage} onChange={e => setForm(p => ({...p, kilometrage: e.target.value}))} className="input-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prix / jour (MAD) *</label>
            <input type="number" value={form.prixJour} onChange={e => setForm(p => ({...p, prixJour: e.target.value}))} className="input-base" placeholder="450" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Caution (MAD)</label>
            <input type="number" value={form.caution} onChange={e => setForm(p => ({...p, caution: e.target.value}))} className="input-base" placeholder="2000" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({...p, statut: e.target.value}))} className="input-base">
              {STATUTS.map(s => <option key={s} value={s}>{STATUT_VEHICULE_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-base resize-none" rows={2} placeholder="Notes optionnelles…" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={loading}
        title="Supprimer ce véhicule"
        description="Cette action est irréversible. Le véhicule et son historique seront supprimés définitivement."
      />
    </div>
  );
}
