import type { DaysState } from "@/types/game";
import {
  MIN_UNIQUE_TASK_TYPES_FOR_SUBMIT,
  WEEKDAYS,
} from "@/lib/gameConstants";

/** Count distinct task types on the timesheet (not card instances). */
export function countUniqueTaskTypes(days: DaysState): number {
  const types = new Set<string>();
  for (const { id } of WEEKDAYS) {
    for (const c of days[id]) {
      types.add(c.type);
    }
  }
  return types.size;
}

/**
 * “Non-descript” = enough hours but too few distinct categories of work.
 * Tighten/loosen with MIN_UNIQUE_TASK_TYPES_FOR_SUBMIT or add per-day rules later.
 */
export function isTimesheetTooVague(days: DaysState): boolean {
  return countUniqueTaskTypes(days) < MIN_UNIQUE_TASK_TYPES_FOR_SUBMIT;
}
