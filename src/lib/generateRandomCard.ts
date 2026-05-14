import type { TimeCardType, TimeEntryCard } from "@/types/game";

const PRESET_POOL: { label: string; hours: number; type: TimeCardType }[] = [
  { label: "Dev Work", hours: 2, type: "dev" },
  { label: "Meeting", hours: 1, type: "meeting" },
  { label: "QA", hours: 1.5, type: "qa" },
  { label: "Admin", hours: 0.5, type: "admin" },
  { label: "Client Revisions", hours: 3, type: "client" },
];

const RANDOM_HOUR_STEPS = [0.5, 1, 1.5, 2, 2.5, 3] as const;

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pickRandomHours(): number {
  const i = Math.floor(Math.random() * RANDOM_HOUR_STEPS.length);
  return RANDOM_HOUR_STEPS[i]!;
}

/**
 * Returns a single random time-entry card.
 * Expand later: weighted pools, rarity, “crunch week” modifiers, etc.
 */
export function generateRandomCard(): TimeEntryCard {
  const useMystery = Math.random() < 0.22;
  if (useMystery) {
    const hours = pickRandomHours();
    return {
      id: randomId(),
      label: "What did I do?",
      hours,
      type: "random",
    };
  }
  const pick = PRESET_POOL[Math.floor(Math.random() * PRESET_POOL.length)]!;
  return {
    id: randomId(),
    label: pick.label,
    hours: pick.hours,
    type: pick.type,
  };
}

/** Fills the starting hand — replace with seeded decks for daily challenges later. */
export function generateHand(count: number): TimeEntryCard[] {
  return Array.from({ length: count }, () => generateRandomCard());
}
