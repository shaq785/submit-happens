import { ReminderMeter } from "./ReminderMeter";

type HeaderStatsProps = {
  totalHours: number;
  reminderMeter: number;
};

export function HeaderStats({ totalHours, reminderMeter }: HeaderStatsProps) {
  return (
    <header className="flex w-full shrink-0 flex-col gap-4 rounded-2xl bg-white/65 p-4 ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:p-5">
      <div className="shrink-0">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          Hours logged this week
        </p>
        <p className="mt-0.5 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
          {totalHours.toFixed(1)}
          <span className="text-lg font-medium text-slate-500 sm:text-xl"> / 40 h</span>
        </p>
      </div>
      <div className="min-w-0 w-full sm:max-w-md sm:flex-none lg:max-w-none lg:flex-1">
        <ReminderMeter percent={reminderMeter} />
      </div>
    </header>
  );
}
