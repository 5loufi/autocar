"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isToday, addMonths, subMonths, isSameDay, isWithinInterval,
  format, startOfWeek, endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { STATUT_RESERVATION_COLORS, STATUT_RESERVATION_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Reservation = {
  id: string; dateDepart: Date; dateRetour: Date; statut: string;
  client: { nom: string; prenom: string };
  vehicule: { marque: string; modele: string; immatriculation: string };
};

const STATUS_DOT: Record<string, string> = {
  EN_ATTENTE: "bg-amber-400",
  CONFIRMEE:  "bg-blue-400",
  EN_COURS:   "bg-emerald-400",
  TERMINEE:   "bg-zinc-400",
};

export function CalendrierClient({ reservations }: { reservations: Reservation[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getReservationsForDay = (day: Date) =>
    reservations.filter(r =>
      isWithinInterval(day, { start: new Date(r.dateDepart), end: new Date(r.dateRetour) })
    );

  const selectedDayReservations = selectedDay ? getReservationsForDay(selectedDay) : [];

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Calendrier</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-xs !py-1.5 !px-3">
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card overflow-hidden">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-medium text-zinc-400">{d}</div>
            ))}
          </div>
          {/* Grille des jours */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayReservations = getReservationsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isTodayDate = isToday(day);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                  className={cn(
                    "relative min-h-[72px] p-2 text-left border-b border-r border-zinc-100 dark:border-zinc-800 transition-colors",
                    !isCurrentMonth && "bg-zinc-50/50 dark:bg-zinc-900/50",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20",
                    !isSelected && isCurrentMonth && "hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
                  )}
                >
                  <span className={cn(
                    "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium",
                    isTodayDate && "bg-blue-600 text-white",
                    !isTodayDate && isCurrentMonth && "text-zinc-700 dark:text-zinc-300",
                    !isTodayDate && !isCurrentMonth && "text-zinc-300 dark:text-zinc-600",
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayReservations.slice(0, 2).map(r => (
                      <div key={r.id} className={cn("flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate", STATUT_RESERVATION_COLORS[r.statut])}>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", STATUS_DOT[r.statut])} />
                        <span className="truncate">{r.vehicule.immatriculation}</span>
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <p className="text-xs text-zinc-400 px-1">+{dayReservations.length - 2}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="card p-5">
          {selectedDay ? (
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 capitalize">
                {format(selectedDay, "EEEE d MMMM", { locale: fr })}
              </p>
              {selectedDayReservations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-400">Aucune réservation ce jour</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayReservations.map(r => (
                    <div key={r.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{r.client.prenom} {r.client.nom}</p>
                        <span className={`badge text-xs ${STATUT_RESERVATION_COLORS[r.statut]}`}>
                          {STATUT_RESERVATION_LABELS[r.statut]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">{r.vehicule.marque} {r.vehicule.modele}</p>
                      <p className="text-xs font-mono text-zinc-400">{r.vehicule.immatriculation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Cliquez sur un jour pour voir les réservations</p>
            </div>
          )}

          {/* Légende */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 mb-2">Légende</p>
            <div className="space-y-1.5">
              {Object.entries(STATUT_RESERVATION_LABELS)
                .filter(([k]) => k !== "ANNULEE")
                .map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[key])} />
                    <span className="text-xs text-zinc-500">{label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
