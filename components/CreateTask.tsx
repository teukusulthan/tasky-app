"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/services/task.services";
import type { Database } from "@/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export default function CreateTask({
  listId,
  onCreated,
  triggerText = "Add Task",
}: {
  listId: number;
  onCreated?: (task: TaskRow) => void;
  triggerText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      toast.error("Task title is required");
      return;
    }
    try {
      setSubmitting(true);
      const created = await createTask(listId, t, content.trim() || null);
      toast.success("Task created");
      onCreated?.(created);
      setTitle("");
      setContent("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* penting: cegah drag-scroll/DnD “mencuri” event */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 border-dashed"
          data-no-drag-scroll="true"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Plus className="h-4 w-4" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent
        data-no-drag-scroll="true"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Fill task details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="e.g. Set up database"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-content">Description (optional)</Label>
            <Textarea
              id="task-content"
              placeholder="Short details…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              rows={3}
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
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
