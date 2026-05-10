"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventory-store";

const branches = [
  { id: "main", name: "Main Branch", location: "Kampala", revenue: 84000000, trend: 12.5, stockValue: 120000000, activeAlerts: 3 },
  { id: "entebbe", name: "Entebbe Branch", location: "Entebbe", revenue: 42000000, trend: -4.2, stockValue: 65000000, activeAlerts: 8 },
  { id: "jinja", name: "Jinja Branch", location: "Jinja", revenue: 28000000, trend: 5.1, stockValue: 40000000, activeAlerts: 1 },
];

export function BranchKpiTable() {
  const { openBranchDrawer } = useInventoryStore();

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-elevated border-b border-border-strong">
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="text-text-secondary h-12 w-[300px]">Branch Name</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Revenue (MTD)</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Trend</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Stock Value</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Active Alerts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => {
            const isPositive = branch.trend > 0;
            return (
              <TableRow
                key={branch.id}
                className="border-b border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors"
                onClick={() => openBranchDrawer(branch.id)}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent-muted text-accent flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{branch.name}</p>
                      <p className="text-xs text-text-tertiary">{branch.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right font-mono text-text-primary">
                  {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(branch.revenue)}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className={cn(
                    "inline-flex items-center justify-end gap-1 font-medium",
                    isPositive ? "text-success-text" : "text-danger-text"
                  )}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(branch.trend)}%
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right font-mono text-text-secondary">
                  {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(branch.stockValue)}
                </TableCell>
                <TableCell className="py-4 text-right">
                  {branch.activeAlerts > 0 ? (
                    <Badge variant="outline" className={cn(
                      "border-transparent font-medium",
                      branch.activeAlerts > 5 ? "bg-danger-muted text-danger-text" : "bg-warning-muted text-warning-text"
                    )}>
                      {branch.activeAlerts} Alerts
                    </Badge>
                  ) : (
                    <span className="text-text-tertiary">None</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
