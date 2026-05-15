/** Tune pacing, copy, and difficulty without touching UI components. */

import type { WeekdayId } from "@/types/game";

export const WEEKDAYS: { id: WeekdayId; label: string }[] = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
];

/** Seconds until the HR patience meter hits 100% at baseline (lower = harder). */
export const METER_FILL_SECONDS = 55;

/** HR pop-up cadence (ms) — random between min and max for variety. */
export const REMINDER_INTERVAL_MIN_MS = 5000;
export const REMINDER_INTERVAL_MAX_MS = 9000;

export const HR_REMINDER_MESSAGES = [
  "Human Resources here: your time entries and reality are not on speaking terms. Fix that.",
  "We enrolled you in this drill for a reason. Hint: the reason rhymes with ‘you submit on Thursday what you did on Monday.’",
  "Friendly? No. Fair? Debatable. Necessary? Absolutely—because payroll cannot read your mind or your sticky notes.",
  "Clock in, log hours, repeat. This is not a personality test; it is a calendar.",
  "Your timesheet is giving ‘I’ll do it after this one email.’ We’ve met that email. It has children now.",
  "Human Resources is not mad. We are just disappointed in a documented, audit-friendly way.",
  "If ‘later’ were a billable code, you’d be rich. It is not. Log your time.",
] as const;

export const TARGET_HOURS = 40;

/** Cards dealt into the hand at start / after submit. */
export const HAND_SIZE = 4;

/** Per-day “normal” cap — soft overtime uses this for warnings + small meter bumps. */
export const MAX_HOURS_PER_DAY = 8;

/** Minimum distinct task types across Mon–Fri to accept a submit at 40+ hours. */
export const MIN_UNIQUE_TASK_TYPES_FOR_SUBMIT = 3;

/** 8–12% meter penalty when a 40h+ timesheet is too thin on task variety — tune later. */
export function randomVagueSubmitMeterPenalty(): number {
  return 8 + Math.floor(Math.random() * 5);
}

/** 1–3% HR meter nudge when a day first exceeds MAX_HOURS_PER_DAY — tune for difficulty later. */
export function randomOvertimeMeterBump(): number {
  return 1 + Math.floor(Math.random() * 3);
}

/** One-liner toast when a day crosses over the daily cap — add more personas / combos later. */
export function pickOvertimeToastLine(dayLabel: string, dayTotal: number): string {
  const t = dayTotal.toFixed(1);
  const lines = [
    `Human Resources has questions about ${dayLabel}: ${t}h on one day. Bold. Borderline suspicious.`,
    `${dayLabel} is carrying the whole storyline at ${t}h. Cute. Still not how we asked for time entry.`,
    `You stacked ${dayLabel} to ${t}h. We assume that’s… focus? Either way, the patience meter noticed.`,
    `That’s a lot of ${dayLabel} (${t}h). HR is taking notes—and not the fun kind.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)]!;
}
