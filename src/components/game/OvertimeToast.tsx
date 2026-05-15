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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
        onClick={onDismiss}
        aria-label="Dismiss notice and continue"
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white px-5 py-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.06]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2
          id="overtime-alert-title"
          className="text-sm font-semibold text-slate-900"
        >
          Human Resources noticed your math
        </h2>
        <p
          id="overtime-alert-desc"
          className="mt-2 text-sm leading-relaxed text-slate-600"
        >
          {message}
        </p>
        <p className="mt-2 text-xs font-medium text-amber-900/85">
          HR patience meter +{bumpPercent}%
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          Tap outside, Continue, or Escape — then try entering time like a grown-up.
        </p>
        <button
          ref={continueRef}
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
