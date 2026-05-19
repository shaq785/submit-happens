"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Difficulty } from "@/types/game";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_CONFIG,
  DIFFICULTY_OPTIONS,
} from "@/lib/gameConstants";

type HowToPlayModalProps = {
  handReady: boolean;
  onStart: (difficulty: Difficulty) => void;
};

type RuleStep = {
  title: string;
  body: ReactNode;
};

const RULE_STEPS: RuleStep[] = [
  {
    title: "Place your cards",
    body: (
      <>
        <strong className="text-slate-900">Drag a card</strong> onto a weekday, or{" "}
        <strong className="text-slate-900">tap a card</strong> then{" "}
        <strong className="text-slate-900">tap Mon–Fri</strong> to log hours. Used
        cards get replaced—HR’s version of a fresh start.
      </>
    ),
  },
  {
    title: "Submit before HR snaps",
    body: (
      <>
        Reach <strong className="text-slate-900">40+ hours</strong>, then tap{" "}
        <strong className="text-slate-900">Submit timesheet</strong> before the{" "}
        <strong className="text-slate-900">patience meter</strong> hits 100%. Log at
        least <strong className="text-slate-900">three task types</strong> across the
        week or we bounce your submit and dock the meter.
      </>
    ),
  },
  {
    title: "Expect pop-ups",
    body: (
      <>
        <strong className="text-slate-900">Human Resources</strong> will nag you with
        reminders—tap to dismiss. If a day crosses{" "}
        <strong className="text-slate-900">8 hours</strong>, you get a lecture and a
        meter bump.
      </>
    ),
  },
  {
    title: "Undo & share",
    body: (
      <>
        <strong className="text-slate-900">Undo</strong> rewinds your last card and
        any meter bump from crossing 8h that turn. After a run,{" "}
        <strong className="text-slate-900">share your recap</strong>—we can’t stop you
        from bragging online.
      </>
    ),
  },
];

/**
 * Pre-run briefing — HR tone, carousel rules, difficulty pick.
 */
export function HowToPlayModal({ handReady, onStart }: HowToPlayModalProps) {
  const startRef = useRef<HTMLButtonElement>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [stepIndex, setStepIndex] = useState(0);

  const selected = DIFFICULTY_CONFIG[difficulty];
  const stepCount = RULE_STEPS.length;
  const onLastStep = stepIndex === stepCount - 1;

  const startRun = useCallback(() => {
    if (!handReady) return;
    onStart(difficulty);
  }, [difficulty, handReady, onStart]);

  useEffect(() => {
    startRef.current?.focus();
  }, [handReady]);

  const goPrev = useCallback(
    () => setStepIndex((i) => Math.max(0, i - 1)),
    [],
  );
  const goNext = useCallback(
    () => setStepIndex((i) => Math.min(stepCount - 1, i + 1)),
    [stepCount],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight" && !onLastStep) goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onLastStep]);

  return (
    <div
      className="fixed inset-0 z-[48] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howto-title"
    >
      <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.06] sm:p-6">
        <p className="text-xs font-medium tracking-wide text-slate-700">
          From: Human Resources
        </p>
        <h2
          id="howto-title"
          className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
        >
          Mandatory time-entry remediation
        </h2>
        <p className="mt-2 text-sm leading-snug text-slate-600">
          Finish the week before HR runs out of patience. Pick a difficulty, skim
          the rules, then start the timer.
        </p>

        <fieldset className="mt-4 shrink-0 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Difficulty
          </legend>
          <div
            className="mt-2 grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label="Select difficulty"
          >
            {DIFFICULTY_OPTIONS.map((id) => {
              const cfg = DIFFICULTY_CONFIG[id];
              const active = difficulty === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDifficulty(id)}
                  className={`rounded-lg border px-2 py-2 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 ${
                    active
                      ? "border-emerald-400/80 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-400/30"
                      : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-slate-600">
            {selected.hint}{" "}
            <span className="text-slate-500">
              (~{selected.meterFillSeconds}s to fill the meter.)
            </span>
          </p>
        </fieldset>

        <section
          className="mt-4 flex min-h-[9.5rem] flex-col"
          aria-roledescription="carousel"
          aria-label="How to play"
        >
          <div
            id={`howto-step-${stepIndex}`}
            role="tabpanel"
            aria-labelledby={`howto-step-tab-${stepIndex}`}
            className="flex flex-1 flex-col rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Step {stepIndex + 1} of {stepCount}
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {RULE_STEPS[stepIndex]!.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700">
              {RULE_STEPS[stepIndex]!.body}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={stepIndex === 0}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-100 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-slate-400/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <div
              className="flex items-center gap-1.5"
              role="tablist"
              aria-label="Rule steps"
            >
              {RULE_STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  id={`howto-step-tab-${i}`}
                  aria-selected={i === stepIndex}
                  aria-controls={`howto-step-${i}`}
                  onClick={() => setStepIndex(i)}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 ${
                    i === stepIndex
                      ? "w-6 bg-emerald-500"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                >
                  <span className="sr-only">Step {i + 1}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={onLastStep}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-100 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-slate-400/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>

        <button
          ref={startRef}
          id="howto-start"
          type="button"
          disabled={!handReady}
          onClick={startRun}
          className="mt-4 w-full shrink-0 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-emerald-500 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/50 enabled:focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {handReady
            ? `Start on ${selected.label} — begin timer`
            : "Shuffling your practice cards…"}
        </button>
      </div>
    </div>
  );
}
