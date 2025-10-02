"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import supabase from "@/lib/supabase-client";
import { getListsByBoardId, deleteList } from "@/services/list.services";
import { moveTaskToList, deleteTask } from "@/services/task.services";
import { getBoard } from "@/services/board.services";
import type { ColumnUI, TaskUI, ListWithTasks } from "@/types/kanban";
import { toNum } from "@/lib/utils/number";

export function useBoardData(boardId: number | null) {
  const [columns, setColumns] = useState<ColumnUI[]>([]);
  const [tasks, setTasks] = useState<TaskUI[]>([]);
  const [boardTitle, setBoardTitle] = useState("My Board");
  const [boardDescription, setBoardDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const inFlightMoves = useRef<Set<string>>(new Set());
  const mounted = useRef(true);
  const [busyMove, setBusyMove] = useState(false);

  const [listToDelete, setListToDelete] = useState<ColumnUI | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskUI | null>(null);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const visibilityRefetched = useRef(false);
  const latestRequestToken = useRef(0);

  // sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // load board
  const loadBoard = useCallback(async () => {
    if (!Number.isFinite(boardId)) {
      setLoading(false);
      return;
    }
    const myToken = ++latestRequestToken.current;

    try {
      setLoading(true);
      const [listsRaw, board] = await Promise.all([
        getListsByBoardId(boardId!, { withTasks: true }),
        getBoard(boardId!),
      ]);
      if (myToken !== latestRequestToken.current) return;

      const lists = (listsRaw as ListWithTasks[]).filter(Boolean);

      const nextCols: ColumnUI[] = lists.map((l) => ({
        id: String(l.id),
        name: l.list_name,
      }));

      const nextTasks: TaskUI[] = lists.flatMap((l) =>
        (l.tasks ?? []).filter(Boolean).map((t) => ({
          id: String(t.id),
          name: t.title ?? "(Untitled)",
          column: String(l.id),
        }))
      );

      if (!mounted.current) return;
      setColumns(nextCols);
      setTasks(nextTasks);
      setBoardTitle(board?.title ?? "My Board");
      setBoardDescription(board?.description ?? "");
    } catch (e: any) {
      if (!mounted.current) return;
      console.error(e);
      toast.error(e?.message ?? "Failed to load board data");
      setColumns([]);
      setTasks([]);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [boardId]);

  // lifecycles
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(boardId)) {
      toast.error("Invalid board id");
      setLoading(false);
      return;
    }
    loadBoard();
  }, [boardId, loadBoard]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") loadBoard();
      if (event === "SIGNED_OUT") {
        setColumns([]);
        setTasks([]);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [loadBoard]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!visibilityRefetched.current) {
          visibilityRefetched.current = true;
          loadBoard();
          setTimeout(() => (visibilityRefetched.current = false), 3000);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadBoard]);

  // derived
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tasks) m[t.column] = (m[t.column] || 0) + 1;
    return m;
  }, [tasks]);

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, TaskUI[]>();
    for (const c of columns) map.set(c.id, []);
    for (const t of tasks) map.get(t.column)?.push(t) ?? map.set(t.column, [t]);
    return map;
  }, [columns, tasks]);

  const findTask = (id: string) => tasks.find((t) => t.id === id);
  const activeTask = activeTaskId ? findTask(activeTaskId) ?? null : null;

  // delete list
  const confirmDeleteList = async () => {
    const col = listToDelete;
    if (!col || deletingListId) return;
    const listIdNum = toNum(col.id);
    if (listIdNum === null) return;

    setDeletingListId(col.id);
    try {
      await deleteList(listIdNum);
      setColumns((prev) => prev.filter((c) => c.id !== col.id));
      setTasks((prev) => prev.filter((t) => t.column !== col.id));
      toast.success("List deleted");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to delete list");
    } finally {
      setDeletingListId(null);
      setListToDelete(null);
    }
  };

  // delete task
  const confirmDeleteTask = async () => {
    const t = taskToDelete;
    if (!t || deletingTaskId) return;

    const taskIdNum = toNum(t.id);
    if (taskIdNum === null) return;

    setDeletingTaskId(t.id);
    try {
      await deleteTask(taskIdNum);
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
      toast.success("Task deleted");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to delete task");
    } finally {
      setDeletingTaskId(null);
      setTaskToDelete(null);
    }
  };

  // dnd handlers
  const onDragStart = (event: any) => {
    setActiveTaskId(String(event.active.id));
  };

  const onDragOver = (_event: any) => {
    // no-op
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveTaskId(null);
    if (!over) return;

    const draggedTaskId = String(active.id);
    const overId = String(over.id);

    const toColumnId =
      (overId.startsWith("col-")
        ? overId.slice(4)
        : findTask(overId)?.column) ?? null;

    if (!toColumnId) return;

    const current = findTask(draggedTaskId);
    if (!current || current.column === toColumnId) return;

    if (busyMove || inFlightMoves.current.has(draggedTaskId)) return;
    setBusyMove(true);
    inFlightMoves.current.add(draggedTaskId);

    const prev = tasks;
    setTasks((s) =>
      s.map((t) => (t.id === draggedTaskId ? { ...t, column: toColumnId } : t))
    );

    try {
      const newListId = toNum(toColumnId);
      const taskIdNum = toNum(draggedTaskId);
      if (newListId === null || taskIdNum === null)
        throw new Error("Invalid identifiers");
      await moveTaskToList(taskIdNum, newListId);
    } catch (e: any) {
      setTasks(prev);
      console.error(e);
      toast.error(e?.message ?? "Failed to move task");
    } finally {
      inFlightMoves.current.delete(draggedTaskId);
      setBusyMove(false);
    }
  };

  return {
    // state
    loading,
    boardTitle,
    boardDescription,
    columns,
    counts,
    tasksByColumn,
    activeTask,
    activeTaskId,

    // setters
    setColumns,
    setTasks,
    setListToDelete,
    setTaskToDelete,

    // dnd
    sensors,
    onDragStart,
    onDragOver,
    onDragEnd,

    // delete
    listToDelete,
    taskToDelete,
    deletingListId,
    deletingTaskId,
    confirmDeleteList,
    confirmDeleteTask,
  };
}
