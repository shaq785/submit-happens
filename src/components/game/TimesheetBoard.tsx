import type { WeekdayId, DaysState, TimeEntryCard } from "@/types/game";
import { WEEKDAYS } from "@/lib/gameConstants";
import { DayColumn } from "./DayColumn";

type TimesheetBoardProps = {
  days: DaysState;
  disabled: boolean;
  onTapDay: (day: WeekdayId) => void;
};

function sumHours(cards: TimeEntryCard[]): number {
  return cards.reduce((a, c) => a + c.hours, 0);
}

export function TimesheetBoard({
  days,
  disabled,
  onTapDay,
}: TimesheetBoardProps) {
  return (
    <section
      className="flex w-full min-h-0 flex-1 flex-col rounded-2xl border border-slate-200/90 bg-white/70 p-2 shadow-lg shadow-slate-900/8 sm:p-3 lg:min-h-0 lg:flex-1 lg:p-4"
      aria-label="Weekly timesheet"
    >
      <h2 className="mb-2 shrink-0 px-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
        Timesheet
      </h2>
      <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] lg:grid lg:min-h-0 lg:grid-cols-5 lg:overflow-hidden lg:pb-0">
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
