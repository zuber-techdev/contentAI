"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function InitialRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) {
      router.push("/auth");
    } else if (user) {
      if (user.isAdmin) {
        router.push("/admin/dashboard");
      } else if (pathname === "/success") {
        router.push("/success");
      } else {
        router.push("/home");
      }
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="mr-2 h-16 w-16 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
