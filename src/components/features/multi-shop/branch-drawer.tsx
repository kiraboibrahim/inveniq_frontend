"use client";

import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useInventoryStore } from "@/store/inventory-store";
import { Store, TrendingUp, TrendingDown, AlertTriangle, Package, ShieldCheck, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { branchService } from "@/services/api";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export function BranchDrawer() {
    const { isBranchDrawerOpen, selectedBranchId, closeBranchDrawer } = useInventoryStore();

    const { data: branch, isLoading } = useQuery({
        queryKey: ["branch", selectedBranchId],
        queryFn: () => selectedBranchId ? branchService.getBranch(selectedBranchId) : null,
        enabled: !!selectedBranchId && isBranchDrawerOpen,
    });

    return (
        <Sheet open={isBranchDrawerOpen} onOpenChange={(open) => !open && closeBranchDrawer()}>
            <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-border-subtle p-0 flex flex-col">
                <VisuallyHidden.Root>
                    <SheetTitle>{branch?.name ?? "Branch Details"}</SheetTitle>
                    <SheetDescription>{branch?.location ?? "Branch information"}</SheetDescription>
                </VisuallyHidden.Root>

                {isLoading ? (
                    <div className="p-6 flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    </div>
                ) : branch ? (
                    <>
                        {/* Header Details */}
                        <div className="p-6 border-b border-border-subtle flex items-center gap-4 bg-bg-elevated/20">
                            <div className="h-12 w-12 rounded-xl bg-accent-muted text-accent flex items-center justify-center shrink-0 border border-accent/10">
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-semibold text-text-primary truncate">{branch.name}</p>
                                <p className="text-xs text-text-tertiary mt-1 truncate">
                                    {branch.location} · Manager: <span className="text-text-secondary font-medium">{branch.manager}</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-8">
                            {/* KPI Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Revenue MTD Card */}
                                <div className="bg-bg-elevated/40 border border-border-subtle p-4 rounded-xl hover:bg-bg-elevated/70 transition-all duration-200 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Revenue MTD</span>
                                        <div className="p-1.5 rounded-lg bg-success-muted/30 text-success-text">
                                            <Landmark className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-semibold font-mono text-success-text mt-1">
                                        {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", notation: "compact", maximumFractionDigits: 1 }).format(Number(branch.revenue))}
                                    </p>
                                </div>

                                {/* Trend Card */}
                                <div className="bg-bg-elevated/40 border border-border-subtle p-4 rounded-xl hover:bg-bg-elevated/70 transition-all duration-200 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Trend</span>
                                        <div className={cn("p-1.5 rounded-lg", branch.trend > 0 ? "bg-success-muted/30 text-success-text" : "bg-danger-muted/30 text-danger-text")}>
                                            {branch.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <div className={cn("flex items-baseline gap-1 font-semibold text-xl font-mono mt-1", branch.trend > 0 ? "text-success-text" : "text-danger-text")}>
                                        {branch.trend > 0 ? "+" : "-"}{Math.abs(branch.trend)}%
                                    </div>
                                </div>

                                {/* Stock Value Card */}
                                <div className="bg-bg-elevated/40 border border-border-subtle p-4 rounded-xl hover:bg-bg-elevated/70 transition-all duration-200 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Stock Value</span>
                                        <div className="p-1.5 rounded-lg bg-accent-muted text-accent">
                                            <Package className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-semibold font-mono text-text-primary mt-1">
                                        {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", notation: "compact", maximumFractionDigits: 1 }).format(Number(branch.stockValue))}
                                    </p>
                                </div>

                                {/* Active Alerts Card */}
                                <div className="bg-bg-elevated/40 border border-border-subtle p-4 rounded-xl hover:bg-bg-elevated/70 transition-all duration-200 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Active Alerts</span>
                                        <div className={cn("p-1.5 rounded-lg", branch.activeAlerts > 5 ? "bg-danger-muted/30 text-danger-text" : (branch.activeAlerts > 0 ? "bg-warning-muted/30 text-warning-text" : "bg-success-muted/30 text-success-text"))}>
                                            {branch.activeAlerts > 0 ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <p className={cn("text-xl font-semibold font-mono mt-1", branch.activeAlerts > 5 ? "text-danger-text" : (branch.activeAlerts > 0 ? "text-warning-text" : "text-success-text"))}>
                                        {branch.activeAlerts} {branch.activeAlerts === 1 ? "Alert" : "Alerts"}
                                    </p>
                                </div>
                            </div>

                            {/* Active Alerts List */}
                            <div>
                                <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Alert Status</h4>
                                {branch.activeAlerts > 0 ? (
                                    <div className="space-y-2.5">
                                        {branch.alerts.slice(0, Math.min(branch.activeAlerts, 3)).map((alert: { title: string; severity: string }, i: number) => {
                                            const isCritical = alert.severity?.toLowerCase() === "critical" || branch.activeAlerts > 5;
                                            return (
                                                <div key={i} className={cn(
                                                    "flex items-start gap-3 p-3.5 rounded-xl border transition-colors",
                                                    isCritical 
                                                        ? "bg-danger-muted/10 border-danger/20 text-danger-text" 
                                                        : "bg-warning-muted/10 border-warning/20 text-warning-text"
                                                )}>
                                                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-text-primary text-sm font-medium">{alert.title}</span>
                                                        <span className="text-[11px] text-text-tertiary uppercase tracking-wider font-semibold">
                                                            {isCritical ? "Critical Priority" : "Warning Alert"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3.5 p-4 rounded-xl border border-success/20 bg-success-muted/10 text-success-text">
                                        <ShieldCheck className="w-5 h-5 shrink-0" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-text-primary text-sm font-medium">No Active Alerts</span>
                                            <span className="text-xs text-text-tertiary">There are no pending alerts for this branch.</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Top Items */}
                            <div>
                                <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Top Selling Items</h4>
                                <div className="space-y-3">
                                    {branch.topItems.map((item: { name: string; units: number }, idx: number) => {
                                        const maxUnits = branch.topItems[0]?.units || 100;
                                        const percentage = Math.max(10, Math.round((item.units / maxUnits) * 100));
                                        return (
                                            <div key={item.name} className="flex flex-col gap-1.5 p-3 rounded-xl border border-border-subtle bg-bg-elevated/20 hover:bg-bg-elevated/40 transition-colors">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-xs font-mono font-bold text-accent bg-accent-muted w-5 h-5 rounded-md flex items-center justify-center">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-text-primary font-medium">{item.name}</span>
                                                    </div>
                                                    <span className="text-xs font-semibold font-mono text-text-secondary bg-bg-elevated px-2 py-0.5 rounded-full">
                                                        {item.units} sold
                                                    </span>
                                                </div>
                                                <div className="w-full bg-border-subtle h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-accent h-full rounded-full transition-all duration-500" 
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-6 flex items-center justify-center h-full text-text-secondary">
                        Branch not found.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}