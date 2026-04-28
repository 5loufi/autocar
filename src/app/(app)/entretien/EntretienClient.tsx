"use client";
import { useState, useMemo } from "react";
import { Plus, Wrench, Trash2, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { isPast, addDays } from "date-fns";

type Vehicule = { id: string; marque: string; modele: string; immatriculation: string };
type Entretien = {
  id: string; vehiculeId: string; date: Date; type: string;
  cout: number | null; notes: string | null; prochainRappel: Date | null;
  vehicule: Vehicule;
};

const defaultForm = { vehiculeId: "", date: "", type: "", cout: "", notes: "", prochainRappel: "" };

export function EntretienClient({ entretiens: initial, vehicules }: { entretiens: Entretien[]; vehicules: Vehicule[] }) {
  const [entretiens, setEntretiens] = useState(initial);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => entretiens.filter(e => {
    const q = search.toLowerCase();
    return !q || e.vehicule.marque.toLowerCase().includes(q) || e.vehicule.modele.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
  }), [entretiens, search]);

  const rappelsProches = entretiens.filter(e => e.prochainRappel && !isPast(new Date(e.prochainRappel)) && isPast(addDays(new Date(e.prochainRappel), -7)));

  async function handleSave() {
    if (!form.vehiculeId || !form.date || !form.type) return;
    setLoading(true);
    try {
      const body = {
        vehiculeId: form.vehiculeId,
        date: new Date(form.date),
        type: form.type,
        cout: form.cout ? parseFloat(form.cout) : null,
        notes: form.notes || null,
        prochainRappel: form.prochainRappel ? new Date(form.prochainRappel) : null,
      };
      const res = await fetch("/api/entretien", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const created = await res.json();
      const vehicule = vehicules.find(v => v.id === form.vehiculeId)!;
      setEntretiens(prev => [{ ...created, vehicule }, ...prev]);
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
      await fetch(`/api/entretien/${deleteId}`, { method: "DELETE" });
      setEntretiens(prev => prev.filter(e => e.id !== deleteId));
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Entretien des véhicules</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{entretiens.length} entrée{entretiens.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Ajouter un entretien
        </Button>
      </div>

      {rappelsProches.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{rappelsProches.length} rappel{rappelsProches.length > 1 ? "s" : ""} d&apos;entretien dans les 7 prochains jours</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              {rappelsProches.map(e => `${e.vehicule.marque} ${e.vehicule.modele}`).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher véhicule, type d'entretien…" className="input-base pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Wrench} title="Aucun entretien" description="Enregistrez le premier entretien d'un véhicule." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Véhicule</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Coût</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Prochain rappel</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(e => {
                const rappelBientot = e.prochainRappel && !isPast(new Date(e.prochainRappel)) && isPast(addDays(new Date(e.prochainRappel), -7));
                return (
                  <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{e.vehicule.marque} {e.vehicule.modele}</p>
                      <p className="text-xs font-mono text-zinc-400">{e.vehicule.immatriculation}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{e.type}</span>
                      </div>
                      {e.notes && <p className="text-xs text-zinc-400 mt-0.5">{e.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{formatDate(e.date)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {e.cout != null ? formatCurrency(e.cout) : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {e.prochainRappel ? (
                        <span className={`text-sm font-medium ${rappelBientot ? "text-amber-600 dark:text-amber-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                          {rappelBientot && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                          {formatDate(e.prochainRappel)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                      </button>
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
        title="Ajouter un entretien"
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
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Véhicule *</label>
            <select value={form.vehiculeId} onChange={e => setForm(p => ({...p, vehiculeId: e.target.value}))} className="input-base">
              <option value="">Choisir un véhicule</option>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele} — {v.immatriculation}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="input-base" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Coût (MAD)</label>
              <input type="number" value={form.cout} onChange={e => setForm(p => ({...p, cout: e.target.value}))} className="input-base" placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type d&apos;entretien *</label>
            <input value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="input-base" placeholder="Ex: Vidange, pneus, révision…" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prochain rappel</label>
            <input type="date" value={form.prochainRappel} onChange={e => setForm(p => ({...p, prochainRappel: e.target.value}))} className="input-base" />
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
        title="Supprimer cet entretien"
        description="Cet enregistrement sera supprimé définitivement."
      />
    </div>
  );
}
