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
      className="fixed inset-0 z-[48] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.06] sm:p-7">
        <p className="text-xs font-medium tracking-wide text-slate-700">
          From: Human Resources
        </p>
        <h2
          id="howto-title"
          className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
        >
          Mandatory time-entry remediation
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are not here because you are good at submitting time on time. You
          are here because… well, you know why. Tap only: pick a card, tap a
          weekday, and try to finish a week before{" "}
          <strong className="font-medium text-slate-800">Human Resources</strong>{" "}
          runs out of patience.
        </p>

        <ul className="mt-5 list-none space-y-3 border-y border-slate-100 py-4 text-sm leading-relaxed text-slate-700">
          <li className="flex gap-2">
            <span className="font-semibold text-emerald-600" aria-hidden="true">
              1.
            </span>
            <span>
              <strong className="text-slate-900">Drag a card</strong> onto a weekday,{" "}
              or <strong className="text-slate-900">tap a card</strong> then{" "}
              <strong className="text-slate-900">tap Mon–Fri</strong> to log hours.
              Used cards get replaced—think of it as HR pretending we trust you with
              a fresh start every time.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-emerald-600" aria-hidden="true">
              2.
            </span>
            <span>
              Reach <strong className="text-slate-900">40+ hours</strong>, then tap{" "}
              <strong className="text-slate-900">Submit timesheet</strong> before the{" "}
              <strong className="text-slate-900">HR patience meter</strong> hits 100%.
              Use at least{" "}
              <strong className="text-slate-900">three different task types</strong>{" "}
              or we bounce your submit back and dock the meter—yes, we are petty
              about specificity.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-emerald-600" aria-hidden="true">
              3.
            </span>
            <span>
              <strong className="text-slate-900">Human Resources</strong> will nag
              you with pop-ups—tap to dismiss and pretend you are listening. If a
              day crosses <strong className="text-slate-900">8 hours</strong>, you
              get a lecture and a meter bump. We warned you.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-emerald-600" aria-hidden="true">
              4.
            </span>
            <span>
              <strong className="text-slate-900">Undo</strong> exists because even
              HR accepts that mistakes happen (mostly yours). Rewind your last card
              and any same-turn bump from crossing 8h on a day. After a run,{" "}
              <strong className="text-slate-900">share your recap</strong>—we can’t
              stop you from bragging online.
            </span>
          </li>
        </ul>

        <p className="text-xs font-medium text-slate-600">
          Start the timer when ready. Prove you can enter time like someone who
          respects deadlines—or at least fears us a little.
        </p>

        <button
          ref={startRef}
          id="howto-start"
          type="button"
          disabled={!handReady}
          onClick={onStart}
          className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-500 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/50 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {handReady ? "I’ve read the room — start timer" : "Shuffling your practice cards…"}
        </button>
      </div>
    </div>
  );
}
