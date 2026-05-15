"use client";

import { useEffect, useRef } from "react";

type VagueTimesheetModalProps = {
  penaltyPercent: number;
  onDismiss: () => void;
};

/**
 * Blocking notice when a 40h+ submit looks too thin on task variety.
 * Penalty is applied when the player dismisses (see GameShell).
 */
export function VagueTimesheetModal({
  penaltyPercent,
  onDismiss,
}: VagueTimesheetModalProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, [penaltyPercent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[46] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="vague-title"
      aria-describedby="vague-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onDismiss}
        aria-label="Acknowledge and return to the board"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white px-5 py-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.06]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-medium tracking-wide text-slate-600">
          From: Human Resources · “Use your words” workshop
        </p>
        <h2
          id="vague-title"
          className="mt-2 text-lg font-semibold tracking-tight text-slate-900"
        >
          That timesheet is suspiciously vague
        </h2>
        <p
          id="vague-desc"
          className="mt-3 text-sm leading-relaxed text-slate-600"
        >
          We see the hours, but not enough{" "}
          <strong>different kinds of work</strong> for someone who claims they
          were “busy all week.” Show us at least{" "}
          <strong>three task types</strong> or we assume copy-paste. Until then,{" "}
          <strong>Human Resources</strong> is adding{" "}
          <strong className="tabular-nums">+{penaltyPercent}%</strong> to the{" "}
          <strong>HR patience meter</strong>—call it motivation.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Fix your story, tap <strong>Submit timesheet</strong> again, then try not
          to make us reopen this file. Tap outside or Continue to continue sulking
          on the board.
        </p>
        <button
          ref={btnRef}
          id="vague-dismiss"
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
