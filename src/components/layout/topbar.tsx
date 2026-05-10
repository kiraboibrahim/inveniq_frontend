"use client";

import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useBranchStore, BranchId } from "@/store/branch-store";
import { useAuthStore } from "@/store/auth-store";
import { clearAuthCookie } from "@/lib/auth-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function Topbar({ toggleSidebar, isSidebarCollapsed }: TopbarProps) {
  const { activeBranch, setActiveBranch } = useBranchStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    clearAuthCookie();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border-subtle bg-bg-surface flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <select 
          className="hidden sm:block h-9 px-3 bg-bg-elevated border border-border-subtle rounded-md text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
          value={activeBranch}
          onChange={(e) => setActiveBranch(e.target.value as BranchId)}
        >
          <option value="all">All Branches</option>
          <option value="main">Main Branch</option>
          <option value="entebbe">Entebbe Branch</option>
        </select>

        <Button variant="ghost" size="icon" className="relative text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-bg-surface"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full bg-accent-muted text-accent-text border border-accent/20 hover:bg-accent/20">
              <User className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-bg-surface border-border-subtle text-text-primary">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "My Account"}</p>
                <p className="text-xs leading-none text-text-secondary">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem className="focus:bg-bg-elevated focus:text-text-primary cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-bg-elevated focus:text-text-primary cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem 
              className="focus:bg-danger-muted focus:text-danger-text cursor-pointer text-danger-text"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
