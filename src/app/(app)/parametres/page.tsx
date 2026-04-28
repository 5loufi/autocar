"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Save, Building2, Phone, Mail, MapPin, Zap, CheckCircle2 } from "lucide-react";

export default function ParametresPage() {
  const [form, setForm] = useState({
    nom: "AutoGest", telephone: "", email: "", adresse: "",
    devise: "MAD", tva: "20",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5 animate-slide-up max-w-2xl">
      <div>
        <h2 className="section-title">Paramètres</h2>
        <p className="text-xs text-white/30 mt-1">Configuration de l&apos;agence</p>
      </div>

      {/* Agency info card */}
      <div className="surface p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/25 to-indigo-600/15 border border-violet-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Informations de l&apos;agence</p>
            <p className="text-xs text-white/30">Apparaîtront sur les contrats et factures</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label">Nom de l&apos;agence</label>
            <input value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} className="input-base" placeholder="AutoGest" />
          </div>
          <div className="space-y-1.5">
            <label className="label">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input value={form.telephone} onChange={e => setForm(p => ({...p, telephone: e.target.value}))} className="input-base pl-9" placeholder="0661234567" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input-base pl-9" placeholder="contact@agence.ma" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label">Devise</label>
            <select value={form.devise} onChange={e => setForm(p => ({...p, devise: e.target.value}))} className="input-base">
              <option value="MAD">MAD — Dirham marocain</option>
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — Dollar</option>
              <option value="TND">TND — Dinar tunisien</option>
              <option value="DZD">DZD — Dinar algérien</option>
            </select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="label">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-white/25" />
              <textarea value={form.adresse} onChange={e => setForm(p => ({...p, adresse: e.target.value}))} className="input-base pl-9 resize-none" rows={2} placeholder="Adresse complète de l'agence" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={handleSave}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Enregistré</> : <><Save className="w-4 h-4" /> Enregistrer</>}
          </Button>
        </div>
      </div>

      {/* Coming soon card */}
      <div className="surface p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-400" />
          <p className="text-sm font-semibold text-white/70">Fonctionnalités à venir</p>
        </div>
        <div className="space-y-1">
          {[
            "Authentification et gestion des utilisateurs",
            "Export PDF des contrats",
            "Notifications par email",
            "Application mobile",
            "Synchronisation comptable",
          ].map(f => (
            <div key={f} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
              <span className="text-[10px] font-semibold text-white/25 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md uppercase tracking-wide flex-shrink-0">Bientôt</span>
              <span className="text-sm text-white/40">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
