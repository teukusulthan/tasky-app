"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, LogOut, UserRoundPen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-b-accent/60
      bg-background backdrop-blur"
    >
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

          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Create Board
          </Button>

          {/* User */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Teuku Sulthan</span>
            <Popover>
              <PopoverTrigger>
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" alt="Teuku Sulthan" />
                  <AvatarFallback>TS</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="bg-background border border-muted">
                <div className="flex flex-col ">
                  <Button variant="ghost" className="py-0">
                    <UserRoundPen />
                    Edit
                  </Button>
                  <Button variant="ghost" className="py-0">
                    <LogOut /> Logout
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
