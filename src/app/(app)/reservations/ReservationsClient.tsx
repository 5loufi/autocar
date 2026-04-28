"use client";
import { useState, useMemo } from "react";
import { Plus, Search, CalendarCheck, Edit2, Trash2, Car, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, STATUT_RESERVATION_LABELS, STATUT_RESERVATION_COLORS } from "@/lib/utils";
import { differenceInDays } from "date-fns";

type Vehicule = { id:string; marque:string; modele:string; immatriculation:string; prixJour:number; caution:number };
type Client   = { id:string; nom:string; prenom:string; telephone:string };
type Paiement = { id:string; montant:number; statut:string };
type Reservation = { id:string; vehiculeId:string; clientId:string; dateDepart:Date; dateRetour:Date;
  prixTotal:number; caution:number; statut:string; notes:string|null;
  vehicule:Vehicule; client:Client; paiements:Paiement[] };

const STATUTS = ["EN_ATTENTE","CONFIRMEE","EN_COURS","TERMINEE","ANNULEE"];
const defaultForm = { vehiculeId:"",clientId:"",dateDepart:"",dateRetour:"",prixTotal:"",caution:"",statut:"EN_ATTENTE",notes:"" };

export function ReservationsClient({ reservations:initial, vehicules, clients }:
  { reservations:Reservation[]; vehicules:Vehicule[]; clients:Client[] }) {
  const [reservations, setReservations] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRes, setEditRes] = useState<Reservation|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => reservations.filter(r => {
    const q = search.toLowerCase();
    return (!q||r.client.nom.toLowerCase().includes(q)||r.client.prenom.toLowerCase().includes(q)||r.vehicule.marque.toLowerCase().includes(q)||r.vehicule.immatriculation.toLowerCase().includes(q))
      && (!filterStatut||r.statut===filterStatut);
  }), [reservations, search, filterStatut]);

  const computedPrix = useMemo(() => {
    if (!form.vehiculeId||!form.dateDepart||!form.dateRetour) return "";
    const v = vehicules.find(v => v.id===form.vehiculeId); if (!v) return "";
    const d = differenceInDays(new Date(form.dateRetour), new Date(form.dateDepart));
    return d>0 ? (d*v.prixJour).toString() : "";
  }, [form.vehiculeId, form.dateDepart, form.dateRetour, vehicules]);

  function openCreate() { setEditRes(null); setForm(defaultForm); setModalOpen(true); }
  function openEdit(r: Reservation) {
    setEditRes(r);
    setForm({ vehiculeId:r.vehiculeId, clientId:r.clientId,
      dateDepart:new Date(r.dateDepart).toISOString().split("T")[0],
      dateRetour:new Date(r.dateRetour).toISOString().split("T")[0],
      prixTotal:r.prixTotal.toString(), caution:r.caution.toString(), statut:r.statut, notes:r.notes??"" });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.vehiculeId||!form.clientId||!form.dateDepart||!form.dateRetour) return;
    setLoading(true);
    try {
      const body = { vehiculeId:form.vehiculeId, clientId:form.clientId,
        dateDepart:new Date(form.dateDepart), dateRetour:new Date(form.dateRetour),
        prixTotal:parseFloat(form.prixTotal||computedPrix||"0"),
        caution:parseFloat(form.caution||"0"), statut:form.statut, notes:form.notes||null };
      if (editRes) {
        const res = await fetch(`/api/reservations/${editRes.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const updated = await res.json();
        const v=vehicules.find(v=>v.id===updated.vehiculeId)!, c=clients.find(c=>c.id===updated.clientId)!;
        setReservations(p => p.map(r => r.id===updated.id?{...updated,vehicule:v,client:c,paiements:editRes.paiements}:r));
      } else {
        const res = await fetch("/api/reservations", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const created = await res.json();
        const v=vehicules.find(v=>v.id===created.vehiculeId)!, c=clients.find(c=>c.id===created.clientId)!;
        setReservations(p => [{...created,vehicule:v,client:c,paiements:[]},...p]);
      }
      setModalOpen(false);
    } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/reservations/${deleteId}`, { method:"DELETE" });
      setReservations(p => p.filter(r => r.id!==deleteId));
      setDeleteId(null);
    } finally { setLoading(false); }
  }

  const montantPaye = (r:Reservation) => r.paiements.filter(p=>p.statut==="PAYE").reduce((s,p)=>s+p.montant,0);

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Réservations</h2>
          <p className="text-xs text-white/30 mt-1">{reservations.length} réservation{reservations.length>1?"s":""}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4"/>Nouvelle réservation</Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
        {["", ...STATUTS].map(s => {
          const count = s ? reservations.filter(r=>r.statut===s).length : reservations.length;
          return (
            <button key={s} onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${filterStatut===s?"bg-white/10 text-white":"text-white/30 hover:text-white/60"}`}>
              {s ? STATUT_RESERVATION_LABELS[s] : "Toutes"}
              <span className={`ml-1.5 text-[10px] ${filterStatut===s?"text-violet-400":"text-white/20"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, véhicule…" className="input-base pl-9"/>
      </div>

      {filtered.length===0 ? (
        <EmptyState icon={CalendarCheck} title="Aucune réservation" description="Créez votre première réservation."
          action={<Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5"/>Créer</Button>}/>
      ) : (
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Client</th><th>Véhicule</th><th>Période</th><th>Montant</th><th>Statut</th><th/></tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const days = differenceInDays(new Date(r.dateRetour), new Date(r.dateDepart));
                const paye = montantPaye(r);
                const reste = r.prixTotal - paye;
                return (
                  <tr key={r.id} className="group">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 flex items-center justify-center text-[11px] font-bold text-violet-400 flex-shrink-0">
                          {r.client.prenom[0]}{r.client.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/90">{r.client.prenom} {r.client.nom}</p>
                          <p className="text-xs text-white/30">{r.client.telephone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-white/25 flex-shrink-0"/>
                        <div>
                          <p className="text-sm text-white/70">{r.vehicule.marque} {r.vehicule.modele}</p>
                          <code className="text-[11px] font-mono text-white/30">{r.vehicule.immatriculation}</code>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <span>{formatDate(r.dateDepart)}</span>
                        <ArrowRight className="w-3 h-3 text-white/20"/>
                        <span>{formatDate(r.dateRetour)}</span>
                      </div>
                      <p className="text-[11px] text-white/25 mt-0.5">{days} jour{days>1?"s":""}</p>
                    </td>
                    <td>
                      <p className="text-sm font-bold text-white/90">{formatCurrency(r.prixTotal)}</p>
                      {reste>0 && <p className="text-[11px] text-amber-400 mt-0.5">Reste: {formatCurrency(reste)}</p>}
                    </td>
                    <td>
                      <span className={`badge ${STATUT_RESERVATION_COLORS[r.statut]}`}>
                        {STATUT_RESERVATION_LABELS[r.statut]}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5 text-white/40"/></button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-rose-400"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editRes?"Modifier la réservation":"Nouvelle réservation"} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={handleSave} loading={loading}>{editRes?"Enregistrer":"Créer"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label">Client *</label>
            <select value={form.clientId} onChange={e => setForm(p=>({...p,clientId:e.target.value}))} className="input-base">
              <option value="">Choisir un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Véhicule *</label>
            <select value={form.vehiculeId} onChange={e => setForm(p=>({...p,vehiculeId:e.target.value}))} className="input-base">
              <option value="">Choisir un véhicule</option>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.marque} {v.modele} — {v.immatriculation}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="label">Date de départ *</label>
            <input type="date" value={form.dateDepart} onChange={e => setForm(p=>({...p,dateDepart:e.target.value}))} className="input-base"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Date de retour *</label>
            <input type="date" value={form.dateRetour} onChange={e => setForm(p=>({...p,dateRetour:e.target.value}))} className="input-base"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">
              Prix total (MAD)
              {computedPrix&&!form.prixTotal&&<span className="ml-2 text-violet-400 normal-case font-normal">→ {formatCurrency(parseFloat(computedPrix))} calculé</span>}
            </label>
            <input type="number" value={form.prixTotal||computedPrix} onChange={e => setForm(p=>({...p,prixTotal:e.target.value}))} className="input-base"/>
          </div>
          <div className="space-y-1.5">
            <label className="label">Caution (MAD)</label>
            <input type="number" value={form.caution||(form.vehiculeId?(vehicules.find(v=>v.id===form.vehiculeId)?.caution.toString()??""):"")} onChange={e => setForm(p=>({...p,caution:e.target.value}))} className="input-base"/>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="label">Statut</label>
            <select value={form.statut} onChange={e => setForm(p=>({...p,statut:e.target.value}))} className="input-base">
              {STATUTS.map(s => <option key={s} value={s}>{STATUT_RESERVATION_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} className="input-base resize-none" rows={2}/>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={loading}
        title="Supprimer cette réservation" description="Cette action est irréversible. La réservation et ses paiements associés seront supprimés."/>
    </div>
  );
}
