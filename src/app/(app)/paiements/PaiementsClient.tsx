"use client";
import { useState, useMemo } from "react";
import { Plus, CreditCard, Banknote, Search, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, STATUT_PAIEMENT_LABELS, STATUT_PAIEMENT_COLORS, MODE_PAIEMENT_LABELS, TYPE_PAIEMENT_LABELS } from "@/lib/utils";

type ResInfo = { id:string; client:{nom:string;prenom:string}; vehicule:{marque:string;modele:string}; prixTotal:number };
type Paiement = { id:string; montant:number; modePaiement:string; statut:string; type:string; reference:string|null; notes:string|null; createdAt:Date; reservation:ResInfo };

const MODES  = ["ESPECES","CARTE","VIREMENT","CHEQUE"];
const TYPES  = ["ACOMPTE","SOLDE","CAUTION","REMBOURSEMENT"];
const STATUTS= ["EN_ATTENTE","PARTIEL","PAYE","REMBOURSE"];
const defaultForm = { reservationId:"",montant:"",modePaiement:"ESPECES",statut:"PAYE",type:"SOLDE",reference:"",notes:"" };

export function PaiementsClient({ paiements:initial, reservations }:{ paiements:Paiement[]; reservations:ResInfo[] }) {
  const [paiements, setPaiements] = useState(initial);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => paiements.filter(p => {
    const q = search.toLowerCase();
    return !q||p.reservation.client.nom.toLowerCase().includes(q)||p.reservation.client.prenom.toLowerCase().includes(q)||p.reservation.vehicule.marque.toLowerCase().includes(q);
  }), [paiements, search]);

  const totalPaye    = paiements.filter(p=>p.statut==="PAYE").reduce((s,p)=>s+p.montant,0);
  const totalAttente = paiements.filter(p=>p.statut!=="PAYE"&&p.statut!=="REMBOURSE").reduce((s,p)=>s+p.montant,0);
  const totalMois    = paiements.filter(p=>{const d=new Date(p.createdAt);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()&&p.statut==="PAYE";}).reduce((s,p)=>s+p.montant,0);

  async function handleSave() {
    if (!form.reservationId||!form.montant) return;
    setLoading(true);
    try {
      const body = { reservationId:form.reservationId, montant:parseFloat(form.montant), modePaiement:form.modePaiement, statut:form.statut, type:form.type, reference:form.reference||null, notes:form.notes||null };
      const res = await fetch("/api/paiements", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      const created = await res.json();
      const reservation = reservations.find(r=>r.id===form.reservationId)!;
      setPaiements(p => [{...created,reservation},...p]);
      setModalOpen(false); setForm(defaultForm);
    } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/paiements/${deleteId}`, { method:"DELETE" });
      setPaiements(p => p.filter(p=>p.id!==deleteId));
      setDeleteId(null);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Paiements</h2>
          <p className="text-xs text-white/30 mt-1">{paiements.length} transaction{paiements.length>1?"s":""}</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setModalOpen(true); }}><Plus className="w-4 h-4"/>Enregistrer un paiement</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Total encaissé",    value:formatCurrency(totalPaye),    color:"text-emerald-400", bg:"bg-emerald-500/8 border-emerald-500/15", icon:"💰" },
          { label:"Ce mois",           value:formatCurrency(totalMois),    color:"text-violet-400",  bg:"bg-violet-500/8 border-violet-500/15",   icon:"📅" },
          { label:"En attente",        value:formatCurrency(totalAttente), color:"text-amber-400",   bg:"bg-amber-500/8 border-amber-500/15",     icon:"⏳" },
        ].map(s => (
          <div key={s.label} className={`surface p-4 border ${s.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30">{s.label}</span>
              <span className="text-base">{s.icon}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher client, véhicule…" className="input-base pl-9"/>
      </div>

      {filtered.length===0 ? (
        <EmptyState icon={CreditCard} title="Aucun paiement" description="Enregistrez votre premier paiement."/>
      ) : (
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Client / Véhicule</th><th>Type</th><th>Mode</th><th>Montant</th><th>Statut</th><th>Date</th><th/></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="group">
                  <td>
                    <p className="text-sm font-semibold text-white/90">{p.reservation.client.prenom} {p.reservation.client.nom}</p>
                    <p className="text-xs text-white/30">{p.reservation.vehicule.marque} {p.reservation.vehicule.modele}</p>
                  </td>
                  <td><span className="text-xs text-white/50 bg-white/[0.05] px-2 py-0.5 rounded-lg">{TYPE_PAIEMENT_LABELS[p.type]}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm text-white/50">
                      {p.modePaiement==="CARTE"?<CreditCard className="w-3.5 h-3.5"/>:<Banknote className="w-3.5 h-3.5"/>}
                      {MODE_PAIEMENT_LABELS[p.modePaiement]}
                    </div>
                  </td>
                  <td><span className="text-sm font-bold text-white/90">{formatCurrency(p.montant)}</span></td>
                  <td><span className={`badge ${STATUT_PAIEMENT_COLORS[p.statut]}`}>{STATUT_PAIEMENT_LABELS[p.statut]}</span></td>
                  <td><span className="text-xs text-white/30">{formatDate(p.createdAt)}</span></td>
                  <td>
                    <button onClick={() => setDeleteId(p.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-rose-400"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Enregistrer un paiement" size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={handleSave} loading={loading}>Enregistrer</Button></>}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">Réservation *</label>
            <select value={form.reservationId} onChange={e => setForm(p=>({...p,reservationId:e.target.value}))} className="input-base">
              <option value="">Choisir une réservation</option>
              {reservations.map(r => <option key={r.id} value={r.id}>{r.client.prenom} {r.client.nom} — {r.vehicule.marque} ({formatCurrency(r.prixTotal)})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="label">Montant (MAD) *</label><input type="number" value={form.montant} onChange={e => setForm(p=>({...p,montant:e.target.value}))} className="input-base" placeholder="0"/></div>
            <div className="space-y-1.5"><label className="label">Mode</label>
              <select value={form.modePaiement} onChange={e => setForm(p=>({...p,modePaiement:e.target.value}))} className="input-base">
                {MODES.map(m => <option key={m} value={m}>{MODE_PAIEMENT_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><label className="label">Type</label>
              <select value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))} className="input-base">
                {TYPES.map(t => <option key={t} value={t}>{TYPE_PAIEMENT_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><label className="label">Statut</label>
              <select value={form.statut} onChange={e => setForm(p=>({...p,statut:e.target.value}))} className="input-base">
                {STATUTS.map(s => <option key={s} value={s}>{STATUT_PAIEMENT_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5"><label className="label">Référence</label><input value={form.reference} onChange={e => setForm(p=>({...p,reference:e.target.value}))} className="input-base" placeholder="N° reçu, chèque…"/></div>
          <div className="space-y-1.5"><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} className="input-base resize-none" rows={2}/></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={loading}
        title="Supprimer ce paiement" description="Ce paiement sera supprimé définitivement."/>
    </div>
  );
}
