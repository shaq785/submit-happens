"use client";

import { useDraggable } from "@dnd-kit/core";
import type { TimeEntryCard } from "@/types/game";
import { TimeCard } from "./TimeCard";

type DraggableHandCardProps = {
  card: TimeEntryCard;
  selected: boolean;
  disabled: boolean;
  density: "compact" | "comfortable";
  onSelect: () => void;
};

export function DraggableHandCard({
  card,
  selected,
  disabled,
  density,
  onSelect,
}: DraggableHandCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    disabled,
    data: { type: "hand-card" as const, card },
  });

  /** Do not apply `transform` here — DragOverlay in GameShell follows the cursor.
   * Applying translate to the source node breaks layout across grid/scroll parents. */
  const dragStyle = isDragging ? { opacity: 0.35 } : undefined;

  return (
    <TimeCard
      card={card}
      variant="hand"
      density={density}
      selected={selected}
      onSelect={onSelect}
      dnd={{
        setNodeRef,
        listeners,
        attributes,
        style: dragStyle,
        isDragging,
      }}
    />
  );
}
