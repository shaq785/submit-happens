import type { TimeEntryCard } from "@/types/game";

type TimeCardProps = {
  card: TimeEntryCard;
  variant?: "hand" | "placed";
  /** Wider desktop sidebar uses comfortable spacing; dock uses compact cells. */
  density?: "compact" | "comfortable";
  selected?: boolean;
  onSelect?: () => void;
};

export function TimeCard({
  card,
  variant = "hand",
  density = "compact",
  selected = false,
  onSelect,
}: TimeCardProps) {
  const isHand = variant === "hand";
  const base =
    "w-full rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2";

  const handStyles = selected
    ? "border-2 border-amber-500 bg-amber-50 shadow-lg shadow-amber-900/15 ring-2 ring-amber-400/90 ring-offset-2 ring-offset-amber-50/80 sh-card-selected-pulse"
    : "border border-slate-200/90 bg-white shadow-md shadow-slate-900/8 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/12";

  const placedStyles =
    "border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5 pointer-events-none cursor-default";

  const comfy = density === "comfortable";

  if (isHand && onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${card.label}, ${card.hours} hours${selected ? ", selected" : ""}`}
        className={`${base} ${handStyles} px-3 py-3 ${comfy ? "min-h-0 sm:py-3.5" : "min-h-[5.25rem] sm:min-h-0"}`}
      >
        <CardInner
          card={card}
          layout="hand"
          density={density}
          showSelectedBadge={selected}
        />
      </button>
    );
  }

  return (
    <div className={`${base} ${placedStyles} px-2.5 py-2`}>
      <CardInner card={card} layout="placed" />
    </div>
  );
}

function CardInner({
  card,
  layout,
  density = "compact",
  showSelectedBadge,
}: {
  card: TimeEntryCard;
  layout: "hand" | "placed";
  density?: "compact" | "comfortable";
  showSelectedBadge?: boolean;
}) {
  if (layout === "hand") {
    const comfy = density === "comfortable";
    return (
      <div className="flex flex-col gap-2">
        <div className="min-w-0">
          <p
            className={`text-pretty break-words font-bold leading-snug text-slate-900 ${comfy ? "text-base" : "text-sm"}`}
          >
            {card.label}
            {card.type === "random" ? (
              <span className="mt-0.5 block text-[11px] font-medium normal-case text-slate-500">
                Random hours
              </span>
            ) : null}
          </p>
          {showSelectedBadge ? (
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
              Selected — tap a day
            </p>
          ) : null}
        </div>
        <span
          className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-linear-to-b from-amber-50 to-amber-100/90 px-2.5 py-1 font-mono text-sm font-bold tabular-nums text-slate-900 shadow-inner shadow-white/50"
          aria-hidden="true"
        >
          {card.hours}h
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="break-words text-xs font-semibold leading-snug text-slate-800">
        {card.label}
      </p>
      <span
        className="inline-flex w-fit rounded-md border border-slate-200 bg-amber-50/90 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums text-slate-900"
        aria-hidden="true"
      >
        {card.hours}h
      </span>
    </div>
  );
}
