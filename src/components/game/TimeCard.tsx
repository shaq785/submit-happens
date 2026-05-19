import type { CSSProperties } from "react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";
import type { TimeEntryCard } from "@/types/game";

type TimeCardProps = {
  card: TimeEntryCard;
  variant?: "hand" | "placed";
  /** Dock = compact grid; sidebar = short single-row rows on desktop. */
  density?: "compact" | "comfortable" | "sidebar";
  selected?: boolean;
  onSelect?: () => void;
  /** When provided, hand cards participate in @dnd-kit drag (listeners/ref on button). */
  dnd?: {
    setNodeRef: (element: HTMLButtonElement | null) => void;
    listeners: DraggableSyntheticListeners;
    attributes: DraggableAttributes;
    style?: CSSProperties;
    isDragging?: boolean;
  };
};

export function TimeCard({
  card,
  variant = "hand",
  density = "compact",
  selected = false,
  onSelect,
  dnd,
}: TimeCardProps) {
  const isHand = variant === "hand";
  const base =
    "w-full rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2";

  const handStyles = selected
    ? "sh-hand-card sh-hand-card--selected border border-emerald-300/60 sh-card-selected-pulse"
    : "sh-hand-card border border-slate-200/60 hover:border-emerald-200/80";

  const placedStyles =
    "sh-placed-card border border-slate-200/50 shadow-sm pointer-events-none cursor-default";

  const comfy = density === "comfortable";

  const handDragClass =
    dnd?.isDragging === true ? "cursor-grabbing" : "";

  if (isHand && onSelect) {
    return (
      <button
        type="button"
        data-sh-hand-card={dnd ? card.id : undefined}
        ref={dnd?.setNodeRef}
        {...(dnd?.listeners ?? {})}
        {...(dnd?.attributes ?? {})}
        style={{ ...dnd?.style }}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${card.label}, ${card.hours} hours${selected ? ", selected" : ""}. Drag to a weekday or tap to select then tap a day.`}
        className={`${base} ${handStyles} ${
          density === "sidebar"
            ? "min-h-20 px-3.5 py-3.5"
            : comfy
              ? "px-3 py-2.5 sm:py-3"
              : "min-h-19 px-3 py-2.5"
        } ${handDragClass} ${dnd ? "touch-none active:cursor-grabbing" : ""}`}
      >
        <CardInner
          card={card}
          layout="hand"
          density={density}
          showSelectedBadge={selected && density !== "sidebar"}
        />
      </button>
    );
  }

  return (
    <div className={`${base} ${placedStyles} min-w-0 px-1.5 py-1 sm:px-2 sm:py-1.5`}>
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
  density?: "compact" | "comfortable" | "sidebar";
  showSelectedBadge?: boolean;
}) {
  if (layout === "hand") {
    if (density === "sidebar") {
      return (
        <div className="flex flex-col justify-center gap-2">
          <span className="min-w-0 text-base font-medium leading-snug text-slate-800">
            {card.label}
          </span>
          <span
            className="inline-flex w-fit items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-slate-800"
            aria-hidden="true"
          >
            {card.hours}h
          </span>
        </div>
      );
    }

    const comfy = density === "comfortable";
    return (
      <div className="flex flex-col gap-2">
        <div className="min-w-0">
          <div
            className={`text-pretty break-words font-medium leading-snug text-slate-800 ${comfy ? "text-[0.9375rem]" : "text-sm"}`}
          >
            <span className="block">{card.label}</span>
          </div>
          {showSelectedBadge ? (
            <p className="mt-1.5 text-[11px] font-medium text-emerald-800/90">
              Selected — tap a day or drag onto the board
            </p>
          ) : null}
        </div>
        <span
          className="inline-flex w-fit items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-slate-800"
          aria-hidden="true"
        >
          {card.hours}h
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="break-words text-[10px] font-medium leading-snug text-slate-700 sm:text-[11px]">
        {card.label}
      </p>
      <span
        className="inline-flex w-fit rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-slate-700 ring-1 ring-slate-200/80"
        aria-hidden="true"
      >
        {card.hours}h
      </span>
    </div>
  );
}
