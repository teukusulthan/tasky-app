import supabase from "@/lib/supabase-client";
import type { Database } from "@/types/database.types";

type ListRow = Database["public"]["Tables"]["lists"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export async function moveTaskToList(
  taskId: TaskRow["id"],
  newListId: ListRow["id"]
): Promise<TaskRow> {
  const { data, error, status } = await supabase
    .from("tasks")
    .update({ list_id: newListId as any })
    .eq("id", taskId as any)
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new Error(`No row updated (status ${status})`);
  if (data.list_id != newListId) throw new Error("DB did not persist move");
  return data;
}

export async function createTask(
  listId: number,
  title: string,
  content: string | null = null
) {
  const payload: TaskInsert = { list_id: listId, title, content };
  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select("id, title, content, list_id")
    .single();
  if (error) throw error;
  return data as TaskRow;
}

export async function deleteTask(taskId: number): Promise<TaskRow> {
  if (!Number.isFinite(taskId)) {
    throw new Error("Invalid task id");
  }

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to delete task");
  }

  return data as TaskRow;
}
