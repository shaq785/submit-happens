import type { GameStatus } from "@/types/game";
import { ShareButton } from "./ShareButton";

type EndScreenProps = {
  status: Extract<GameStatus, "won" | "lost">;
  totalHours: number;
  survivedSeconds: number;
  onPlayAgain: () => void;
};

export function EndScreen({
  status,
  totalHours,
  survivedSeconds,
  onPlayAgain,
}: EndScreenProps) {
  const won = status === "won";
  const mins = Math.floor(survivedSeconds / 60);
  const secs = survivedSeconds % 60;
  const timeLabel = `${mins}m ${secs.toString().padStart(2, "0")}s`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-title"
    >
      <div className="max-w-md rounded-3xl border border-slate-200/90 bg-amber-50/95 p-6 text-center shadow-2xl shadow-slate-900/20 backdrop-blur-sm">
        <h2
          id="end-title"
          className="text-2xl font-black uppercase tracking-tight text-slate-900 sm:text-3xl"
        >
          {won ? "Timesheet submitted!" : "Payroll has questions."}
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          {won
            ? "HR may rest… until next Friday."
            : "HR has entered the chat."}
        </p>
        <dl className="mt-5 space-y-2 rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-inner shadow-slate-900/5">
          <div className="flex justify-between gap-4 text-sm">
            <dt className="font-bold text-slate-600">Final hours</dt>
            <dd className="font-mono font-black tabular-nums text-slate-900">
              {totalHours.toFixed(1)} h
            </dd>
          </div>
          {won ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="font-bold text-slate-600">Time survived</dt>
              <dd className="font-mono font-black tabular-nums text-slate-900">
                {timeLabel}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-xl border border-slate-800/20 bg-linear-to-b from-amber-300 to-amber-400 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-slate-900 shadow-md shadow-slate-900/15 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            {won ? "Play again" : "Try again"}
          </button>
          <ShareButton
            won={won}
            totalHours={totalHours}
            survivedSeconds={survivedSeconds}
          />
        </div>
      </div>
    </div>
  );
}
