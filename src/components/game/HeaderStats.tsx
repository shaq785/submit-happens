import { ReminderMeter } from "./ReminderMeter";

type HeaderStatsProps = {
  totalHours: number;
  reminderMeter: number;
};

export function HeaderStats({ totalHours, reminderMeter }: HeaderStatsProps) {
  return (
    <header className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white/90 p-3 shadow-lg shadow-slate-900/8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-4 lg:p-5">
      <div className="shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-600 lg:text-sm">
          Weekly total
        </p>
        <p className="text-2xl font-black tabular-nums text-slate-900 sm:text-3xl lg:text-4xl">
          {totalHours.toFixed(1)}
          <span className="text-base font-bold text-slate-600 lg:text-lg"> / 40 h</span>
        </p>
      </div>
      <div className="min-w-0 w-full sm:max-w-md sm:flex-none lg:max-w-none lg:flex-1">
        <ReminderMeter percent={reminderMeter} />
      </div>
    </header>
  );
}
