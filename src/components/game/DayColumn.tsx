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
      className={`flex h-full min-h-[112px] min-w-[132px] flex-1 flex-col rounded-xl border border-slate-200/80 bg-white/50 p-2.5 text-left transition enabled:hover:border-slate-300 enabled:hover:bg-white/80 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/30 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[120px] sm:min-w-[118px] lg:min-h-[120px] lg:min-w-0 lg:max-h-[min(38vh,280px)] ${dropRing}`}
      aria-label={`${label}, ${dayHours.toFixed(1)} hours logged. Tap to place selected card, or drop a hand card here.`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label.slice(0, 3)}
        </span>
        <span
          className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-sm font-semibold tabular-nums sm:text-base lg:px-2.5 lg:py-1 ${
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
            ? "flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5"
            : "flex flex-col items-center justify-center gap-1 py-3"
        }
      >
        {cards.length === 0 ? (
          <span className="max-w-34 text-center text-xs leading-snug text-slate-400 lg:max-w-none">
            Drag a card here or tap a card, then this day
          </span>
        ) : (
          cards.map((c) => <TimeCard key={c.id} card={c} variant="placed" />)
        )}
      </div>
    </button>
  );
}
