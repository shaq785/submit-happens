"use client";

import { useEffect, useRef, useState } from "react";
import {
  HR_GIF_FADE_MS,
  HR_GIF_GAP_MAX_MS,
  HR_GIF_GAP_MIN_MS,
  HR_GIF_HOLD_MAX_MS,
  HR_GIF_HOLD_MIN_MS,
  pickRandomGif,
  pickRandomSpot,
  randomBetween,
  type HrGifSpot,
} from "@/lib/hrGifAmbience";

type HrGifAmbienceProps = {
  /** Game is in progress (timer running, not blocked by briefing). */
  active: boolean;
};

type VisibleMeme = {
  src: string;
  spot: HrGifSpot;
};

function sleep(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const id = window.setTimeout(() => {
      if (!signal.cancelled) resolve();
    }, ms);
    if (signal.cancelled) {
      window.clearTimeout(id);
      resolve();
    }
  });
}

/**
 * Desktop-only ambient HR memes from `public/gifs` — random fade in/out.
 * Add files to that folder; `/api/hr-gifs` picks them up automatically.
 */
export function HrGifAmbience({ active }: HrGifAmbienceProps) {
  const [gifUrls, setGifUrls] = useState<string[]>([]);
  const [desktop, setDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [meme, setMeme] = useState<VisibleMeme | null>(null);
  const [visible, setVisible] = useState(false);

  const lastSrcRef = useRef<string | null>(null);
  const lastSpotRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hr-gifs")
      .then((r) => r.json())
      .then((data: { gifs?: string[] }) => {
        if (!cancelled && Array.isArray(data.gifs)) {
          setGifUrls(data.gifs);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setDesktop(lg.matches);
      setReducedMotion(motion.matches);
    };
    sync();
    lg.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      lg.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };

    const run = async () => {
      await sleep(randomBetween(4_000, 9_000), signal);

      while (!signal.cancelled) {
        if (!active || !desktop || reducedMotion || gifUrls.length === 0) {
          await sleep(500, signal);
          continue;
        }

        const src = pickRandomGif(gifUrls, lastSrcRef.current);
        const { spot, index } = pickRandomSpot(lastSpotRef.current);
        lastSrcRef.current = src;
        lastSpotRef.current = index;

        setMeme({ src, spot });
        setVisible(false);
        await sleep(50, signal);
        if (signal.cancelled) break;
        setVisible(true);

        await sleep(randomBetween(HR_GIF_HOLD_MIN_MS, HR_GIF_HOLD_MAX_MS), signal);
        if (signal.cancelled) break;

        setVisible(false);
        await sleep(HR_GIF_FADE_MS, signal);
        if (signal.cancelled) break;

        setMeme(null);
        await sleep(randomBetween(HR_GIF_GAP_MIN_MS, HR_GIF_GAP_MAX_MS), signal);
      }
    };

    void run();

    return () => {
      signal.cancelled = true;
      setVisible(false);
      setMeme(null);
    };
  }, [active, desktop, gifUrls, reducedMotion]);

  if (!desktop || reducedMotion || !meme) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[12] hidden overflow-hidden lg:block"
      aria-hidden
    >
      <figure
        className={`absolute transition-opacity ease-in-out ${meme.spot.className} ${
          visible ? "opacity-[0.88]" : "opacity-0"
        }`}
        style={{
          transitionDuration: `${HR_GIF_FADE_MS}ms`,
          maxWidth: meme.spot.maxWidthPx,
        }}
      >
        <div className="overflow-hidden rounded-xl bg-white/75 p-1.5 shadow-lg shadow-slate-900/15 ring-1 ring-slate-900/10 backdrop-blur-sm">
          <span className="mb-1 block px-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            HR · forwarded with love
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element -- memes from /public; may be gif or png */}
          <img
            src={meme.src}
            alt=""
            className="h-auto max-h-40 w-full rounded-lg object-contain"
            draggable={false}
          />
        </div>
      </figure>
    </div>
  );
}
