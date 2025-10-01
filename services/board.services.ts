import supabase from "@/lib/supabase-client";
import type { Database } from "@/types/database.types";

type BoardRow = Database["public"]["Tables"]["boards"]["Row"];
type BoardInsert = Database["public"]["Tables"]["boards"]["Insert"];

// Create
export async function createBoard(
  title: BoardRow["title"],
  description: BoardRow["description"] = null
) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Please sign in first.");

  const payload: BoardInsert = {
    title,
    description,
    user_id: auth.user.id,
  };

  const { data, error } = await supabase
    .from("boards")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data!;
}

// Read all
export async function getBoards(limit = 20, offset = 0) {
  const to = Math.max(offset + limit - 1, offset);

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, to);

  if (error) throw error;
  return (data ?? []) as BoardRow[];
}

// Read by id
export async function getBoard(id: BoardRow["id"]) {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// Delete
export async function deleteBoard(id: BoardRow["id"]) {
  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) throw error;
}
