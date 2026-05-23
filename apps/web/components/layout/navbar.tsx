"use client";

import { LogOut, Menu, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => Promise<void>;
  onMenuClick?: () => void;
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

export function Navbar({
  userName,
  userEmail,
  onLogout,
  onMenuClick,
}: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await onLogout?.();
      router.push("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between px-6"
      style={{
        background: "oklch(0.17 0.014 280 / 0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--tf-border-soft)",
      }}
    >
      {/* Left — mobile menu trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[--tf-text-3] transition-colors hover:bg-[--tf-surface-2] hover:text-foreground md:hidden"
        >
          <Menu className="h-4 w-4" strokeWidth={1.7} />
        </button>
      </div>

      {/* Right — user menu */}
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--tf-iris]"
              style={{
                background:
                  "linear-gradient(160deg, oklch(0.70 0.17 285), oklch(0.55 0.18 300))",
              }}
            >
              <span className="text-[11px] font-semibold text-white">
                {getInitials(userName)}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56"
            style={{
              background: "var(--tf-surface)",
              border: "1px solid var(--tf-border)",
            }}
          >
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <p className="text-[13px] font-medium text-foreground">
                  {userName}
                </p>
                <p className="text-[12px] text-[--tf-text-3]">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[--tf-border-soft]" />
            <DropdownMenuItem
              onClick={() => router.push("/settings/profile")}
              className="gap-2.5 text-[13px] text-[--tf-text-2] focus:bg-[--tf-surface-2] focus:text-foreground"
            >
              <User className="h-3.5 w-3.5" strokeWidth={1.7} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="gap-2.5 text-[13px] text-[--tf-text-2] focus:bg-[--tf-surface-2] focus:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" strokeWidth={1.7} />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[--tf-border-soft]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2.5 text-[13px] text-[--tf-coral] focus:bg-[--tf-coral-bg] focus:text-[--tf-coral]"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.7} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
