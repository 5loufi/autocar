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
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export const STATUT_VEHICULE_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  RESERVE: "Réservé",
  LOUE: "Loué",
  ENTRETIEN: "En entretien",
  INDISPONIBLE: "Indisponible",
};

export const STATUT_VEHICULE_COLORS: Record<string, string> = {
  DISPONIBLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  RESERVE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  LOUE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ENTRETIEN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  INDISPONIBLE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export const STATUT_RESERVATION_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

export const STATUT_RESERVATION_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMEE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  EN_COURS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  TERMINEE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  ANNULEE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const STATUT_PAIEMENT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PARTIEL: "Partiel",
  PAYE: "Payé",
  REMBOURSE: "Remboursé",
};

export const STATUT_PAIEMENT_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PARTIEL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PAYE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REMBOURSE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export const MODE_PAIEMENT_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  CARTE: "Carte bancaire",
  VIREMENT: "Virement",
  CHEQUE: "Chèque",
};

export const TYPE_PAIEMENT_LABELS: Record<string, string> = {
  ACOMPTE: "Acompte",
  SOLDE: "Solde",
  CAUTION: "Caution",
  REMBOURSEMENT: "Remboursement",
};
