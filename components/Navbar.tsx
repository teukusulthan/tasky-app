"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Plus, LogOut, UserRoundPen } from "lucide-react";

import supabase from "@/lib/supabase-client";
import { useUserStore } from "@/stores/user.store";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CreateBoardDialog from "./CreateBoard";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import type { Database } from "@/types/database.types";
type Board = Database["public"]["Tables"]["boards"]["Row"];

type NavbarProps = {
  onBoardCreated?: (board: Board) => void;
};

export default function Navbar({ onBoardCreated }: NavbarProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const profile = useUserStore((s) => s.profile);
  const loadingProfile = useUserStore((s) => s.loading);
  const loadProfile = useUserStore((s) => s.loadProfile);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const displayName = useMemo(() => {
    const name =
      (profile?.full_name && profile.full_name.trim()) ||
      (loadingProfile ? "Loading…" : "Guest");
    return name;
  }, [profile?.full_name, loadingProfile]);

  const initials = useMemo(() => {
    const base = profile?.full_name?.trim() || "User";
    const parts = base.split(" ").filter(Boolean).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
  }, [profile?.full_name]);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      useUserStore.getState().clear();

      toast.success("Logged out");
      router.replace("/login");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to logout");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-b-accent/60 bg-background/80 backdrop-blur">
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
                Create Board
              </Button>
            }
          />

          {/* User */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarImage
                    src={profile?.avatar_url || undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent
                className="bg-background border border-muted w-44"
                align="end"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => router.push("/settings/profile")}
                  >
                    <UserRoundPen className="h-4 w-4" />
                    Edit Profile
                  </Button>

                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={handleLogout}
                    disabled={signingOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {signingOut ? "Logging out..." : "Logout"}
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
