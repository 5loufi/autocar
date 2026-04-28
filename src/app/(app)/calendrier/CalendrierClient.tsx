"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth,
  isToday, addMonths, subMonths, isSameDay, isWithinInterval,
  format, startOfWeek, endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { STATUT_RESERVATION_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Reservation = {
  id: string; dateDepart: Date; dateRetour: Date; statut: string;
  client: { nom: string; prenom: string };
  vehicule: { marque: string; modele: string; immatriculation: string };
};

const STATUS_COLOR: Record<string, { dot: string; pill: string }> = {
  EN_ATTENTE: { dot: "bg-amber-400",   pill: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  CONFIRMEE:  { dot: "bg-blue-400",    pill: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  EN_COURS:   { dot: "bg-emerald-400", pill: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  TERMINEE:   { dot: "bg-foreground/20",    pill: "bg-foreground/5 text-foreground/40 border border-foreground/10" },
  ANNULEE:    { dot: "bg-rose-400",    pill: "bg-rose-500/10 text-rose-400 border border-rose-500/20" },
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
        <div>
          <h2 className="section-title">Calendrier</h2>
          <p className="text-xs text-foreground/30 mt-1">{reservations.length} réservation{reservations.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-foreground/[0.06] rounded-xl transition-colors border border-foreground/[0.06]">
            <ChevronLeft className="w-4 h-4 text-foreground/50" />
          </button>
          <span className="text-sm font-semibold text-foreground/80 capitalize min-w-[150px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-foreground/[0.06] rounded-xl transition-colors border border-foreground/[0.06]">
            <ChevronRight className="w-4 h-4 text-foreground/50" />
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold text-foreground/60 hover:text-foreground border border-foreground/[0.08] hover:border-violet-500/40 rounded-xl transition-all bg-foreground/[0.03] hover:bg-violet-500/10">
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <div className="xl:col-span-2 surface overflow-hidden">
          <div className="grid grid-cols-7 border-b border-foreground/[0.06]">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(d => (
              <div key={d} className="py-3 text-center text-[11px] font-semibold text-foreground/25 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayReservations = getReservationsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isTodayDate = isToday(day);
              return (
                <button key={idx}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                  className={cn(
                    "relative min-h-[76px] p-2 text-left border-b border-r border-foreground/[0.04] transition-all duration-150",
                    !isCurrentMonth && "opacity-30",
                    isSelected && "bg-violet-500/10",
                    !isSelected && isCurrentMonth && "hover:bg-foreground/[0.03]",
                  )}>
                  <span className={cn(
                    "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                    isTodayDate && "bg-violet-600 text-white shadow-glow-sm",
                    !isTodayDate && isCurrentMonth && "text-foreground/60",
                    !isTodayDate && !isCurrentMonth && "text-foreground/20",
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayReservations.slice(0, 2).map(r => (
                      <div key={r.id} className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] truncate font-medium",
                        STATUS_COLOR[r.statut]?.pill ?? "bg-foreground/5 text-foreground/40"
                      )}>
                        <span className={cn("w-1 h-1 rounded-full flex-shrink-0", STATUS_COLOR[r.statut]?.dot ?? "bg-foreground/20")} />
                        <span className="truncate">{r.vehicule.immatriculation}</span>
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <p className="text-[10px] text-foreground/30 px-1">+{dayReservations.length - 2} autre{dayReservations.length - 2 > 1 ? "s" : ""}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="surface p-5 flex flex-col">
          {selectedDay ? (
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground/40 uppercase tracking-widest mb-1">Sélectionné</p>
              <p className="text-sm font-bold text-foreground/90 mb-4 capitalize">
                {format(selectedDay, "EEEE d MMMM", { locale: fr })}
              </p>
              {selectedDayReservations.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarDays className="w-8 h-8 text-foreground/10 mx-auto mb-2" />
                  <p className="text-sm text-foreground/25">Aucune réservation ce jour</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDayReservations.map(r => (
                    <div key={r.id} className="p-3.5 bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl hover:border-foreground/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground/90">{r.client.prenom} {r.client.nom}</p>
                          <p className="text-xs text-foreground/40 mt-0.5">{r.vehicule.marque} {r.vehicule.modele}</p>
                        </div>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg border", STATUS_COLOR[r.statut]?.pill)}>
                          {STATUT_RESERVATION_LABELS[r.statut]}
                        </span>
                      </div>
                      <code className="text-[11px] font-mono text-foreground/25">{r.vehicule.immatriculation}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8">
              <CalendarDays className="w-10 h-10 text-foreground/10 mb-3" />
              <p className="text-sm text-foreground/25 text-center">Cliquez sur un jour pour voir les réservations</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-auto pt-4 border-t border-foreground/[0.06]">
            <p className="text-[10px] font-semibold text-foreground/25 uppercase tracking-widest mb-3">Légende</p>
            <div className="space-y-2">
              {Object.entries(STATUT_RESERVATION_LABELS)
                .filter(([k]) => k !== "ANNULEE")
                .map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_COLOR[key]?.dot ?? "bg-foreground/20")} />
                    <span className="text-xs text-foreground/40">{label}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
