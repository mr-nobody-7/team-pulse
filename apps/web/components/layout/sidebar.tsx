"use client";

import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  LayoutDashboard,
  PlusCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/hooks/use-role";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["USER", "MANAGER", "ADMIN"],
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: CalendarRange,
    roles: ["USER", "MANAGER", "ADMIN"],
  },
  {
    href: "/leaves",
    label: "My Leaves",
    icon: CalendarDays,
    roles: ["USER"],
  },
  {
    href: "/leaves",
    label: "Team Leaves",
    icon: Users,
    roles: ["MANAGER"],
  },
  {
    href: "/leaves",
    label: "All Leaves",
    icon: CalendarDays,
    roles: ["ADMIN"],
  },
  {
    href: "/leaves/apply",
    label: "Apply Leave",
    icon: PlusCircle,
    roles: ["USER", "MANAGER", "ADMIN"],
  },
  {
    href: "/leaves/approvals",
    label: "Approvals",
    icon: CheckSquare,
    roles: ["MANAGER", "ADMIN"],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const filtered = navItems.filter(
    (item) => !userRole || item.roles.includes(userRole),
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">T</span>
        </div>
        <span className="text-lg font-semibold tracking-tight">Team Pulse</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filtered.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(item.href + "/"));
            return (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info at bottom */}
      {userName && (
        <div className="border-t p-4">
          <p className="truncate text-sm font-medium">{userName}</p>
          {userEmail && (
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          )}
        </div>
      )}
    </aside>
  );
}
