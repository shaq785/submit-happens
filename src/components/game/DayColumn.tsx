import type { WeekdayId, TimeEntryCard } from "@/types/game";
import { useDroppable } from "@dnd-kit/core";
import { MAX_HOURS_PER_DAY } from "@/lib/gameConstants";
import { TimeCard } from "./TimeCard";

type DayColumnProps = {
  dayId: WeekdayId;
  label: string;
  cards: TimeEntryCard[];
  dayHours: number;
  disabled: boolean;
  onTapDay: (day: WeekdayId) => void;
};

export function DayColumn({
  dayId,
  label,
  cards,
  dayHours,
  disabled,
  onTapDay,
}: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dayId,
    disabled,
    data: { type: "day", dayId },
  });

  const dropRing =
    isOver && !disabled
      ? "ring-2 ring-inset ring-emerald-400/55"
      : "";

  return (
    <button
      type="button"
      ref={setNodeRef}
      disabled={disabled}
      onClick={() => onTapDay(dayId)}
      className={`sh-day-slot flex h-full min-h-[96px] min-w-0 w-full flex-col rounded-lg border border-slate-200/60 p-1.5 text-left transition enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/30 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[112px] sm:rounded-xl sm:p-2.5 lg:min-h-0 lg:max-h-none ${dropRing}`}
      aria-label={`${label}, ${dayHours.toFixed(1)} hours logged. Tap to place selected card, or drop a hand card here.`}
    >
      <div className="mb-1.5 flex flex-col gap-1 border-b border-slate-100 pb-1.5 sm:mb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]">
          {label.slice(0, 3)}
        </span>
        <span
          className={`w-fit shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums sm:px-2 sm:text-sm lg:px-2.5 lg:py-1 lg:text-base ${
            dayHours > MAX_HOURS_PER_DAY
              ? "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80"
              : dayHours > 0
                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"
          }`}
          aria-hidden="true"
        >
          {dayHours.toFixed(1)}h
        </span>
      </div>
      <span className="sr-only">{label}</span>
      <div
        className={
          cards.length > 0
            ? "flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-y-auto sm:gap-1.5 sm:pr-0.5"
            : "flex flex-col items-center justify-center gap-1 py-2 sm:py-3"
        }
      >
        {cards.length === 0 ? (
          <span className="px-0.5 text-center text-[10px] leading-snug text-slate-400 sm:text-xs lg:max-w-none">
            <span className="lg:hidden">Tap or drop</span>
            <span className="hidden lg:inline">
              Drag a card here or tap a card, then this day
            </span>
          </span>
        ) : (
          cards.map((c) => <TimeCard key={c.id} card={c} variant="placed" />)
        )}
      </div>
    </button>
  );
}
