import type { WeekdayId, TimeEntryCard } from "@/types/game";
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
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onTapDay(dayId)}
      className="flex h-full min-h-[112px] min-w-[140px] flex-1 flex-col rounded-2xl border border-dashed border-slate-300/90 bg-white/85 p-2 text-left shadow-inner shadow-slate-900/5 transition enabled:hover:border-amber-400/70 enabled:hover:bg-amber-50/50 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-amber-400 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[124px] sm:min-w-[120px] lg:min-h-[136px] lg:min-w-0 lg:max-h-[min(40vh,300px)]"
      aria-label={`${label}, ${dayHours.toFixed(1)} hours logged. Tap to place selected card.`}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2 border-b border-slate-200 pb-1 lg:mb-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-800 lg:text-xs">
          {label.slice(0, 3)}
        </span>
        <span className="font-mono text-xs font-bold tabular-nums text-slate-600">
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
          <span className="max-w-[8.5rem] text-center text-[11px] font-medium leading-snug text-slate-500 lg:max-w-none lg:text-xs">
            Tap a card, then tap here
          </span>
        ) : (
          cards.map((c) => <TimeCard key={c.id} card={c} variant="placed" />)
        )}
      </div>
    </button>
  );
}
