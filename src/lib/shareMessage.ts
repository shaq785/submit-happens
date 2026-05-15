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
      "I survived Submit Happens — Human Resources put me in time-entry boot camp and I still won.",
      "",
      `Score: ${h} hours. Kept the HR patience meter at bay for ${survived}.`,
      "",
      "Think you can log faster? Free tap-to-play in the browser:",
      gameUrl,
    ].join("\n");
  }

  return [
    "I lost Submit Happens — Human Resources ran out of patience before I ran out of excuses.",
    "",
    `Score: ${h} hours before the meter won.`,
    "",
    "Try not to be worse than me. Free tap-to-play in the browser:",
    gameUrl,
  ].join("\n");
}
