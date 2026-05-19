import { DIFFICULTY_CONFIG } from "@/lib/gameConstants";
import type { Difficulty } from "@/types/game";
import { ReminderMeter } from "./ReminderMeter";

type HeaderStatsProps = {
  totalHours: number;
  reminderMeter: number;
  difficulty: Difficulty;
};

export function HeaderStats({
  totalHours,
  reminderMeter,
  difficulty,
}: HeaderStatsProps) {
  return (
    <header className="sh-panel flex w-full shrink-0 flex-col gap-4 rounded-2xl p-4 backdrop-blur-md sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:p-5 lg:gap-4 lg:p-4">
      <div className="shrink-0">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          Hours logged this week
        </p>
        <p className="sh-stat-value mt-0.5 text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl lg:text-3xl">
          {totalHours.toFixed(1)}
          <span className="text-lg font-medium text-slate-600/80 sm:text-xl"> / 40 h</span>
        </p>
      </div>
      <div className="min-w-0 w-full sm:max-w-md sm:flex-none lg:max-w-none lg:flex-1">
        <div className="mb-2 flex justify-end">
          <span className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200/80">
            {DIFFICULTY_CONFIG[difficulty].label}
          </span>
        </div>
        <ReminderMeter percent={reminderMeter} />
      </div>
    </header>
  );
}
