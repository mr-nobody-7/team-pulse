import { useAuth } from "@/contexts/auth-context";
import type { SafeUser } from "@/types/api";

export type UserRole = SafeUser["role"];

interface UseRoleReturn {
  role: UserRole | null;
  isUser: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  /** Manager OR Admin — can approve / reject leave */
  canApprove: boolean;
  /** Admin only — can access workspace-wide reports */
  isWorkspaceAdmin: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

export function useRole(): UseRoleReturn {
  const { user } = useAuth();
  const role = (user?.role as UserRole) ?? null;
  const isAdmin = role === "ADMIN" || role === "OWNER";

  return {
    role,
    isUser: role === "USER",
    isManager: role === "MANAGER",
    isAdmin,
    isOwner: role === "OWNER",
    canApprove: role === "MANAGER" || isAdmin,
    isWorkspaceAdmin: isAdmin,
    hasRole: (roles) => role !== null && roles.includes(role),
  };
}
