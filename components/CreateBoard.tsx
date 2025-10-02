// components/CreateBoardDialog.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBoard } from "@/services/board.services";
import type { Database } from "@/types/database.types";

type Board = Database["public"]["Tables"]["boards"]["Row"];

export default function CreateBoardDialog({
  onCreated,
  trigger,
}: {
  onCreated?: (board: Board) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    if (!t) return toast.error("Title is required");

    try {
      setSubmitting(true);
      const created = await createBoard(t, d ? d : null);
      toast.success(`Board “${created.title}” created`);
      onCreated?.(created);
      setTitle("");
      setDescription("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create board");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="ghost">Create Board</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new board</DialogTitle>
          <DialogDescription>Fill the form below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
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
