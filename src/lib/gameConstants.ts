/** Tune pacing, copy, and difficulty without touching UI components. */

import type { WeekdayId } from "@/types/game";

export const WEEKDAYS: { id: WeekdayId; label: string }[] = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
];

/** Seconds until HR meter hits 100% at baseline difficulty. */
export const METER_FILL_SECONDS = 100;

/** HR pop-up cadence (ms) — random between min and max for variety. */
export const REMINDER_INTERVAL_MIN_MS = 5000;
export const REMINDER_INTERVAL_MAX_MS = 9000;

export const HR_REMINDER_MESSAGES = [
  "Friendly reminder to enter your time 😊",
  "Just bumping this up!",
  "Payroll closes soon.",
  "Circling back on timesheets.",
  "Quick reminder before the weekend.",
  "Your timesheet is looking a little empty.",
  "HR has entered the chat.",
] as const;

export const TARGET_HOURS = 40;

/** Per-day “normal” cap — soft overtime uses this for warnings + small meter bumps. */
export const MAX_HOURS_PER_DAY = 8;

/** How many cards visible in the hand — swap for a deck/draw pile later. */
export const HAND_SIZE = 4;

/** 1–3% HR meter nudge when a day first exceeds MAX_HOURS_PER_DAY — tune for difficulty later. */
export function randomOvertimeMeterBump(): number {
  return 1 + Math.floor(Math.random() * 3);
}

/** One-liner toast when a day crosses over the daily cap — add more personas / combos later. */
export function pickOvertimeToastLine(dayLabel: string, dayTotal: number): string {
  const t = dayTotal.toFixed(1);
  const lines = [
    `That's a big ${dayLabel}…`,
    `${dayLabel} is stacking up (${t}h on one day).`,
    `Bold ${dayLabel} energy: ${t}h logged.`,
    `Payroll squints at ${dayLabel}: ${t}h.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)]!;
}
