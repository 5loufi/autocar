"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Car, Edit2, Trash2, Gauge, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatCurrency, formatNumber, STATUT_VEHICULE_LABELS, STATUT_VEHICULE_COLORS } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ExportButton } from "@/components/ui/ExportButton";

type Vehicule = {
  id: string; marque: string; modele: string; annee: number;
  immatriculation: string; couleur: string; kilometrage: number;
  prixJour: number; caution: number; statut: string; notes: string | null;
  _count: { reservations: number };
};

const STATUTS = ["DISPONIBLE","RESERVE","LOUE","ENTRETIEN","INDISPONIBLE"];
const STATUT_DOT: Record<string,string> = {
  DISPONIBLE:"bg-emerald-400", RESERVE:"bg-amber-400",
  LOUE:"bg-violet-400", ENTRETIEN:"bg-orange-400", INDISPONIBLE:"bg-foreground/20",
};
const defaultForm = {
  marque:"", modele:"", annee: new Date().getFullYear().toString(),
  immatriculation:"", couleur:"", kilometrage:"0",
  prixJour:"", caution:"0", statut:"DISPONIBLE", notes:"",
};

export function VehiculesClient({ vehicules: initial }: { vehicules: Vehicule[] }) {
  const { toast } = useToast();
  const [vehicules, setVehicules] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [view, setView] = useState<"grid"|"list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicule, setEditVehicule] = useState<Vehicule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => vehicules.filter(v => {
    const q = search.toLowerCase();
    return (!q || v.marque.toLowerCase().includes(q) || v.modele.toLowerCase().includes(q) || v.immatriculation.toLowerCase().includes(q))
      && (!filterStatut || v.statut === filterStatut);
  }), [vehicules, search, filterStatut]);

  const stats = useMemo(() => ({
    dispo: vehicules.filter(v => v.statut === "DISPONIBLE").length,
    loue:  vehicules.filter(v => v.statut === "LOUE").length,
    entretien: vehicules.filter(v => v.statut === "ENTRETIEN").length,
  }), [vehicules]);

  function openCreate() { setEditVehicule(null); setForm(defaultForm); setModalOpen(true); }
  function openEdit(v: Vehicule) {
    setEditVehicule(v);
    setForm({ marque:v.marque, modele:v.modele, annee:v.annee.toString(), immatriculation:v.immatriculation,
      couleur:v.couleur, kilometrage:v.kilometrage.toString(), prixJour:v.prixJour.toString(),
      caution:v.caution.toString(), statut:v.statut, notes:v.notes??"" });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.marque || !form.modele || !form.immatriculation || !form.prixJour) return;
    setLoading(true);
    try {
      const body = { marque:form.marque, modele:form.modele, annee:parseInt(form.annee),
        immatriculation:form.immatriculation.toUpperCase(), couleur:form.couleur,
        kilometrage:parseInt(form.kilometrage)||0, prixJour:parseFloat(form.prixJour),
        caution:parseFloat(form.caution)||0, statut:form.statut, notes:form.notes||null };
      if (editVehicule) {
        const res = await fetch(`/api/vehicules/${editVehicule.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const updated = await res.json();
        setVehicules(p => p.map(v => v.id === updated.id ? { ...updated, _count:v._count } : v));
      } else {
        const res = await fetch("/api/vehicules", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const created = await res.json();
        setVehicules(p => [{ ...created, _count:{reservations:0} }, ...p]);
      }
      setModalOpen(false);
      toast.success(editVehicule ? "Véhicule mis à jour" : "Véhicule ajouté avec succès");
    } catch { toast.error("Une erreur est survenue"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/vehicules/${deleteId}`, { method:"DELETE" });
      setVehicules(p => p.filter(v => v.id !== deleteId));
      setDeleteId(null);
      toast.success("Véhicule supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="section-title">Véhicules</h2>
          <p className="text-xs text-foreground/30 mt-1">{vehicules.length} véhicule{vehicules.length>1?"s":""} · {stats.dispo} disponible{stats.dispo>1?"s":""} · {stats.loue} loué{stats.loue>1?"s":""}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            filename="vehicules.csv"
            headers={["Marque","Modèle","Immatriculation","Année","Couleur","Kilométrage","Prix/jour","Caution","Statut"]}
            rows={vehicules.map(v => ({ "Marque":v.marque,"Modèle":v.modele,"Immatriculation":v.immatriculation,"Année":v.annee,"Couleur":v.couleur,"Kilométrage":v.kilometrage,"Prix/jour":v.prixJour,"Caution":v.caution,"Statut":STATUT_VEHICULE_LABELS[v.statut] }))}
          />
          <Button onClick={openCreate}><Plus className="w-4 h-4" />Ajouter un véhicule</Button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Disponibles", count:stats.dispo,     color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20" },
          { label:"En location",  count:stats.loue,      color:"text-violet-400",  bg:"bg-violet-500/10 border-violet-500/20"  },
          { label:"Entretien",    count:stats.entretien, color:"text-orange-400",  bg:"bg-orange-500/10 border-orange-500/20"  },
        ].map(s => (
          <div key={s.label} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", s.bg)}>
            <span className={cn("text-2xl font-bold", s.color)}>{s.count}</span>
            <span className="text-xs text-foreground/40">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Marque, modèle, immatriculation…" className="input-base pl-9" />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="input-base w-auto">
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_VEHICULE_LABELS[s]}</option>)}
        </select>
        <div className="flex bg-foreground/[0.04] border border-foreground/[0.07] rounded-xl p-1 gap-0.5">
          {(["grid","list"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={cn("p-1.5 rounded-lg transition-colors", view===v ? "bg-foreground/10 text-foreground" : "text-foreground/30 hover:text-foreground/60")}>
              {v==="grid" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState icon={Car} title="Aucun véhicule" description="Ajoutez votre premier véhicule pour commencer." action={<Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5"/>Ajouter</Button>} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(v => (
            <div key={v.id} className="surface p-5 group hover:border-foreground/[0.12] hover:shadow-card-hover transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/15 to-indigo-600/10 flex items-center justify-center border border-violet-500/15">
                    <Car className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{v.marque} {v.modele}</p>
                    <p className="text-xs text-foreground/30">{v.annee} · {v.couleur}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-foreground/[0.08] rounded-lg transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-foreground/40" />
                  </button>
                  <button onClick={() => setDeleteId(v.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-foreground/40 hover:text-rose-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${STATUT_VEHICULE_COLORS[v.statut]}`}>{STATUT_VEHICULE_LABELS[v.statut]}</span>
                <code className="text-[11px] font-mono text-foreground/40 bg-foreground/[0.05] px-2 py-0.5 rounded-lg">{v.immatriculation}</code>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-foreground/[0.05]">
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-0.5">Prix/jour</p>
                  <p className="text-sm font-bold text-violet-400">{formatCurrency(v.prixJour)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-0.5">Km</p>
                  <p className="text-sm font-semibold text-foreground/70 flex items-center gap-1"><Gauge className="w-3 h-3"/>{formatNumber(v.kilometrage)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-0.5">Locations</p>
                  <p className="text-sm font-semibold text-foreground/70">{v._count.reservations}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Véhicule</th><th>Immatriculation</th><th>Statut</th>
                <th>Prix/jour</th><th>Kilométrage</th><th>Locations</th><th/>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Car className="w-4 h-4 text-violet-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground/90 text-sm">{v.marque} {v.modele}</p>
                        <p className="text-xs text-foreground/30">{v.annee} · {v.couleur}</p>
                      </div>
                    </div>
                  </td>
                  <td><code className="text-xs font-mono text-foreground/50 bg-foreground/[0.05] px-2 py-1 rounded-lg">{v.immatriculation}</code></td>
                  <td><span className={`badge ${STATUT_VEHICULE_COLORS[v.statut]}`}>{STATUT_VEHICULE_LABELS[v.statut]}</span></td>
                  <td><span className="font-bold text-violet-400">{formatCurrency(v.prixJour)}</span></td>
                  <td><span className="text-foreground/50 text-sm">{formatNumber(v.kilometrage)}</span></td>
                  <td><span className="text-foreground/50 text-sm">{v._count.reservations}</span></td>
                  <td>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-foreground/[0.08] rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5 text-foreground/40"/></button>
                      <button onClick={() => setDeleteId(v.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-foreground/40 hover:text-rose-400"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editVehicule ? "Modifier le véhicule" : "Ajouter un véhicule"} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={handleSave} loading={loading}>{editVehicule?"Enregistrer":"Ajouter"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          {[
            {l:"Marque *", k:"marque", p:"Toyota"}, {l:"Modèle *", k:"modele", p:"Corolla"},
            {l:"Immatriculation *", k:"immatriculation", p:"234-A-50"}, {l:"Année", k:"annee", t:"number"},
            {l:"Couleur", k:"couleur", p:"Blanc"}, {l:"Kilométrage", k:"kilometrage", t:"number"},
            {l:"Prix / jour (MAD) *", k:"prixJour", t:"number", p:"450"}, {l:"Caution (MAD)", k:"caution", t:"number"},
          ].map(f => (
            <div key={f.k} className="space-y-1.5">
              <label className="label">{f.l}</label>
              <input type={f.t??"text"} value={(form as any)[f.k]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} className="input-base" placeholder={f.p} />
            </div>
          ))}
          <div className="col-span-2 space-y-1.5">
            <label className="label">Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({...p,statut:e.target.value}))} className="input-base">
              {STATUTS.map(s => <option key={s} value={s}>{STATUT_VEHICULE_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} className="input-base resize-none" rows={2}/>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={loading}
        title="Supprimer ce véhicule" description="Cette action est irréversible. Le véhicule et son historique seront supprimés définitivement." />
    </div>
  );
}
