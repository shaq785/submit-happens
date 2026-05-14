type ReminderMeterProps = {
  percent: number;
};

export function ReminderMeter({ percent }: ReminderMeterProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const high = clamped >= 75;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs font-semibold text-slate-700 lg:mb-2 lg:text-sm">
        <span className="font-bold tracking-wide">HR reminder meter</span>
        <span
          className="font-mono tabular-nums text-slate-900 lg:text-base lg:font-black"
          aria-hidden="true"
        >
          {Math.round(clamped)}%
        </span>
      </div>
      <div
        className={`relative h-3.5 w-full overflow-hidden rounded-full border border-slate-300/90 bg-slate-200/90 lg:h-5 ${high ? "sh-meter-high" : ""}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="HR reminder pressure"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-linear ${high ? "bg-red-500" : "bg-amber-400"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
