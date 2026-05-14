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

      <div className="pointer-events-auto relative max-w-sm px-2">
        <button
          ref={closeRef}
          type="button"
          onClick={onDismiss}
          className="sh-reminder-card w-full rounded-2xl border border-slate-200/90 bg-[#fffef8] p-4 text-left shadow-2xl shadow-slate-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          aria-label={`HR reminder: ${reminder.message}. Tap to dismiss.`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              HR
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-500">
              New message
            </span>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-slate-900">
            {reminder.message}
          </p>
          <p className="mt-3 text-center text-xs font-bold text-slate-600">
            Tap to dismiss
          </p>
        </button>
      </div>
    </div>
  );
}
