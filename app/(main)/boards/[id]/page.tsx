"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import CreateListDialog from "@/components/CreateList";
import AddTaskDialog from "@/components/CreateTask";
import ExpandableDescription from "@/components/ExpandableDesc";

import { DroppableColumn } from "@/components/kanban/DroppableColumn";
import { SortableCard } from "@/components/kanban/SortableCard";

import { useBoardData } from "@/hooks/useBoardData";
import { usePointerPan } from "@/hooks/usePointerPan";
import { columnFirstCollision } from "@/lib/dnd/collumFirstCollision";
import { toNum } from "@/lib/utils/number";
import { cx } from "@/lib/utils/cx";

export default function BoardPage() {
  const params = useParams<{ id: string }>();
  const boardId = Number(params?.id);

  const {
    loading,
    boardTitle,
    boardDescription,
    columns,
    counts,
    tasksByColumn,
    activeTask,
    activeTaskId,
    sensors,
    listToDelete,
    taskToDelete,
    deletingListId,
    deletingTaskId,
    setListToDelete,
    setTaskToDelete,
    setColumns,
    setTasks,
    onDragStart,
    onDragOver,
    onDragEnd,
    confirmDeleteList,
    confirmDeleteTask,
  } = useBoardData(boardId);

  const { panRef, stopAll } = usePointerPan();

  return (
    <div className="flex flex-col h-screen min-h-0">
      {/* Header */}
      <div className="w-full px-5 pt-4 pb-10">
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-2">
          <Link href="/boards">
            <Button variant="ghost" className="hover:text-secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </Link>

          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {loading ? "Loading..." : boardTitle}
            </h1>
            <div className="mt-1 max-w-2xl md:max-w-3xl">
              <ExpandableDescription
                text={boardDescription || "No description"}
              />
            </div>
          </div>

          <CreateListDialog
            boardId={Number.isFinite(boardId) ? boardId : 0}
            onCreated={(newList) =>
              setColumns((prev) => [
                ...prev,
                { id: String(newList.id), name: newList.list_name },
              ])
            }
          />
        </div>
      </div>

      {/* Kanban area (drag-to-scroll) */}
      <div
        ref={panRef}
        className="flex-1 min-h-0 px-20 pb-3 overflow-x-hidden overflow-y-hidden select-none"
      >
        {loading ? (
          <div className="inline-flex gap-4 pr-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-72 h-40 bg-muted/30 rounded-xl animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <div className="flex justify-center items-center h-full text-sm text-muted-foreground">
            No lists yet.
          </div>
        ) : (
          <div className="inline-flex items-start flex-nowrap gap-4 pr-2">
            <DndContext
              sensors={sensors}
              collisionDetection={columnFirstCollision}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
            >
              {columns.map((column) => {
                const items = tasksByColumn.get(column.id) ?? [];
                const count = counts[column.id] ?? 0;

                return (
                  <div
                    key={column.id}
                    className="w-72 shrink-0 bg-muted/30 rounded-xl p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold">{column.name}</h2>
                        <Badge variant="outline">{count}</Badge>
                      </div>

                      {/* List menu */}
                      <div
                        onPointerDown={stopAll}
                        onMouseDown={stopAll}
                        onTouchStart={stopAll}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setListToDelete(column)}
                          aria-label="List options"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    <DroppableColumn columnId={column.id}>
                      <SortableContext
                        items={items.map((t) => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {items.length === 0 ? (
                          <div className="rounded-md border border-dashed bg-background/40 text-muted-foreground text-xs grid place-items-center h-20">
                            Drop here
                          </div>
                        ) : (
                          items.map((task) => (
                            <SortableCard
                              key={task.id}
                              task={task}
                              className={cx(
                                "mb-2 p-3 rounded-md border bg-background shadow-sm",
                                "hover:shadow-md transition-shadow text-sm font-medium"
                              )}
                              onDeleteClick={setTaskToDelete}
                            />
                          ))
                        )}
                      </SortableContext>
                    </DroppableColumn>

                    <div className="mt-2 pt-2 border-t">
                      <AddTaskDialog
                        listId={toNum(column.id) ?? 0}
                        onCreated={(created) =>
                          setTasks((prev) => [
                            ...prev,
                            {
                              id: String(created.id),
                              name: created.title ?? "(Untitled)",
                              column: column.id,
                            },
                          ])
                        }
                      />
                    </div>
                  </div>
                );
              })}

              <DragOverlay>
                {activeTask ? (
                  <div className="mb-2 p-3 rounded-md border bg-background shadow-sm text-sm font-medium max-w-[18rem]">
                    <p className="whitespace-pre-wrap break-words overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                      {activeTask.name}
                    </p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>

      {/* Delete List */}
      <AlertDialog
        open={!!listToDelete}
        onOpenChange={(o) => !o && setListToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              {listToDelete
                ? `This will permanently delete “${listToDelete.name}”${
                    (counts[listToDelete.id] ?? 0) > 0
                      ? ` and ${counts[listToDelete.id] ?? 0} task(s) inside.`
                      : "."
                  }`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingListId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteList}
              disabled={!!deletingListId}
            >
              {deletingListId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Task */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(o) => !o && setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete
                ? `This will permanently delete “${taskToDelete.name}”.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingTaskId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteTask}
              disabled={!!deletingTaskId}
            >
              {deletingTaskId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
