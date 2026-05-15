import type { TimeEntryCard } from "@/types/game";
import { DraggableHandCard } from "./DraggableHandCard";

type CardTrayProps = {
  cards: TimeEntryCard[];
  selectedId: string | null;
  disabled: boolean;
  onSelectCard: (id: string) => void;
  /** Dock = mobile bottom bar (dense grid). Sidebar = desktop column (single column, readable labels). */
  placement?: "dock" | "sidebar";
};

export function CardTray({
  cards,
  selectedId,
  disabled,
  onSelectCard,
  placement = "dock",
}: CardTrayProps) {
  const sidebar = placement === "sidebar";

  return (
    <section
      className={
        sidebar
          ? "w-full rounded-2xl bg-white/60 p-4 ring-1 ring-slate-900/[0.05] backdrop-blur-sm"
          : "w-full rounded-t-2xl bg-white/70 p-3 ring-1 ring-slate-900/[0.06] backdrop-blur-xl sm:rounded-2xl sm:shadow-sm"
      }
      aria-label="Available time cards"
    >
      <h2 className="mb-3 text-xs font-medium tracking-wide text-slate-500">
        Your hand — drag to a weekday or tap to select
      </h2>
      <div
        className={
          sidebar
            ? "grid grid-cols-1 gap-2"
            : "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5"
        }
      >
        {cards.map((card) => (
          <DraggableHandCard
            key={card.id}
            card={card}
            density={sidebar ? "comfortable" : "compact"}
            selected={!disabled && selectedId === card.id}
            disabled={disabled}
            onSelect={() => {
              if (!disabled) onSelectCard(card.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}
