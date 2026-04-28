"use client";
import { useState, useMemo } from "react";
import { Plus, Wrench, Trash2, Search, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { isPast, addDays } from "date-fns";

type Vehicule = { id: string; marque: string; modele: string; immatriculation: string };
type Entretien = {
  id: string; vehiculeId: string; date: Date; type: string;
  cout: number | null; notes: string | null; prochainRappel: Date | null;
  vehicule: Vehicule;
};

const defaultForm = { vehiculeId: "", date: "", type: "", cout: "", notes: "", prochainRappel: "" };

export function EntretienClient({ entretiens: initial, vehicules }: { entretiens: Entretien[]; vehicules: Vehicule[] }) {
  const { toast } = useToast();
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

  const rappelsProches = entretiens.filter(e =>
    e.prochainRappel && !isPast(new Date(e.prochainRappel)) && isPast(addDays(new Date(e.prochainRappel), -7))
  );
  const rappelsEnRetard = entretiens.filter(e =>
    e.prochainRappel && isPast(new Date(e.prochainRappel))
  );

  async function handleSave() {
    if (!form.vehiculeId || !form.date || !form.type) return;
    setLoading(true);
    try {
      const body = {
        vehiculeId: form.vehiculeId, date: new Date(form.date), type: form.type,
        cout: form.cout ? parseFloat(form.cout) : null,
        notes: form.notes || null,
        prochainRappel: form.prochainRappel ? new Date(form.prochainRappel) : null,
      };
      const res = await fetch("/api/entretien", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const created = await res.json();
      const vehicule = vehicules.find(v => v.id === form.vehiculeId)!;
      setEntretiens(prev => [{ ...created, vehicule }, ...prev]);
      setModalOpen(false); setForm(defaultForm);
      toast.success("Entretien enregistré");
    } catch { toast.error("Une erreur est survenue"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/entretien/${deleteId}`, { method: "DELETE" });
      setEntretiens(prev => prev.filter(e => e.id !== deleteId));
      setDeleteId(null);
      toast.success("Entretien supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Entretien</h2>
          <p className="text-xs text-foreground/30 mt-1">{entretiens.length} entrée{entretiens.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Ajouter un entretien
        </Button>
      </div>

      {/* Alert banners */}
      {rappelsEnRetard.length > 0 && (
        <div className="flex items-start gap-3 bg-rose-500/8 border border-rose-500/20 rounded-2xl px-5 py-3.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-400">{rappelsEnRetard.length} entretien{rappelsEnRetard.length > 1 ? "s" : ""} en retard</p>
            <p className="text-xs text-rose-400/70 mt-0.5">
              {rappelsEnRetard.map(e => `${e.vehicule.marque} ${e.vehicule.modele}`).join(" · ")}
            </p>
          </div>
        </div>
      )}
      {rappelsProches.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl px-5 py-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">{rappelsProches.length} rappel{rappelsProches.length > 1 ? "s" : ""} dans les 7 prochains jours</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {rappelsProches.map(e => `${e.vehicule.marque} ${e.vehicule.modele}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/25" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Véhicule, type d'entretien…" className="input-base pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Wrench} title="Aucun entretien" description="Enregistrez le premier entretien d'un véhicule." />
      ) : (
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Véhicule</th><th>Type</th><th>Date</th><th>Coût</th><th>Prochain rappel</th><th /></tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const enRetard = e.prochainRappel && isPast(new Date(e.prochainRappel));
                const bientot = e.prochainRappel && !enRetard && isPast(addDays(new Date(e.prochainRappel), -7));
                return (
                  <tr key={e.id} className="group">
                    <td>
                      <p className="text-sm font-semibold text-foreground/90">{e.vehicule.marque} {e.vehicule.modele}</p>
                      <code className="text-[11px] font-mono text-foreground/30">{e.vehicule.immatriculation}</code>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Wrench className="w-3 h-3 text-orange-400" />
                        </div>
                        <div>
                          <span className="text-sm text-foreground/80">{e.type}</span>
                          {e.notes && <p className="text-xs text-foreground/30 mt-0.5 max-w-[160px] truncate">{e.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                        <Calendar className="w-3 h-3" />
                        {formatDate(e.date)}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-foreground/80">
                        {e.cout != null ? formatCurrency(e.cout) : <span className="text-foreground/20">—</span>}
                      </span>
                    </td>
                    <td>
                      {e.prochainRappel ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          enRetard
                            ? "bg-rose-500/12 text-rose-400 border border-rose-500/20"
                            : bientot
                            ? "bg-amber-500/12 text-amber-400 border border-amber-500/20"
                            : "text-foreground/40"
                        }`}>
                          {(enRetard || bientot) && <AlertTriangle className="w-3 h-3" />}
                          {formatDate(e.prochainRappel)}
                        </span>
                      ) : (
                        <span className="text-foreground/20 text-sm">—</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5 text-foreground/40 hover:text-rose-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un entretien" size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={handleSave} loading={loading}>Enregistrer</Button></>}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">Véhicule *</label>
            <select value={form.vehiculeId} onChange={e => setForm(p => ({...p, vehiculeId: e.target.value}))} className="input-base">
              <option value="">Choisir un véhicule</option>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele} — {v.immatriculation}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Type d&apos;entretien *</label>
            <input value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="input-base" placeholder="Ex: Vidange, pneus, révision…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="input-base" />
            </div>
            <div className="space-y-1.5">
              <label className="label">Coût (MAD)</label>
              <input type="number" value={form.cout} onChange={e => setForm(p => ({...p, cout: e.target.value}))} className="input-base" placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label">Prochain rappel</label>
            <input type="date" value={form.prochainRappel} onChange={e => setForm(p => ({...p, prochainRappel: e.target.value}))} className="input-base" />
          </div>
          <div className="space-y-1.5">
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="input-base resize-none" rows={2} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={loading}
        title="Supprimer cet entretien" description="Cet enregistrement sera supprimé définitivement." />
    </div>
  );
}
