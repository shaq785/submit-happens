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
          ? "sh-panel flex w-full shrink-0 flex-col overflow-hidden rounded-2xl p-3 backdrop-blur-md"
          : "w-full rounded-2xl p-3 sm:shadow-sm"
      }
      aria-label="Available time cards"
    >
      <h2 className="mb-1.5 shrink-0 text-xs font-medium tracking-wide text-slate-500">
        Your hand — drag to a weekday or tap to select
      </h2>
      <div
        className={
          sidebar
            ? "grid grid-cols-1 content-start gap-2.5 auto-rows-min"
            : "grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5"
        }
      >
        {cards.map((card) => (
          <DraggableHandCard
            key={card.id}
            card={card}
            density={sidebar ? "sidebar" : "compact"}
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
