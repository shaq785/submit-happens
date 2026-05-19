import type { WeekdayId, DaysState, TimeEntryCard } from "@/types/game";
import { WEEKDAYS } from "@/lib/gameConstants";
import { DayColumn } from "./DayColumn";

type TimesheetBoardProps = {
  days: DaysState;
  disabled: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onTapDay: (day: WeekdayId) => void;
};

function sumHours(cards: TimeEntryCard[]): number {
  return cards.reduce((a, c) => a + c.hours, 0);
}

export function TimesheetBoard({
  days,
  disabled,
  canUndo,
  onUndo,
  onTapDay,
}: TimesheetBoardProps) {
  return (
    <section
      className="sh-panel sh-panel--cool flex w-full min-w-0 max-w-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl p-2.5 backdrop-blur-md sm:p-4 lg:min-h-0 lg:flex-1"
      aria-label="Weekly timesheet"
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <h2 className="text-xs font-medium tracking-wide text-slate-500">
          Timesheet
        </h2>
        <button
          type="button"
          disabled={!canUndo || disabled}
          onClick={onUndo}
          aria-label="Undo last card placement"
          className="rounded-lg bg-linear-to-b from-slate-100 to-slate-200/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition enabled:hover:from-slate-200 enabled:hover:to-slate-300/80 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-slate-400/50 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
      </div>
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-5 gap-1 sm:gap-2 lg:gap-3">
        {WEEKDAYS.map(({ id, label }) => (
          <DayColumn
            key={id}
            dayId={id}
            label={label}
            cards={days[id]}
            dayHours={sumHours(days[id])}
            disabled={disabled}
            onTapDay={onTapDay}
          />
        ))}
      </div>
    </section>
  );
}
