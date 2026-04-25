import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export type StaffRole = "admin" | "editor" | "moderator";

export interface StaffUser {
  id: number;
  email: string | null;
  name: string | null;
  role: string;
}

/**
 * Hook for admin pages — returns staff user or redirects to login.
 */
export function useAdminAuth(options?: { requireRoles?: StaffRole[] }) {
  const [, navigate] = useLocation();
  const meQuery = trpc.admin.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = meQuery.data ?? null;
  const loading = meQuery.isLoading;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (options?.requireRoles && !options.requireRoles.includes(user.role as StaffRole)) {
      navigate("/admin");
    }
  }, [user, loading, navigate, options?.requireRoles?.join(",")]);

  return { user, loading };
}

export function roleLabel(role: string): string {
  switch (role) {
    case "admin": return "Yönetici";
    case "editor": return "Editör";
    case "moderator": return "Moderatör";
    default: return role;
  }
}

export function canAccess(userRole: string | undefined, requiredRoles: StaffRole[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole as StaffRole);
}
