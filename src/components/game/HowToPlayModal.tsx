"use client";

import { useEffect, useRef } from "react";

type HowToPlayModalProps = {
  handReady: boolean;
  onStart: () => void;
};

/**
 * Pre-run briefing — HR tone, short rules.
 * Swap for onboarding tours or seasonal copy later.
 */
export function HowToPlayModal({ handReady, onStart }: HowToPlayModalProps) {
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startRef.current?.focus();
  }, [handReady]);

  return (
    <div
      className="fixed inset-0 z-[48] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200/90 bg-[#fffef8] p-5 shadow-2xl shadow-slate-900/25 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
          From: People Ops
        </p>
        <h2
          id="howto-title"
          className="mt-2 text-xl font-black uppercase tracking-tight text-slate-900 sm:text-2xl"
        >
          How to play
        </h2>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">
          Tap only — pick a card, then tap a weekday to place it. When you are
          ready, the timer and HR reminders will begin.
        </p>

        <ul className="mt-4 list-none space-y-3 border-y border-amber-200/80 py-4 text-sm leading-relaxed text-slate-800">
          <li className="flex gap-2">
            <span className="font-black text-red-600" aria-hidden="true">
              1.
            </span>
            <span>
              <strong className="text-slate-900">Tap a card</strong>, then{" "}
              <strong className="text-slate-900">tap Mon–Fri</strong> to add those
              hours. Used cards are replaced with a new one.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-black text-red-600" aria-hidden="true">
              2.
            </span>
            <span>
              Log <strong className="text-slate-900">40+ hours</strong> total, then
              tap <strong className="text-slate-900">Submit Timesheet</strong>{" "}
              before the <strong className="text-slate-900">HR meter</strong>{" "}
              hits 100%.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-black text-red-600" aria-hidden="true">
              3.
            </span>
            <span>
              HR will pop in with reminders — tap to close them. If a single day
              goes over <strong className="text-slate-900">8 hours</strong>, you
              will get a short notice and a small meter bump before you continue.
            </span>
          </li>
        </ul>

        <p className="text-xs font-medium text-slate-600">
          Click below to start the timer. Thanks for keeping us in the loop.
        </p>

        <button
          ref={startRef}
          id="howto-start"
          type="button"
          disabled={!handReady}
          onClick={onStart}
          className="mt-5 w-full rounded-2xl border border-slate-800/25 bg-linear-to-b from-emerald-300 to-emerald-400 px-4 py-3.5 text-sm font-black uppercase tracking-wide text-emerald-950 shadow-lg shadow-emerald-900/20 transition enabled:hover:-translate-y-0.5 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-600 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {handReady ? "Clock in — start timer" : "Preparing your cards…"}
        </button>
      </div>
    </div>
  );
}
