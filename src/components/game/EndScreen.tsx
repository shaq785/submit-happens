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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-title"
    >
      <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.06]">
        <h2
          id="end-title"
          className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
        >
          {won ? "Round cleared!" : "Run over"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {won
            ? "Human Resources will allow this one win. Do not confuse it with forgiveness—or with you being “good at time entry.”"
            : "HR patience hit zero. You had one job (technically forty hours of jobs) and the meter beat you to it."}
        </p>
        <dl className="mt-6 space-y-2 rounded-xl bg-slate-50/80 p-4 text-left ring-1 ring-slate-900/[0.04]">
          <div className="flex justify-between gap-4 text-sm">
            <dt className="font-medium text-slate-500">Score (hours)</dt>
            <dd className="font-mono font-semibold tabular-nums text-slate-900">
              {totalHours.toFixed(1)} h
            </dd>
          </div>
          {won ? (
            <div className="flex justify-between gap-4 text-sm">
              <dt className="font-medium text-slate-500">Run time</dt>
              <dd className="font-mono font-semibold tabular-nums text-slate-900">
                {timeLabel}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 flex flex-col gap-2.5 overflow-visible pb-1 sm:flex-row sm:justify-center sm:gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            {won ? "New run" : "Rematch"}
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
