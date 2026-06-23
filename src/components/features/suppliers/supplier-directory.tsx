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
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, Star, Pencil, Trash2, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventory-store";
import { formatUgPhone } from "@/lib/phone-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { toast } from "sonner";
import type { Supplier } from "@/types";

interface SupplierDirectoryProps {
  data?: Supplier[];
  isLoading?: boolean;
  onEditSupplier: (supplier: Supplier) => void;
}

export function SupplierDirectory({ data = [], isLoading = false, onEditSupplier }: SupplierDirectoryProps) {
  const { openSupplierDrawer } = useInventoryStore();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => stakeholderService.deleteSupplier(String(id)),
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error("Failed to delete supplier", { description: msg });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: 'active' | 'inactive' }) =>
      stakeholderService.updateSupplier(String(id), { status }),
    onSuccess: (_, variables) => {
      toast.success(`Supplier ${variables.status === 'active' ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error("Failed to update status", { description: msg });
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string | number, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete supplier "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, id: string | number, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading suppliers...</div>;
  }

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-elevated border-b border-border-strong">
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="text-text-secondary h-12 w-[300px]">Supplier Details</TableHead>
            <TableHead className="text-text-secondary h-12">Contact Person</TableHead>
            <TableHead className="text-text-secondary h-12">Contact Info</TableHead>
            <TableHead className="text-text-secondary h-12 text-center">Fulfillment Rating</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Status</TableHead>
            <TableHead className="text-text-secondary h-12 text-center w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((supplier) => (
            <TableRow
              key={supplier.id}
              className="border-b border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors"
              onClick={() => openSupplierDrawer(supplier.id)}
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent-muted text-accent flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{supplier.name}</p>
                    <p className="text-xs text-text-tertiary font-mono uppercase tracking-wider">{supplier.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary font-medium">{supplier.contactPerson}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-xs text-text-secondary gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center text-xs text-text-tertiary gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {formatUgPhone(supplier.phone)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-1 text-sm font-mono font-medium text-text-primary">
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    {supplier.fulfillmentRating}%
                  </div>
                  <div className="w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        supplier.fulfillmentRating > 90 ? "bg-accent" : 
                        supplier.fulfillmentRating > 75 ? "bg-warning" : "bg-danger"
                      )} 
                      style={{ width: `${supplier.fulfillmentRating}%` }} 
                      aria-label={`Fulfillment rating: ${supplier.fulfillmentRating}%`}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={supplier.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                  {supplier.status}
                </Badge>
              </TableCell>
              <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-lg border animate-none transition-colors",
                      supplier.status === 'active' 
                        ? "text-success border-success/20 bg-success/5 hover:text-danger hover:bg-danger/10 hover:border-danger/30" 
                        : "text-text-tertiary border-border-subtle bg-bg-muted hover:text-success hover:bg-success/10 hover:border-success/30"
                    )}
                    onClick={(e) => handleToggleStatus(e, supplier.id, supplier.status)}
                    title={supplier.status === 'active' ? "Deactivate Supplier" : "Activate Supplier"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border-subtle animate-none"
                    onClick={() => onEditSupplier(supplier)}
                    title="Edit Supplier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-danger-text hover:text-danger hover:bg-danger/10 hover:border-danger/30 border border-border-subtle animate-none"
                    onClick={(e) => handleDelete(e, supplier.id, supplier.name)}
                    title="Delete Supplier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
