"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, LogOut, UserRoundPen } from "lucide-react";
import CreateBoardDialog from "./CreateBoard";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { Database } from "@/types/database.types";
import { getMyProfile } from "@/services/profile.services";

type Board = Database["public"]["Tables"]["boards"]["Row"];

type NavbarProps = {
  onBoardCreated?: (board: Board) => void;
};

type ProfileShape = {
  full_name?: string | null;
  avatar_url?: string | null;
};

export default function Navbar({ onBoardCreated }: NavbarProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [profile, setProfile] = useState<ProfileShape | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingProfile(true);
        const p = await getMyProfile();
        if (!cancelled) setProfile(p ?? null);
      } catch (e: any) {
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      try {
        const p = await getMyProfile();
        setProfile(p ?? null);
      } catch {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to logout");
    } finally {
      setSigningOut(false);
    }
  };

  const displayName =
    (profile?.full_name && profile.full_name.trim()) ||
    (loadingProfile ? "Loading…" : "Guest");

  const initials =
    (displayName || "User")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "U";

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
            <span className="text-sm font-medium max-w-[160px] truncate">
              {displayName}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarImage
                    src={profile?.avatar_url ?? ""}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="bg-background border border-muted w-44">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => {
                      router.push("/settings/profile");
                    }}
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
