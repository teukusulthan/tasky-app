"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import type { Database } from "@/types/database.types";
import { createList } from "@/services/list.services";

type ListRow = Database["public"]["Tables"]["lists"]["Row"];

export default function CreateListDialog({
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
    if (!n) return toast.error("List name is required");
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
        <Button variant="ghost" className="gap-2">
          <Plus className="h-4 w-4" /> Create List
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
