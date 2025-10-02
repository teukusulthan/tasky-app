import type { Database } from "@/types/database.types";

export type TaskUI = { id: string; name: string; column: string };
export type ColumnUI = { id: string; name: string };

export type ListRow = Database["public"]["Tables"]["lists"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type ListWithTasks = ListRow & { tasks: TaskRow[] };
