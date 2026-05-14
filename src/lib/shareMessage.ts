/**
 * Social / clipboard copy for end-of-run — tweak tone or add hashtags here later.
 */

export type ShareRunSummary = {
  won: boolean;
  totalHours: number;
  /** Seconds survived this round (wins only; still passed on loss for consistency). */
  survivedSeconds: number;
  gameUrl: string;
};

function formatSurvived(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

/** Full message for Web Share + clipboard: bragging rights, link, invite. */
export function buildSubmitHappensShareMessage({
  won,
  totalHours,
  survivedSeconds,
  gameUrl,
}: ShareRunSummary): string {
  const h = totalHours.toFixed(1);

  if (won) {
    const survived = formatSurvived(survivedSeconds);
    return [
      "I just played Submit Happens and actually submitted my timesheet on time.",
      "",
      `My run: ${h} hours logged, survived HR pressure for ${survived}.`,
      "",
      "Think you can beat that? It’s a free tap-to-play browser game (no install):",
      gameUrl,
    ].join("\n");
  }

  return [
    "I just played Submit Happens — HR got me before I could submit clean.",
    "",
    `My run: ${h} hours logged before it all fell apart.`,
    "",
    "Bet you can last longer. Free tap-to-play in the browser:",
    gameUrl,
  ].join("\n");
}
