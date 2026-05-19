/** Timing for ambient HR memes on desktop — tune in one place. */

export const HR_GIF_FADE_MS = 900;

/** Pause between one meme leaving and the next appearing. */
export const HR_GIF_GAP_MIN_MS = 10_000;
export const HR_GIF_GAP_MAX_MS = 22_000;

/** How long each meme stays fully visible (after fade-in). */
export const HR_GIF_HOLD_MIN_MS = 4_500;
export const HR_GIF_HOLD_MAX_MS = 8_500;

export type HrGifSpot = {
  className: string;
  maxWidthPx: number;
};

/** Corners / edges so the board stays clear. */
export const HR_GIF_SPOTS: HrGifSpot[] = [
  {
    className: "left-[2%] top-[10%]",
    maxWidthPx: 200,
  },
  {
    className: "right-[2%] top-[12%]",
    maxWidthPx: 220,
  },
  {
    className: "bottom-[14%] left-[3%]",
    maxWidthPx: 190,
  },
  {
    className: "bottom-[18%] right-[4%]",
    maxWidthPx: 210,
  },
  {
    className: "left-[4%] top-[38%]",
    maxWidthPx: 175,
  },
  {
    className: "right-[3%] top-[42%]",
    maxWidthPx: 185,
  },
];

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function pickRandomGif(urls: string[], avoid?: string | null): string {
  if (urls.length === 0) return "";
  if (urls.length === 1) return urls[0]!;
  const pool = avoid ? urls.filter((u) => u !== avoid) : urls;
  const list = pool.length > 0 ? pool : urls;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function pickRandomSpot(avoidIndex: number | null): {
  spot: HrGifSpot;
  index: number;
} {
  const index =
    HR_GIF_SPOTS.length === 1
      ? 0
      : (() => {
          let i = Math.floor(Math.random() * HR_GIF_SPOTS.length);
          if (avoidIndex !== null && HR_GIF_SPOTS.length > 1) {
            let guard = 0;
            while (i === avoidIndex && guard < 8) {
              i = Math.floor(Math.random() * HR_GIF_SPOTS.length);
              guard += 1;
            }
          }
          return i;
        })();
  return { spot: HR_GIF_SPOTS[index]!, index };
}
