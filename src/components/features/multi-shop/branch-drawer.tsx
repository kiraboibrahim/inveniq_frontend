"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useInventoryStore } from "@/store/inventory-store";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const branches: Record<string, {
  name: string; location: string; revenue: number; trend: number;
  stockValue: number; activeAlerts: number; manager: string;
}> = {
  main:    { name: "Main Branch",    location: "Kampala", revenue: 84000000, trend: 12.5,  stockValue: 120000000, activeAlerts: 3, manager: "Bushira Admin"    },
  entebbe: { name: "Entebbe Branch", location: "Entebbe", revenue: 42000000, trend: -4.2,  stockValue: 65000000,  activeAlerts: 8, manager: "Sarah Namukasa"   },
  jinja:   { name: "Jinja Branch",   location: "Jinja",   revenue: 28000000, trend: 5.1,   stockValue: 40000000,  activeAlerts: 1, manager: "Peter Kiggundu"   },
};

export function BranchDrawer() {
  const { isBranchDrawerOpen, selectedBranchId, closeBranchDrawer } = useInventoryStore();

  const branch = selectedBranchId ? branches[selectedBranchId] : null;

  return (
    <Sheet open={isBranchDrawerOpen} onOpenChange={(open) => !open && closeBranchDrawer()}>
      <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-border-subtle p-0 flex flex-col">
        {branch ? (
          <>
            <SheetHeader className="p-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-xl font-medium text-text-primary">{branch.name}</SheetTitle>
                  <SheetDescription className="text-text-secondary mt-1">
                    {branch.location} · Manager: {branch.manager}
                  </SheetDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-text-primary">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-danger-text hover:text-danger hover:bg-danger/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              {/* KPI Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Revenue MTD</p>
                  <p className="text-2xl font-mono text-success-text">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", notation: "compact", maximumFractionDigits: 1 }).format(branch.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Trend</p>
                  <div className={cn("flex items-center gap-1.5 font-medium text-2xl font-mono", branch.trend > 0 ? "text-success-text" : "text-danger-text")}>
                    {branch.trend > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {Math.abs(branch.trend)}%
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Stock Value</p>
                  <p className="text-2xl font-mono text-text-primary">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", notation: "compact", maximumFractionDigits: 1 }).format(branch.stockValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Active Alerts</p>
                  <p className={cn("text-2xl font-mono", branch.activeAlerts > 5 ? "text-danger-text" : "text-warning-text")}>
                    {branch.activeAlerts}
                  </p>
                </div>
              </div>

              {/* Active Alerts */}
              {branch.activeAlerts > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-4">Active Alerts</h4>
                  <div className="rounded-md border border-border-subtle bg-bg-elevated divide-y divide-border-subtle">
                    {["Low stock: Cooking Oil 1L", "Expiry warning: Maize Flour 2kg"].slice(0, Math.min(branch.activeAlerts, 2)).map((alert, i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <AlertTriangle className="w-4 h-4 text-warning-text shrink-0" />
                        <span className="text-text-secondary text-sm">{alert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Items */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-4">Top Selling Items</h4>
                <div className="rounded-md border border-border-subtle bg-bg-elevated divide-y divide-border-subtle">
                  {["Washing Soap Box", "Maize Flour 2kg", "Cooking Oil 1L"].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-4">
                      <Package className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-primary text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex gap-3 mt-auto">
              <Button className="flex-1 bg-accent hover:bg-accent-hover text-white">View Full Report</Button>
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
