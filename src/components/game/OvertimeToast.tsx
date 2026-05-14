"use client";

import { useEffect, useRef } from "react";

type OvertimeToastProps = {
  message: string;
  bumpPercent: number;
  onDismiss: () => void;
};

/**
 * Blocking “daily cap” notice — gameplay stays paused until dismissed.
 * Swap for stacked modals / inbox threading / Esc-to-snooze later.
 */
export function OvertimeToast({
  message,
  bumpPercent,
  onDismiss,
}: OvertimeToastProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, [message, bumpPercent]);

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
      className="fixed inset-0 z-[45] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="overtime-alert-title"
      aria-describedby="overtime-alert-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={onDismiss}
        aria-label="Dismiss notice and continue"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-amber-200/90 bg-amber-50 px-5 py-4 shadow-2xl shadow-slate-900/25"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2
          id="overtime-alert-title"
          className="text-sm font-black uppercase tracking-wide text-amber-950"
        >
          Payroll noticed
        </h2>
        <p
          id="overtime-alert-desc"
          className="mt-2 text-sm font-semibold leading-relaxed text-slate-900"
        >
          {message}
        </p>
        <p className="mt-2 text-xs font-bold text-amber-900/90">
          HR heat +{bumpPercent}%
        </p>
        <p className="mt-3 text-center text-xs font-medium text-slate-600">
          Tap outside, press Continue, or press Escape to keep playing.
        </p>
        <button
          ref={continueRef}
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full rounded-xl border border-slate-800/20 bg-linear-to-b from-amber-300 to-amber-400 px-4 py-2.5 text-sm font-black uppercase tracking-wide text-slate-900 shadow-md shadow-slate-900/15 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
