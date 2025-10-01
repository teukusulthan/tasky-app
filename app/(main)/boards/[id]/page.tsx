"use client";

import { useState } from "react";
import type { DragEndEvent } from "@/components/ui/shadcn-io/kanban";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/components/ui/shadcn-io/kanban";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Task = { id: string; name: string; column: string };
type Column = { id: string; name: string; color?: string };

const columns: Column[] = [
  { id: "l1", name: "To do", color: "#6B7280" },
  { id: "l2", name: "In Progress", color: "#F59E0B" },
  { id: "l3", name: "Done", color: "#10B981" },
];

const initialTasks: Task[] = [
  { id: "t1", name: "Setup Database", column: "l1" },
  { id: "t2", name: "API Contract", column: "l2" },
  { id: "t3", name: "Deploy Supabase", column: "l2" },
  { id: "t4", name: "UI Kanban (shadcn-io)", column: "l3" },
];

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const status = columns.find(({ id }) => id === over.id);
    if (!status) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === active.id ? { ...t, column: status.id } : t))
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-16 w-full flex items-center px-5">
        <Link href="/boards">
          <Button
            variant="ghost"
            className="hover:text-secondary hover:bg-background cursor-pointer text-accent-foreground border-none bg-background"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <p className="text-secondary px-5 text-xl font-semibold">My Board</p>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-5">
        <div className="inline-flex gap-4">
          {" "}
          <KanbanProvider
            columns={columns}
            data={tasks}
            onDragEnd={handleDragEnd}
          >
            {(column) => (
              <KanbanBoard
                id={column.id}
                key={column.id}
                className="w-72 flex-none bg-muted/30 rounded-xl p-3"
              >
                <KanbanHeader className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold">{column.name}</h2>
                  <Badge variant="outline">
                    {tasks.filter((t) => t.column === column.id).length}
                  </Badge>
                </KanbanHeader>

                <KanbanCards id={column.id}>
                  {(item) => {
                    const task = item as Task;
                    return (
                      <KanbanCard
                        id={task.id}
                        key={task.id}
                        column={column.name}
                        name={task.name}
                        className="mb-2 p-3 rounded-md border bg-background shadow-sm hover:shadow-md transition-shadow text-sm font-medium"
                      >
                        {task.name}
                      </KanbanCard>
                    );
                  }}
                </KanbanCards>
              </KanbanBoard>
            )}
          </KanbanProvider>
        </div>
      </div>
    </div>
  );
}
