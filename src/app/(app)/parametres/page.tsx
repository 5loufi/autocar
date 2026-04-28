"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Building2, Phone, Mail, MapPin } from "lucide-react";

export default function ParametresPage() {
  const [form, setForm] = useState({
    nom: "AutoGest", telephone: "", email: "", adresse: "",
    devise: "MAD", tva: "20",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <h2 className="section-title">Paramètres</h2>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Informations de l&apos;agence</p>
            <p className="text-xs text-zinc-400">Ces informations apparaîtront sur les contrats et factures</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom de l&apos;agence</label>
            <input value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} className="input-base" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input value={form.telephone} onChange={e => setForm(p => ({...p, telephone: e.target.value}))} className="input-base pl-9" placeholder="0661234567" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input-base pl-9" placeholder="contact@agence.ma" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Devise</label>
            <select value={form.devise} onChange={e => setForm(p => ({...p, devise: e.target.value}))} className="input-base">
              <option value="MAD">MAD — Dirham marocain</option>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dollar</option>
              <option value="TND">TND — Dinar tunisien</option>
              <option value="DZD">DZD — Dinar algérien</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-400" />
              <textarea value={form.adresse} onChange={e => setForm(p => ({...p, adresse: e.target.value}))} className="input-base pl-9 resize-none" rows={2} placeholder="Adresse complète de l'agence" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            {saved ? "Enregistré !" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">À venir</p>
        <div className="space-y-2">
          {["Authentification et gestion des utilisateurs", "Export PDF des contrats", "Notifications par email", "Application mobile"].map(f => (
            <div key={f} className="flex items-center gap-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
              <span className="badge bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Bientôt</span>
              <span className="text-sm text-zinc-500">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
