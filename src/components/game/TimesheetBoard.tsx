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
      className="flex w-full min-h-0 flex-1 flex-col rounded-2xl bg-white/55 p-3 ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-4 lg:min-h-0 lg:flex-1"
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
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition enabled:hover:bg-slate-200 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-slate-400/50 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
      </div>
      <div className="flex min-h-0 flex-1 gap-2.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] lg:grid lg:min-h-0 lg:grid-cols-5 lg:gap-3 lg:overflow-hidden lg:pb-0">
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
