"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCircle2, Mail, Pencil, Trash2 } from "lucide-react";
import { useInventoryStore } from "@/store/inventory-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Customer } from "@/types";

interface CustomerTableProps {
  data?: Customer[];
  isLoading?: boolean;
}

export function CustomerTable({ data = [], isLoading = false }: CustomerTableProps) {
  const queryClient = useQueryClient();
  const { openCustomerDrawer, setCustomerModalOpen } = useInventoryStore();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => stakeholderService.deleteCustomer(id),
    onSuccess: () => {
      toast.success("Customer profile deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete customer profile", { description: err.message });
    }
  });

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setCustomerModalOpen(true, customer);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading customers...</div>;
  }

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-elevated border-b border-border-strong">
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="text-text-secondary h-12 w-[300px]">Company Name</TableHead>
            <TableHead className="text-text-secondary h-12">Contact Person</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Lifetime Value</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Outstanding Bal</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Last Order</TableHead>
            <TableHead className="text-text-secondary h-12 text-center w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((customer) => (
            <TableRow
              key={customer.id}
              className="border-b border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors"
              onClick={() => openCustomerDrawer(customer.id)}
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent-muted text-accent flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{customer.companyName}</p>
                    <div className="flex items-center text-xs text-text-tertiary gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary font-medium">{customer.contactPerson}</TableCell>
              <TableCell className="text-right font-mono text-text-primary">
                {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(customer.lifetimeValue)}
              </TableCell>
              <TableCell className="text-right font-mono">
                <span className={customer.outstandingBalance > 0 ? "text-danger-text font-medium" : "text-text-tertiary"}>
                  {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(customer.outstandingBalance)}
                </span>
              </TableCell>
              <TableCell className="text-right text-text-secondary text-sm font-medium">
                {customer.lastOrderDate 
                  ? new Date(customer.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : "No orders yet"}
              </TableCell>
              <TableCell className="py-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleEdit(e, customer)}
                    className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-bg-muted rounded-lg"
                    title="Edit Customer"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(e, customer.id, customer.companyName)}
                    className="h-8 w-8 text-danger-text hover:text-danger hover:bg-danger/10 rounded-lg"
                    disabled={deleteMutation.isPending}
                    title="Delete Customer"
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
