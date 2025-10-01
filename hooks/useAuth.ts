import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";

export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (!user && redirectTo) {
        router.push(redirectTo);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user && redirectTo) {
        router.push(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [redirectTo, router]);

  return { user, loading };
}
