"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Store, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventory-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "@/services/api";
import { toast } from "sonner";
import { Branch } from "@/types";

interface BranchKpiTableProps {
  onEdit: (branch: Branch) => void;
}

export function BranchKpiTable({ onEdit }: BranchKpiTableProps) {
  const { openBranchDrawer } = useInventoryStore();
  const queryClient = useQueryClient();
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branchKpis"],
    queryFn: branchService.getBranches,
  });

  const deleteMutation = useMutation({
    mutationFn: branchService.deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchKpis"] });
      toast.success("Branch deleted successfully");
      setIsDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to delete branch");
      setIsDeletingId(null);
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete the branch "${name}"?`)) {
      setIsDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-elevated border-b border-border-strong">
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="text-text-secondary h-12 w-[250px]">Branch Name</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Revenue (MTD)</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Trend</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Stock Value</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Active Alerts</TableHead>
            <TableHead className="text-text-secondary h-12 text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-text-secondary">Loading branches...</TableCell>
            </TableRow>
          ) : branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-text-secondary">No branches found.</TableCell>
            </TableRow>
          ) : branches.map((branch) => {
            const isPositive = branch.trend > 0;
            return (
              <TableRow
                key={branch.id}
                className="border-b border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors"
                onClick={() => openBranchDrawer(String(branch.id))}
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
                  {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(branch.revenue))}
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
                  {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(branch.stockValue))}
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
                    <Badge variant="outline" className="border-transparent font-medium bg-success-muted text-success-text">
                      0 Alerts
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                      onClick={() => onEdit(branch)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger-text hover:text-danger hover:bg-danger/10"
                      onClick={() => handleDelete(branch.id, branch.name)}
                      disabled={isDeletingId === branch.id}
                    >
                      {isDeletingId === branch.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-danger" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
