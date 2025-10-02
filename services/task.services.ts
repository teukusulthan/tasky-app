import supabase from "@/lib/supabase-client";
import type { Database } from "@/types/database.types";

type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export async function moveTaskToList(taskId: number, newListId: number) {
  if (!Number.isFinite(taskId) || !Number.isFinite(newListId)) {
    throw new Error("Invalid ids");
  }

  const patch: TaskUpdate = { list_id: newListId };

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", taskId)
    .select("id, list_id")
    .single();

  if (error) throw error;
  return data!;
}
