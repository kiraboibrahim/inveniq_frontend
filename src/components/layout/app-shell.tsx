"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Chatbot } from "./chatbot";
import { useState, useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
    </div>
  );
}
