"use client";

import { useCallback, useState } from "react";
import { buildSubmitHappensShareMessage } from "@/lib/shareMessage";

type ShareButtonProps = {
  won: boolean;
  totalHours: number;
  survivedSeconds: number;
  className?: string;
};

export function ShareButton({
  won,
  totalHours,
  survivedSeconds,
  className = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const body = buildSubmitHappensShareMessage({
      won,
      totalHours,
      survivedSeconds,
      gameUrl: url,
    });
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      // Expand later: execCommand fallback or in-app “select all” textarea.
    }
  }, [survivedSeconds, totalHours, won]);

  return (
    <div className="relative inline-flex min-w-0 flex-col items-stretch">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Copy share recap, link, and invite to clipboard"
        className={`rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 ${className}`}
      >
        Share recap
      </button>
      {copied ? (
        <span
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-white/10"
          role="status"
          aria-live="polite"
        >
          Recap copied to clipboard
        </span>
      ) : null}
    </div>
  );
}
