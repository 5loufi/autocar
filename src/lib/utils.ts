import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "d MMM yyyy", { locale: fr });
}
export function formatDateFull(date: Date | string) {
  return format(new Date(date), "d MMMM yyyy", { locale: fr });
}
export function formatDateTime(date: Date | string) {
  return format(new Date(date), "d MMM yyyy 'à' HH:mm", { locale: fr });
}
export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { locale: fr, addSuffix: true });
}
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(amount);
}
export function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export const STATUT_VEHICULE_LABELS: Record<string, string> = {
  DISPONIBLE:   "Disponible",
  RESERVE:      "Réservé",
  LOUE:         "Loué",
  ENTRETIEN:    "En entretien",
  INDISPONIBLE: "Indisponible",
};

export const STATUT_VEHICULE_COLORS: Record<string, string> = {
  DISPONIBLE:   "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20",
  RESERVE:      "bg-amber-500/12 text-amber-400 border border-amber-500/20",
  LOUE:         "bg-violet-500/12 text-violet-400 border border-violet-500/20",
  ENTRETIEN:    "bg-orange-500/12 text-orange-400 border border-orange-500/20",
  INDISPONIBLE: "bg-white/[0.06] text-white/30",
};

export const STATUT_RESERVATION_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE:  "Confirmée",
  EN_COURS:   "En cours",
  TERMINEE:   "Terminée",
  ANNULEE:    "Annulée",
};

export const STATUT_RESERVATION_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-amber-500/12 text-amber-400 border border-amber-500/20",
  CONFIRMEE:  "bg-blue-500/12 text-blue-400 border border-blue-500/20",
  EN_COURS:   "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20",
  TERMINEE:   "bg-white/[0.06] text-white/30",
  ANNULEE:    "bg-rose-500/12 text-rose-400 border border-rose-500/20",
};

export const STATUT_PAIEMENT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PARTIEL:    "Partiel",
  PAYE:       "Payé",
  REMBOURSE:  "Remboursé",
};

export const STATUT_PAIEMENT_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-amber-500/12 text-amber-400 border border-amber-500/20",
  PARTIEL:    "bg-blue-500/12 text-blue-400 border border-blue-500/20",
  PAYE:       "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20",
  REMBOURSE:  "bg-white/[0.06] text-white/30",
};

export const MODE_PAIEMENT_LABELS: Record<string, string> = {
  ESPECES:  "Espèces",
  CARTE:    "Carte bancaire",
  VIREMENT: "Virement",
  CHEQUE:   "Chèque",
};

export const TYPE_PAIEMENT_LABELS: Record<string, string> = {
  ACOMPTE:       "Acompte",
  SOLDE:         "Solde",
  CAUTION:       "Caution",
  REMBOURSEMENT: "Remboursement",
};
