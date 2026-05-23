"use client";

import {
  BarChart2,
  CalendarDays,
  CalendarRange,
  CheckSquare,
  LayoutDashboard,
  Logs,
  PlusCircle,
  Settings,
  Shield,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Team",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["USER", "MANAGER", "ADMIN", "OWNER"],
      },
      {
        href: "/calendar",
        label: "Team Calendar",
        icon: CalendarRange,
        roles: ["USER", "MANAGER", "ADMIN", "OWNER"],
      },
      {
        href: "/reports",
        label: "Reports",
        icon: BarChart2,
        roles: ["MANAGER", "ADMIN", "OWNER"],
      },
    ],
  },
  {
    label: "My Leave",
    items: [
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
        roles: ["ADMIN", "OWNER"],
      },
      {
        href: "/leaves/apply",
        label: "Apply Leave",
        icon: PlusCircle,
        roles: ["USER", "MANAGER", "ADMIN", "OWNER"],
      },
      {
        href: "/leaves/approvals",
        label: "Approvals",
        icon: CheckSquare,
        roles: ["MANAGER", "ADMIN", "OWNER"],
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        href: "/teams",
        label: "Teams",
        icon: Shield,
        roles: ["ADMIN", "OWNER"],
      },
      {
        href: "/users",
        label: "Users",
        icon: UserCog,
        roles: ["ADMIN", "OWNER"],
      },
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        roles: ["ADMIN", "OWNER"],
      },
      {
        href: "/audit-logs",
        label: "Audit Logs",
        icon: Logs,
        roles: ["ADMIN", "OWNER"],
      },
    ],
  },
];

interface SidebarProps {
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar({
  userRole,
  userName,
  userEmail,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform duration-200 ease-out md:z-40",
        "border-r border-[--tf-border-soft] bg-[--tf-surface]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      )}
    >
      {/* ── Logo ──────────────────────────────────────────── */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[--tf-border-soft] px-5">
        <Image
          src="/brand/mark-64.svg"
          alt="TeamFore"
          width={28}
          height={28}
          className="shrink-0"
          priority
        />
        <span
          className="text-[14px] font-semibold text-foreground"
          style={{ letterSpacing: "-0.01em" }}
        >
          TeamFore
        </span>

        {onMobileClose && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-[--tf-text-3] transition-colors hover:bg-[--tf-surface-2] hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !userRole || item.roles.includes(userRole),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-1">
              <p
                className="px-5 pb-1.5 pt-3 text-[10px] font-normal tracking-[0.16em] uppercase text-[--tf-text-3]"
                style={{ fontFamily: "var(--tf-font-mono)" }}
              >
                {group.label}
              </p>
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "relative mx-2 flex h-9 items-center gap-[11px] rounded-lg px-2.5 text-[13.5px] transition-all duration-100",
                      isActive
                        ? "bg-[--tf-iris-bg] text-foreground"
                        : "text-[--tf-text-2] hover:bg-[--tf-surface-2] hover:text-foreground",
                    )}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <span
                        className="absolute inset-y-2 left-0 w-[2.5px] rounded-full bg-[--tf-iris]"
                        aria-hidden="true"
                      />
                    )}
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-foreground" : "text-[--tf-text-3]",
                      )}
                      strokeWidth={1.7}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── User footer ───────────────────────────────────── */}
      {userName && (
        <div className="shrink-0 border-t border-[--tf-border-soft] px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11.5px] font-semibold text-white"
              style={{
                background:
                  "linear-gradient(160deg, oklch(0.70 0.17 285), oklch(0.55 0.18 300))",
              }}
            >
              {getInitials(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">
                {userName}
              </p>
              {userEmail && (
                <p className="truncate text-[11.5px] text-[--tf-text-3]">
                  {userEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
