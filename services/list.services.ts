import supabase from "@/lib/supabase-client";
import type { Database } from "@/types/database.types";

export type ListRow = Database["public"]["Tables"]["lists"]["Row"];
export type ListInsert = Database["public"]["Tables"]["lists"]["Insert"];
export type ListUpdate = Database["public"]["Tables"]["lists"]["Update"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

type GetOpts = {
  withTasks?: boolean;
  asc?: boolean;
};

export async function getListsByBoardId(
  boardId: number,
  opts: GetOpts = {}
): Promise<ListRow[] | (ListRow & { tasks: TaskRow[] })[]> {
  const { withTasks = false, asc = true } = opts;

  if (!Number.isFinite(boardId)) throw new Error("Invalid board_id");

  if (withTasks) {
    const { data, error } = await supabase
      .from("lists")
      .select(
        `
        id, created_at, list_name, board_id,
        tasks (
          id, created_at, title, content, image_url, list_id
        )
      `
      )
      .eq("board_id", boardId)
      .order("created_at", { ascending: asc });

    if (error) throw error;
    return (data ?? []) as (ListRow & { tasks: TaskRow[] })[];
  }

  const { data, error } = await supabase
    .from("lists")
    .select("id, created_at, list_name, board_id")
    .eq("board_id", boardId)
    .order("created_at", { ascending: asc });

  if (error) throw error;
  return (data ?? []) as ListRow[];
}

export async function createList(
  boardId: number,
  list_name: string
): Promise<ListRow> {
  if (!list_name?.trim()) throw new Error("list_name is required");

  const payload: ListInsert = {
    board_id: boardId,
    list_name: list_name.trim(),
  };

  const { data, error } = await supabase
    .from("lists")
    .insert([payload])
    .select("id, created_at, list_name, board_id")
    .single();

  if (error) throw error;
  return data!;
}

export async function updateList(
  listId: number,
  patch: { list_name?: string; board_id?: number }
): Promise<ListRow> {
  const dataToUpdate: ListUpdate = {};
  if (typeof patch.list_name === "string") {
    const n = patch.list_name.trim();
    if (!n) throw new Error("list_name cannot be empty");
    dataToUpdate.list_name = n;
  }
  if (typeof patch.board_id === "number") {
    dataToUpdate.board_id = patch.board_id;
  }

  const { data, error } = await supabase
    .from("lists")
    .update(dataToUpdate)
    .eq("id", listId)
    .select("id, created_at, list_name, board_id")
    .single();

  if (error) throw error;
  return data!;
}

export async function deleteList(listId: number): Promise<void> {
  const { error } = await supabase.from("lists").delete().eq("id", listId);
  if (error) throw error;
}
