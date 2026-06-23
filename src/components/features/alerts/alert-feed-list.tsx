"use client";

import { useState } from "react";
import { AlertTriangle, Info, Bell, CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertService } from "@/services/api";
import { useShopStore } from "@/store/branch-store";
import { toast } from "sonner";

type Severity = "all" | "critical" | "warning" | "info";
type StatusFilter = "active" | "resolved";

const SEV_STRIPE: Record<string, string> = {
    critical: "bg-danger",
    warning: "bg-warning",
    info: "bg-accent",
};

const SEV_ICON_WRAP: Record<string, string> = {
    critical: "bg-danger/10 border-danger/20 text-danger-text",
    warning: "bg-warning/10 border-warning/20 text-warning-text",
    info: "bg-accent/10 border-accent/20 text-accent-text",
};

const SEV_BADGE: Record<string, string> = {
    critical: "bg-danger/10 border-danger/20 text-danger-text",
    warning: "bg-warning/10 border-warning/20 text-warning-text",
    info: "bg-accent/10 border-accent/20 text-accent-text",
};

const SEV_CARD_BORDER: Record<string, string> = {
    critical: "border-danger/25 hover:border-danger/45",
    warning: "border-warning/25 hover:border-warning/45",
    info: "border-border-subtle hover:border-border-strong",
};

function SeverityIcon({ severity }: { severity: string }) {
    if (severity === "critical") return <AlertTriangle className="w-4 h-4" />;
    if (severity === "warning") return <Bell className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
}

export function AlertFeedList() {
    const { activeBranch } = useShopStore();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
    const [sevFilter, setSevFilter] = useState<Severity>("all");

    const { data: alerts = [], isLoading } = useQuery({
        queryKey: ["alerts", activeBranch],
        queryFn: () => alertService.getAlerts(activeBranch as string),
    });

    const resolveMutation = useMutation({
        mutationFn: (id: string | number) => alertService.resolveAlert(id),
        onSuccess: (data) => {
            toast.success(`"${data.title}" marked as resolved`);
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
        onError: () => toast.error("Failed to resolve alert"),
    });

    const filteredAlerts = alerts.filter((alert) => {
        const matchesStatus = statusFilter === "resolved" ? alert.resolved : !alert.resolved;
        const matchesSeverity = sevFilter === "all" || alert.severity === sevFilter;
        const matchesSearch =
            alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSeverity && matchesSearch;
    });

    const handleResolveAll = () => {
        const active = filteredAlerts.filter((a) => !a.resolved);
        if (!active.length) return;
        const promise = Promise.all(active.map((a) => alertService.resolveAlert(a.id)));
        toast.promise(promise, {
            loading: "Resolving alerts...",
            success: () => {
                queryClient.invalidateQueries({ queryKey: ["alerts"] });
                return "All visible alerts marked as resolved";
            },
            error: "Failed to resolve all alerts",
        });
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-border-subtle border-t-accent animate-spin" />
                <p className="text-sm text-text-secondary">Loading alerts...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Toolbar */}
            <div className="w-full flex flex-wrap items-center gap-3 p-3 bg-bg-surface border border-border-subtle rounded-xl">

                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search alerts..."
                        className={cn(
                            "w-full h-[34px] pl-9 pr-3",
                            "bg-bg-elevated border border-border-subtle rounded-lg",
                            "text-sm text-text-primary placeholder:text-text-tertiary",
                            "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15",
                            "transition-colors duration-150"
                        )}
                    />
                </div>

                {/* Status tabs */}
                <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-lg p-0.5 gap-0.5">
                    {(["active", "resolved"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "h-[28px] px-3 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer",
                                statusFilter === s
                                    ? "bg-bg-muted text-text-primary"
                                    : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Severity tabs */}
                <div className="flex items-center bg-bg-elevated border border-border-subtle rounded-lg p-0.5 gap-0.5">
                    {(["all", "critical", "warning", "info"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSevFilter(s)}
                            className={cn(
                                "h-[28px] px-3 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer flex items-center gap-1.5",
                                sevFilter === s
                                    ? "bg-bg-muted text-text-primary"
                                    : "text-text-secondary hover:text-text-primary"
                            )}
                        >
                            {s !== "all" && (
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    s === "critical" ? "bg-danger" :
                                        s === "warning" ? "bg-warning" : "bg-accent"
                                )} />
                            )}
                            {s}
                        </button>
                    ))}
                </div>

                {/* Resolve all */}
                {statusFilter === "active" && filteredAlerts.length > 0 && (
                    <Button
                        onClick={handleResolveAll}
                        size="sm"
                        className="h-[34px] px-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Resolve all
                    </Button>
                )}
            </div>

            {/* Feed */}
            <div className="w-full flex flex-col gap-2">
                {filteredAlerts.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center py-16 gap-3 bg-bg-surface border border-border-subtle rounded-xl">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-bg-elevated border border-border-subtle">
                            <ShieldCheck className="w-5 h-5 text-text-tertiary" />
                        </div>
                        <p className="text-sm font-semibold text-text-primary">No alerts found</p>
                        <p className="text-xs text-text-secondary text-center max-w-xs leading-relaxed">
                            {searchTerm
                                ? "No alerts match your search. Try a different keyword."
                                : `No ${statusFilter}${sevFilter !== "all" ? ` ${sevFilter}` : ""} alerts right now.`}
                        </p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={cn(
                                "w-full flex items-stretch bg-bg-surface border rounded-xl overflow-hidden transition-colors duration-150",
                                SEV_CARD_BORDER[alert.severity] ?? "border-border-subtle hover:border-border-strong"
                            )}
                        >
                            {/* Severity stripe */}
                            <div className={cn("w-[3px] shrink-0", SEV_STRIPE[alert.severity] ?? "bg-accent")} />

                            {/* Body */}
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 min-w-0">
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-lg border shrink-0",
                                    SEV_ICON_WRAP[alert.severity]
                                )}>
                                    <SeverityIcon severity={alert.severity} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                        <span className="text-sm font-semibold text-text-primary truncate">
                                            {alert.title}
                                        </span>
                                        <span className={cn(
                                            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border",
                                            SEV_BADGE[alert.severity]
                                        )}>
                                            {alert.severity}
                                        </span>
                                        {alert.branch_name && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-bg-elevated border border-border-subtle text-text-secondary">
                                                {alert.branch_name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed truncate">
                                        {alert.description}
                                    </p>
                                    <p className="text-[11px] font-mono text-text-tertiary mt-1">
                                        {new Date(alert.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                                        {" at "}
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="flex items-center px-4 border-l border-border-subtle shrink-0">
                                {alert.resolved ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success-text text-xs font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Resolved
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => resolveMutation.mutate(alert.id)}
                                        disabled={resolveMutation.isPending}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 rounded-lg border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-elevated hover:border-border-strong"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-success" />
                                        Resolve
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}