"use client";

import { useDroppable } from "@dnd-kit/core";
import { cx } from "@/lib/utils/cx";
import { colDroppableId } from "@/lib/dnd/constants";

export function DroppableColumn({
  columnId,
  children,
  className,
}: {
  columnId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: colDroppableId(columnId),
    data: { type: "column", columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cx(
        "min-h-24 p-0.5",
        isOver && " outline-primary/40 rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
