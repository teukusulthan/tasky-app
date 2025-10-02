"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreVertical, Trash2, Pencil } from "lucide-react";

import type { Database } from "@/types/database.types";
import { getBoards, deleteBoard } from "@/services/board.services";
import { getMyProfile } from "@/services/profile.services";

import CreateBoardDialog from "@/components/CreateBoard";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type Board = Database["public"]["Tables"]["boards"]["Row"];

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [rows, profile] = await Promise.all([
          getBoards(30, 0),
          getMyProfile(),
        ]);
        if (!cancelled) {
          setBoards(rows);
          setFullName(profile?.full_name ?? "");
        }
      } catch (err: any) {
        if (!cancelled) {
          toast.error(err?.message ?? "Failed to load data");
          setBoards([]);
          setFullName("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full min-h-screen px-10 pt-10">
      <div className="flex flex-row justify-between h-20">
        <div>
          <h1 className="font-bold text-3xl">
            Hello <span className="text-primary">{fullName}</span>.
          </h1>
          <h2 className="font-bold text-secondary text-xl">
            Here’s an overview of your boards.
          </h2>
        </div>

        <CreateBoardDialog
          onCreated={(created) => setBoards((prev) => [created, ...prev])}
        />
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border animate-pulse bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {boards.map((b) => (
            <BoardCard
              key={b.id}
              board={b}
              onDeleted={(id) =>
                setBoards((prev) => prev.filter((x) => x.id !== id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card + Delete action                                               */
/* ------------------------------------------------------------------ */

function BoardCard({
  board,
  onDeleted,
}: {
  board: Board;
  onDeleted: (id: number) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteBoard(board.id);
      onDeleted(board.id);
      toast.success("Board deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete board");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="relative group">
      <Link href={`/boards/${board.id}`} className="block">
        <Card className="cursor-pointer hover:bg-muted/30 transition-all duration-300">
          <CardContent className="">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate">{board.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {board.description ?? "No description"}
                </CardDescription>
              </div>

              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-100 transition-opacity"
                      aria-label="Open menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className=" text-destructive focus:text-destructive">
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Confirm dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this board?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All lists and tasks under this board
              will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
