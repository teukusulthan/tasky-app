"use client";

import { useEffect, useMemo, useState } from "react";
import type { DragEndEvent } from "@/components/ui/shadcn-io/kanban";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/components/ui/shadcn-io/kanban";

import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { getListsByBoardId, createList } from "@/services/list.services";
import { moveTaskToList } from "@/services/task.services";
import { getBoard } from "@/services/board.services";
import type { Database } from "@/types/database.types";

// shadcn dialog & form
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskUI = { id: string; name: string; column: string };
type ColumnUI = { id: string; name: string; color?: string };

type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type ListWithTasks = ListRow & { tasks: TaskRow[] };

export default function BoardPage() {
  // Ambil boardId dari URL
  const params = useParams<{ id: string }>();
  const rawId = params?.id as unknown as string | string[];
  const boardIdStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const boardId = Number(boardIdStr);

  const [columns, setColumns] = useState<ColumnUI[]>([]);
  const [tasks, setTasks] = useState<TaskUI[]>([]);
  const [boardTitle, setBoardTitle] = useState<string>("My Board");
  const [loading, setLoading] = useState(true);

  // Helper mapping id list <-> id column UI
  const listIdFromColumn = (colId: string) =>
    Number(colId.replace("list-", ""));
  const columnIdFromList = (listId: number) => `list-${listId}`;

  useEffect(() => {
    if (!Number.isFinite(boardId)) {
      toast.error("Invalid board id");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        const [listsRaw, board] = await Promise.all([
          getListsByBoardId(boardId, { withTasks: true }),
          getBoard(boardId),
        ]);

        if (cancelled) return;

        const lists = listsRaw as ListWithTasks[];

        // 1) columns dari lists
        const cols: ColumnUI[] = lists.map((l) => ({
          id: columnIdFromList(l.id),
          name: l.list_name,
        }));
        setColumns(cols);

        // 2) tasks dari setiap list (title bisa null -> fallback)
        const tks: TaskUI[] = lists.flatMap((l) =>
          (l.tasks ?? []).map((t) => ({
            id: String(t.id),
            name: t.title ?? "(Untitled)",
            column: columnIdFromList(l.id),
          }))
        );
        setTasks(tks);

        setBoardTitle(board?.title ?? "My Board");
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load board data");
        setColumns([]);
        setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId]);

  // Hitung jumlah task per kolom untuk badge
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tasks) m[t.column] = (m[t.column] || 0) + 1;
    return m;
  }, [tasks]);

  // Drag & drop: pindahkan task ke kolom baru (optimistic), lalu simpan ke DB
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === undefined || over.id === undefined) return;

    const taskIdStr = String(active.id);
    const toColumnId = String(over.id);

    const current = tasks.find((t) => t.id === taskIdStr);
    if (!current || current.column === toColumnId) return;

    // Optimistic update
    const prev = tasks;
    setTasks((s) =>
      s.map((t) => (t.id === taskIdStr ? { ...t, column: toColumnId } : t))
    );

    try {
      const taskId = Number(taskIdStr);
      const newListId = listIdFromColumn(toColumnId);
      await moveTaskToList(taskId, newListId);
    } catch (e: any) {
      setTasks(prev); // rollback
      toast.error(e?.message ?? "Failed to move task");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="h-16 w-full flex items-center justify-between px-5">
        <div className="flex items-center">
          <Link href="/boards">
            <Button
              variant="ghost"
              className="hover:text-secondary hover:bg-background cursor-pointer text-accent-foreground border-none bg-background"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <p className="text-secondary px-5 text-xl font-semibold">
            {loading ? "Loading..." : boardTitle}
          </p>
        </div>

        {/* 👉 Tombol Create List di pojok kanan */}
        <CreateListDialog
          boardId={boardId}
          onCreated={(newList) => {
            // tambah kolom baru; tasks tetap kosong (count=0)
            setColumns((prev) => [
              ...prev,
              { id: columnIdFromList(newList.id), name: newList.list_name },
            ]);
          }}
        />
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-5">
        {loading ? (
          <div className="inline-flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-72 h-40 bg-muted/30 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <div className="text-sm text-muted-foreground">No lists yet.</div>
        ) : (
          <div className="inline-flex gap-4">
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
                    <Badge variant="outline">{counts[column.id] ?? 0}</Badge>
                  </KanbanHeader>

                  <KanbanCards id={column.id}>
                    {(item) => {
                      const task = item as TaskUI;
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
        )}
      </div>
    </div>
  );
}

/* ====== CreateListDialog (inline component) ====== */
function CreateListDialog({
  boardId,
  onCreated,
}: {
  boardId: number;
  onCreated?: (list: ListRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      toast.error("List name is required");
      return;
    }
    try {
      setSubmitting(true);
      const created = await createList(boardId, n);
      toast.success(`List “${created.list_name}” created`);
      onCreated?.(created);
      setName("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create list");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create list
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new list</DialogTitle>
          <DialogDescription>Give your list a clear name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List name</Label>
            <Input
              id="list-name"
              placeholder="e.g. To do"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
