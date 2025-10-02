"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, LogOut, UserRoundPen } from "lucide-react";
import CreateBoardDialog from "./CreateBoard";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { Database } from "@/types/database.types";

type Board = Database["public"]["Tables"]["boards"]["Row"];

type NavbarProps = {
  onBoardCreated?: (board: Board) => void;
  userName?: string;
};

export default function Navbar({
  onBoardCreated,
  userName = "Teuku Sulthan",
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-b-accent/60 bg-background backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3">
        {/* Logo */}
        <div className="text-lg font-bold text-primary">
          <span className="text-neutral-200">tasky</span>.
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="hidden sm:inline-flex gap-2 border-zinc-800"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>

          <CreateBoardDialog
            onCreated={onBoardCreated}
            trigger={
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            }
          />

          {/* User */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{userName}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback>
                    {userName
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="bg-background border border-muted w-40">
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="justify-start gap-2">
                    <UserRoundPen className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" className="justify-start gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
