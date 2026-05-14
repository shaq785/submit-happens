"use client";

import { useCallback, useState } from "react";

type ShareButtonProps = {
  shareText: string;
  shareTitle?: string;
  className?: string;
};

export function ShareButton({
  shareText,
  shareTitle = "Submit Happens",
  className = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const fallbackCopy = useCallback(async (full: string) => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const url =
      typeof window !== "undefined" ? window.location.href : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
      } catch (e) {
        // User cancelled share sheet — ignore.
        if ((e as Error).name === "AbortError") return;
        await fallbackCopy(`${shareText} ${url}`.trim());
      }
    } else {
      await fallbackCopy(`${shareText} ${url}`.trim());
    }
  }, [fallbackCopy, shareText, shareTitle]);

  return (
    <div className="relative inline-flex flex-col items-stretch">
      <button
        type="button"
        onClick={handleShare}
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
