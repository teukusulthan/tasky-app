"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { Database } from "@/types/database.types";
import { getBoard, getBoards } from "@/services/board.services";
import CreateBoardDialog from "@/components/CreateBoard";
import { getMyProfile } from "@/services/profile.services";

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
            <Card
              key={b.id}
              className="hover:bg-muted/30 hover:scale-105 transition-all duration-300"
            >
              <CardContent>
                <CardTitle>{b.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {b.description ?? "No description"}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
