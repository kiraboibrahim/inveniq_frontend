"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();
  const hasAllowedRole = Boolean(user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user && !hasAllowedRole) {
      toast.error("Unauthorized access", {
        description: "You do not have permission to view this module."
      });
      router.replace("/");
    }
  }, [user, isAuthenticated, hasHydrated, hasAllowedRole, router]);

  if (!hasHydrated || !hasAllowedRole) {
    return null;
  }

  return <>{children}</>;
}
