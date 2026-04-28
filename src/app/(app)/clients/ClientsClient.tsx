"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Users, Edit2, Trash2, Phone, Mail, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type Client = {
  id: string; nom: string; prenom: string; telephone: string;
  email: string|null; adresse: string|null; permisNumero: string|null;
  permisExpiry: Date|null; cinNumero: string|null; notes: string|null;
  _count: { reservations: number };
};
const defaultForm = { nom:"",prenom:"",telephone:"",email:"",adresse:"",permisNumero:"",permisExpiry:"",cinNumero:"",notes:"" };

const AVATAR_COLORS = [
  "from-violet-600 to-indigo-600","from-emerald-600 to-cyan-600",
  "from-amber-600 to-orange-600","from-rose-600 to-pink-600","from-blue-600 to-cyan-600",
];

export function ClientsClient({ clients: initial }: { clients: Client[] }) {
  const { toast } = useToast();
  const [clients, setClients] = useState(initial);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.nom.toLowerCase().includes(q) || c.prenom.toLowerCase().includes(q)
      || c.telephone.includes(q) || (c.email??"").toLowerCase().includes(q);
  }), [clients, search]);

  function openCreate() { setEditClient(null); setForm(defaultForm); setModalOpen(true); }
  function openEdit(c: Client) {
    setEditClient(c);
    setForm({ nom:c.nom, prenom:c.prenom, telephone:c.telephone, email:c.email??"", adresse:c.adresse??"",
      permisNumero:c.permisNumero??"", permisExpiry:c.permisExpiry?new Date(c.permisExpiry).toISOString().split("T")[0]:"",
      cinNumero:c.cinNumero??"", notes:c.notes??"" });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.nom||!form.prenom||!form.telephone) return;
    setLoading(true);
    try {
      const body = { nom:form.nom, prenom:form.prenom, telephone:form.telephone,
        email:form.email||null, adresse:form.adresse||null,
        permisNumero:form.permisNumero||null,
        permisExpiry:form.permisExpiry?new Date(form.permisExpiry):null,
        cinNumero:form.cinNumero||null, notes:form.notes||null };
      if (editClient) {
        const res = await fetch(`/api/clients/${editClient.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const updated = await res.json();
        setClients(p => p.map(c => c.id===updated.id?{...updated,_count:c._count}:c));
      } else {
        const res = await fetch("/api/clients", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
        const created = await res.json();
        setClients(p => [{...created,_count:{reservations:0}},...p]);
      }
      setModalOpen(false);
      toast.success(editClient ? "Client mis à jour" : "Client créé avec succès");
    } catch { toast.error("Une erreur est survenue"); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/clients/${deleteId}`, { method:"DELETE" });
      setClients(p => p.filter(c => c.id!==deleteId));
      setDeleteId(null);
      toast.success("Client supprimé");
    } catch { toast.error("Erreur lors de la suppression"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Clients</h2>
          <p className="text-xs text-foreground/30 mt-1">{clients.length} client{clients.length>1?"s":""} enregistré{clients.length>1?"s":""}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4"/>Nouveau client</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/25"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, téléphone, email…" className="input-base pl-9"/>
      </div>

      {filtered.length===0 ? (
        <EmptyState icon={Users} title="Aucun client" description="Ajoutez votre premier client."
          action={<Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5"/>Ajouter</Button>}/>
      ) : (
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Client</th><th>Contact</th><th>Documents</th><th>Locations</th><th/></tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0", AVATAR_COLORS[i % AVATAR_COLORS.length])}>
                        {c.prenom[0]}{c.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground/90">{c.prenom} {c.nom}</p>
                        {c.adresse && <p className="text-xs text-foreground/30 truncate max-w-[180px]">{c.adresse}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                        <Phone className="w-3 h-3 text-foreground/30"/>{c.telephone}
                      </div>
                      {c.email && <div className="flex items-center gap-1.5 text-xs text-foreground/35">
                        <Mail className="w-3 h-3 text-foreground/20"/>{c.email}
                      </div>}
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      {c.permisNumero && <p className="text-xs text-foreground/50">Permis: <span className="font-mono">{c.permisNumero}</span></p>}
                      {c.cinNumero && <p className="text-xs text-foreground/50">CIN: <span className="font-mono">{c.cinNumero}</span></p>}
                      {c.permisExpiry && <p className="text-[11px] text-foreground/25">Exp: {formatDate(c.permisExpiry)}</p>}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold",
                        c._count.reservations>0?"bg-violet-500/15 text-violet-400":"bg-foreground/[0.05] text-foreground/25")}>
                        {c._count.reservations}
                      </div>
                      <span className="text-xs text-foreground/30">location{c._count.reservations!==1?"s":""}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-foreground/[0.08] rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5 text-foreground/40"/></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-foreground/40 hover:text-rose-400"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editClient?"Modifier le client":"Nouveau client"} size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button><Button onClick={handleSave} loading={loading}>{editClient?"Enregistrer":"Créer"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          {[
            {l:"Prénom *",k:"prenom",p:"Karim"},{l:"Nom *",k:"nom",p:"Bensalem"},
            {l:"Téléphone *",k:"telephone",p:"0661234567"},{l:"Email",k:"email",p:"karim@example.com"},
            {l:"N° Permis",k:"permisNumero",p:"A123456"},{l:"Expiry Permis",k:"permisExpiry",t:"date"},
            {l:"N° CIN",k:"cinNumero",p:"BE123456"},
          ].map(f => (
            <div key={f.k} className="space-y-1.5">
              <label className="label">{f.l}</label>
              <input type={f.t??"text"} value={(form as any)[f.k]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))} className="input-base" placeholder={(f as any).p}/>
            </div>
          ))}
          <div className="col-span-2 space-y-1.5">
            <label className="label">Adresse</label>
            <input value={form.adresse} onChange={e => setForm(p => ({...p,adresse:e.target.value}))} className="input-base" placeholder="12 Rue Hassan II, Casablanca"/>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p,notes:e.target.value}))} className="input-base resize-none" rows={2}/>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={loading}
        title="Supprimer ce client" description="Cette action est irréversible. Le client et son historique seront supprimés."/>
    </div>
  );
}
