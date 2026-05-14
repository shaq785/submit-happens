import type { TimeEntryCard } from "@/types/game";
import { TimeCard } from "./TimeCard";

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
          ? "w-full rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl shadow-slate-900/10"
          : "w-full rounded-t-2xl border border-b-0 border-slate-200/90 bg-white/95 p-3 shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md sm:rounded-2xl sm:border-b sm:shadow-xl sm:shadow-slate-900/10"
      }
      aria-label="Available time cards"
    >
      <h2 className="mb-3 px-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:text-xs">
        Your cards — tap one, then a day
      </h2>
      <div
        className={
          sidebar
            ? "grid grid-cols-1 gap-2.5"
            : "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
        }
      >
        {cards.map((card) => (
          <TimeCard
            key={card.id}
            card={card}
            variant="hand"
            density={sidebar ? "comfortable" : "compact"}
            selected={!disabled && selectedId === card.id}
            onSelect={() => {
              if (!disabled) onSelectCard(card.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}
