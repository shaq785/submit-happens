"use client";

import { useEffect, useRef } from "react";
import type { ActiveReminder } from "@/types/game";

type ReminderPopupProps = {
  reminder: ActiveReminder;
  onDismiss: () => void;
};

export function ReminderPopup({ reminder, onDismiss }: ReminderPopupProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [reminder.id]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center p-3 pt-16 sm:pt-20"
      aria-hidden={false}
    >
      {/* Backdrop: visual only — gameplay stays tappable through the board */}
      <div className="pointer-events-none absolute inset-0 bg-slate-900/25" />

      <div className="pointer-events-auto relative max-w-sm px-1">
        <button
          ref={closeRef}
          type="button"
          onClick={onDismiss}
          className="sh-reminder-card w-full rounded-2xl bg-white/90 p-4 text-left shadow-lg shadow-slate-900/8 ring-1 ring-slate-900/[0.06] backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:ring-offset-2"
          aria-label={`Human Resources: ${reminder.message}. Tap to dismiss.`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Human Resources
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Reminder
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-800">
            {reminder.message}
          </p>
          <p className="mt-3 text-center text-xs font-medium text-slate-500">
            Tap to dismiss
          </p>
        </button>
      </div>
    </div>
  );
}
