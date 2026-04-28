"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Users, Edit2, Trash2, Phone, Mail, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

type Client = {
  id: string; nom: string; prenom: string; telephone: string;
  email: string | null; adresse: string | null;
  permisNumero: string | null; permisExpiry: Date | null;
  cinNumero: string | null; notes: string | null;
  _count: { reservations: number };
};

const defaultForm = {
  nom: "", prenom: "", telephone: "", email: "", adresse: "",
  permisNumero: "", permisExpiry: "", cinNumero: "", notes: "",
};

export function ClientsClient({ clients: initial }: { clients: Client[] }) {
  const [clients, setClients] = useState(initial);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => clients.filter(c => {
    const q = search.toLowerCase();
    return !q || c.nom.toLowerCase().includes(q) || c.prenom.toLowerCase().includes(q) || c.telephone.includes(q) || (c.email ?? "").toLowerCase().includes(q);
  }), [clients, search]);

  function openCreate() {
    setEditClient(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(c: Client) {
    setEditClient(c);
    setForm({
      nom: c.nom, prenom: c.prenom, telephone: c.telephone,
      email: c.email ?? "", adresse: c.adresse ?? "",
      permisNumero: c.permisNumero ?? "",
      permisExpiry: c.permisExpiry ? new Date(c.permisExpiry).toISOString().split("T")[0] : "",
      cinNumero: c.cinNumero ?? "", notes: c.notes ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.nom || !form.prenom || !form.telephone) return;
    setLoading(true);
    try {
      const body = {
        nom: form.nom, prenom: form.prenom, telephone: form.telephone,
        email: form.email || null, adresse: form.adresse || null,
        permisNumero: form.permisNumero || null,
        permisExpiry: form.permisExpiry ? new Date(form.permisExpiry) : null,
        cinNumero: form.cinNumero || null, notes: form.notes || null,
      };
      if (editClient) {
        const res = await fetch(`/api/clients/${editClient.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const updated = await res.json();
        setClients(prev => prev.map(c => c.id === updated.id ? { ...updated, _count: c._count } : c));
      } else {
        const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const created = await res.json();
        setClients(prev => [{ ...created, _count: { reservations: 0 } }, ...prev]);
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
      await fetch(`/api/clients/${deleteId}`, { method: "DELETE" });
      setClients(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div>
          <h2 className="section-title">Clients</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Nouveau client</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher nom, téléphone, email…"
          className="input-base pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description="Ajoutez votre premier client pour commencer."
          action={<Button onClick={openCreate} size="sm"><Plus className="w-3.5 h-3.5" /> Ajouter</Button>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Permis / CIN</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Locations</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                        {c.prenom[0]}{c.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.prenom} {c.nom}</p>
                        {c.adresse && <p className="text-xs text-zinc-400 truncate max-w-[160px]">{c.adresse}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                        <Phone className="w-3 h-3 text-zinc-400" />{c.telephone}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                          <Mail className="w-3 h-3" />{c.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      {c.permisNumero && <p className="text-xs text-zinc-600 dark:text-zinc-400">Permis: {c.permisNumero}</p>}
                      {c.cinNumero && <p className="text-xs text-zinc-600 dark:text-zinc-400">CIN: {c.cinNumero}</p>}
                      {c.permisExpiry && <p className="text-xs text-zinc-400">Exp: {formatDate(c.permisExpiry)}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      {c._count.reservations} location{c._count.reservations > 1 ? "s" : ""}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                      </button>
                    </div>
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
        title={editClient ? "Modifier le client" : "Nouveau client"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} loading={loading}>{editClient ? "Enregistrer" : "Créer"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Prénom *", key: "prenom", placeholder: "Karim" },
            { label: "Nom *", key: "nom", placeholder: "Bensalem" },
            { label: "Téléphone *", key: "telephone", placeholder: "0661234567" },
            { label: "Email", key: "email", placeholder: "karim@example.com" },
            { label: "N° Permis", key: "permisNumero", placeholder: "A123456" },
            { label: "Expiry Permis", key: "permisExpiry", placeholder: "", type: "date" },
            { label: "N° CIN", key: "cinNumero", placeholder: "BE123456" },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{f.label}</label>
              <input
                type={f.type ?? "text"}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                className="input-base"
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Adresse</label>
            <input value={form.adresse} onChange={e => setForm(p => ({...p, adresse: e.target.value}))} className="input-base" placeholder="12 Rue Hassan II, Casablanca" />
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
        title="Supprimer ce client"
        description="Cette action est irréversible. Le client et son historique seront supprimés."
      />
    </div>
  );
}
