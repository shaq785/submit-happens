/** Core domain types — extend with streaks, power-ups, or multi-week arcs later. */

export type GameStatus = "playing" | "won" | "lost";

export type WeekdayId = "mon" | "tue" | "wed" | "thu" | "fri";

export type TimeCardType =
  | "dev"
  | "meeting"
  | "qa"
  | "admin"
  | "client";

export interface TimeEntryCard {
  id: string;
  label: string;
  hours: number;
  type: TimeCardType;
}

export interface ActiveReminder {
  id: string;
  message: string;
}

export type DaysState = Record<WeekdayId, TimeEntryCard[]>;
