"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Chatbot } from "./chatbot";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { branchService } from "@/services/api";
import { BranchForm } from "@/components/features/multi-shop/branch-form";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchService.getBranches(),
    retry: 1,
  });

  useEffect(() => {
    const mountTimer = setTimeout(() => setIsMounted(true), 0);
    const stored = localStorage.getItem("aims-sidebar-collapsed");
    let storedTimer: number | undefined;
    if (stored) {
      storedTimer = window.setTimeout(() => setIsSidebarCollapsed(stored === "true"), 0);
    }

    return () => {
      clearTimeout(mountTimer);
      if (storedTimer) clearTimeout(storedTimer);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("aims-sidebar-collapsed", String(newState));
  };

  if (!isMounted) return null;

  if (isLoadingBranches) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-base text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-text-secondary">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const showOnboarding = branches && branches.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto">
          <div className="content-grid">
            {children}
          </div>
        </main>
      </div>
      <Chatbot />
      {showOnboarding && (
        <BranchForm open={true} onOpenChange={() => {}} preventClose={true} />
      )}
    </div>
  );
}
