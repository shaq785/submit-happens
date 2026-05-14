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
    <div className="relative inline-flex flex-col items-stretch">
      <button
        type="button"
        onClick={handleShare}
        aria-label="Copy score, link, and invite text to clipboard"
        className={`rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${className}`}
      >
        Share Score
      </button>
      {copied ? (
        <span
          className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md"
          role="status"
          aria-live="polite"
        >
          Copied!
        </span>
      ) : null}
    </div>
  );
}
