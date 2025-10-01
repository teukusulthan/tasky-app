"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth("/login");

  return (
    <>
      {loading ? (
        <div>
          {" "}
          <div className="w-full h-screen flex justify-center items-center">
            <Spinner size={36} variant="circle" />
          </div>
        </div>
      ) : (
        user && (
          <div>
            <Navbar />
            {children}
          </div>
        )
      )}
    </>
  );
}
