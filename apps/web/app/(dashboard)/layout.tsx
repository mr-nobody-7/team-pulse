"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRole } from "@/hooks/use-role";
import type { UserRole } from "@/hooks/use-role";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { role } = useRole();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userRole={role as UserRole | undefined}
        userName={user?.name}
        userEmail={user?.email}
      />
      <div className="flex flex-1 flex-col pl-64">
        <Navbar
          userName={user?.name}
          userEmail={user?.email}
          onLogout={logout}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
