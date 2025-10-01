"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import supabase from "@/lib/supabase-client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database.types";
type Board = Database["public"]["Tables"]["boards"]["Row"];

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBoards([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("boards")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching boards:", error.message);
      } else {
        setBoards(data || []);
      }

      setLoading(false);
    };

    fetchBoards();
  }, []);

  return (
    <div className="w-full min-h-screen px-10 pt-10">
      {/* Headers */}
      <div className="flex flex-row justify-between h-20 ">
        <div>
          <h1 className="font-bold text-3xl">
            Hello <span className="text-primary">Teuku Sulthan</span>.{" "}
          </h1>
          <h2 className="font-bold text-secondary text-xl">
            Here’s an overview of your boards.
          </h2>
        </div>
        <div>
          <Button variant="ghost">
            {" "}
            <Plus /> Create Board
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {boards.map((board) => (
          <Card
            key={board.id}
            className="cursor-pointer hover:bg-muted/30 hover:scale-105 transition-all duration-500"
          >
            <CardContent>
              <CardTitle> {board.title} </CardTitle>
              <CardDescription>{board.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <footer className="border-t mt-10 py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">Tasky App</span>. All rights reserved.
        </p>
        <p className="mt-2">
          Built with Love by <span className="text-primary">Teuku Sulhtan</span>
          .
        </p>
      </footer>
    </div>
  );
}
