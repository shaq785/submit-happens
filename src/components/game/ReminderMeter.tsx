type ReminderMeterProps = {
  percent: number;
};

export function ReminderMeter({ percent }: ReminderMeterProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const high = clamped >= 75;

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-slate-500 lg:mb-2 lg:text-[0.8125rem]">
        <span className="font-medium">HR patience meter</span>
        <span
          className="font-mono text-sm font-semibold tabular-nums text-slate-800"
          aria-hidden="true"
        >
          {Math.round(clamped)}%
        </span>
      </div>
      <div
        className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-900/[0.04] lg:h-2.5 ${high ? "sh-meter-high" : ""}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Human Resources patience level"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${high ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
