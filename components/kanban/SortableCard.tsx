"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import type { TaskUI } from "@/types/kanban";
import { cx } from "@/lib/utils/cx";

export function SortableCard({
  task,
  className,
  onDeleteClick,
}: {
  task: TaskUI;
  className?: string;
  onDeleteClick?: (task: TaskUI) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    position: "relative",
  };

  const stopAll = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    // @ts-ignore
    e.nativeEvent?.stopImmediatePropagation?.();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      aria-label={`Move task ${task.name}`}
      className={className}
    >
      {/* Task menu */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-1.5 top-1.5 h-7 w-7"
        onPointerDown={stopAll}
        onMouseDown={stopAll}
        onTouchStart={stopAll}
        onClick={() => onDeleteClick?.(task)}
        aria-label="Task options"
      >
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </Button>

      <p
        title={task.name}
        className={cx(
          "whitespace-pre-wrap break-words overflow-hidden pr-9",
          "[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]"
        )}
      >
        {task.name}
      </p>
    </div>
  );
}
