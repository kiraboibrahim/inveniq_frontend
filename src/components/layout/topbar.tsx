"use client";

import { Menu, Bell, User, Plus, Check, AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useBranchStore } from "@/store/branch-store";
import { useAuthStore } from "@/store/auth-store";
import { clearAuthCookie } from "@/lib/auth-utils";
import { CustomSelect } from "@/components/ui/custom-select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService, alertService } from "@/services/api";
import { Alert } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TopbarProps {
    toggleSidebar: () => void;
    isSidebarCollapsed: boolean;
}

// ── Severity config ──────────────────────────────────────────────
const SEVERITY = {
    critical: {
        icon: ShieldAlert,
        dot: "bg-danger",
        text: "text-danger-text",
        bg: "bg-danger-muted/20",
        border: "border-danger/20",
    },
    warning: {
        icon: AlertTriangle,
        dot: "bg-warning",
        text: "text-warning-text",
        bg: "bg-warning-muted/20",
        border: "border-warning/20",
    },
    info: {
        icon: Info,
        dot: "bg-accent",
        text: "text-accent-text",
        bg: "bg-accent-muted/10",
        border: "border-accent/20",
    },
} as const;

// ── NotificationPanel ────────────────────────────────────────────
function NotificationPanel({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: alerts = [], isLoading } = useQuery<Alert[]>({
        queryKey: ["alerts"],
        queryFn: () => alertService.getAlerts(),
        refetchInterval: 60_000,
    });

    const resolveMutation = useMutation({
        mutationFn: (id: string | number) => alertService.resolveAlert(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
    });

    const unresolvedAlerts = alerts.filter((a) => !a.resolved).slice(0, 10);

    return (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[380px] bg-bg-surface border border-border-subtle rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-semibold text-text-primary">Notifications</span>
                    {unresolvedAlerts.length > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-danger text-white leading-none">
                            {unresolvedAlerts.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Alert list */}
            <div className="overflow-y-auto max-h-[420px]">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-5 h-5 border-b-2 border-accent rounded-full animate-spin" />
                    </div>
                ) : unresolvedAlerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success-muted/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-success-text" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">All caught up!</p>
                            <p className="text-xs text-text-tertiary mt-1">No active alerts at the moment.</p>
                        </div>
                    </div>
                ) : (
                    <ul className="divide-y divide-border-subtle/50">
                        {unresolvedAlerts.map((alert) => {
                            const cfg = SEVERITY[alert.severity] ?? SEVERITY.info;
                            const Icon = cfg.icon;
                            return (
                                <li
                                    key={alert.id}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-3.5 group transition-colors hover:bg-bg-elevated/50"
                                    )}
                                >
                                    {/* Icon */}
                                    <div className={cn("mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border", cfg.bg, cfg.border)}>
                                        <Icon className={cn("w-3.5 h-3.5", cfg.text)} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text-primary leading-snug truncate">
                                            {alert.title}
                                        </p>
                                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                                            {alert.description}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", cfg.text)}>
                                                {alert.severity}
                                            </span>
                                            {alert.branch_name && (
                                                <>
                                                    <span className="text-text-tertiary text-[10px]">·</span>
                                                    <span className="text-[10px] text-text-tertiary">{alert.branch_name}</span>
                                                </>
                                            )}
                                            <span className="text-text-tertiary text-[10px]">·</span>
                                            <span className="text-[10px] text-text-tertiary">
                                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Resolve button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            resolveMutation.mutate(alert.id);
                                        }}
                                        title="Mark as resolved"
                                        className="mt-0.5 p-1 rounded-md text-text-tertiary hover:text-success-text hover:bg-success-muted/20 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-border-subtle px-4 py-3">
                <button
                    onClick={() => { router.push("/alerts"); onClose(); }}
                    className="w-full text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                >
                    View all alerts →
                </button>
            </div>
        </div>
    );
}

// ── Topbar ───────────────────────────────────────────────────────
export function Topbar({ toggleSidebar }: TopbarProps) {
    const { activeBranch, setActiveBranch } = useBranchStore();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: branchService.getBranches,
    });

    // Badge count from unresolved alerts
    const { data: alerts = [] } = useQuery<Alert[]>({
        queryKey: ["alerts"],
        queryFn: () => alertService.getAlerts(),
        refetchInterval: 60_000,
    });
    const unreadCount = alerts.filter((a) => !a.resolved).length;

    // default to first fetched shop if none selected
    useEffect(() => {
        if (branches.length > 0 && (activeBranch === "all" || !branches.some(b => String(b.id) === activeBranch))) {
            setActiveBranch(String(branches[0].id));
        }
    }, [branches]);

    // Close panel on outside click
    useEffect(() => {
        if (!notifOpen) return;
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [notifOpen]);

    const handleLogout = () => {
        logout();
        clearAuthCookie();
        router.replace("/login");
    };

    return (
        <header className="h-16 border-b border-border-subtle bg-bg-surface/85 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-xl">
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex items-center gap-3">
                {/* Branch selector */}
                {branches.length > 0 ? (
                    <div className="hidden sm:block min-w-[150px]">
                        <CustomSelect
                            value={activeBranch}
                            onChange={setActiveBranch}
                            options={branches.map((branch) => ({
                                value: String(branch.id),
                                label: branch.name,
                            }))}
                        />
                    </div>
                ) : (
                    <Button size="sm" className="bg-accent hover:bg-accent-hover text-white rounded-xl" onClick={() => router.push("/multi-shop")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shop
                    </Button>
                )}

                {/* ── Notification Bell ─────────────────────────── */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => setNotifOpen((v) => !v)}
                        className={cn(
                            "relative h-9 w-9 flex items-center justify-center rounded-xl transition-colors",
                            notifOpen
                                ? "bg-bg-elevated text-text-primary"
                                : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                        )}
                        aria-label="Notifications"
                    >
                        <Bell className={cn("w-5 h-5", notifOpen && "fill-current opacity-80")} />

                        {/* Badge */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-danger text-white text-[10px] font-bold rounded-full px-0.5 leading-none border-2 border-bg-surface">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                        {/* Pulse for zero-count passive indicator */}
                        {unreadCount === 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-success rounded-full border-2 border-bg-surface" />
                        )}
                    </button>

                    {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
                </div>

                {/* ── Profile Dropdown ──────────────────────────── */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-9 w-9 rounded-xl bg-gradient-to-tr from-accent/20 to-info/20 text-accent-text border border-accent/30 hover:border-accent/60 transition-all flex items-center justify-center cursor-pointer shadow-sm relative group active:scale-95">
                            <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-surface" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-bg-surface border-border-subtle text-text-primary">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || "My Account"}</p>
                                <p className="text-xs leading-none text-text-secondary">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border-subtle" />
                        <DropdownMenuItem
                            className="focus:bg-bg-elevated focus:text-text-primary cursor-pointer"
                            onClick={() => router.push("/settings/profile")}
                        >
                            Profile
                        </DropdownMenuItem>
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
