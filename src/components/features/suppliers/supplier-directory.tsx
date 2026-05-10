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
import { mockSuppliers } from "@/services/mock-data";
import { Building2, Phone, Mail, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryStore } from "@/store/inventory-store";

export function SupplierDirectory() {
  const { openSupplierDrawer } = useInventoryStore();

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-elevated border-b border-border-strong">
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="text-text-secondary h-12 w-[350px]">Supplier Details</TableHead>
            <TableHead className="text-text-secondary h-12">Contact Person</TableHead>
            <TableHead className="text-text-secondary h-12">Contact Info</TableHead>
            <TableHead className="text-text-secondary h-12 text-center">Fulfillment Rating</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockSuppliers.map((supplier) => (
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
                    <p className="text-xs text-text-tertiary font-mono">{supplier.id.toUpperCase()}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 text-text-secondary">
                {supplier.contactPerson}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-text-tertiary" />
                    {supplier.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-text-tertiary" />
                    {supplier.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-muted text-warning-text font-medium text-sm">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {supplier.fulfillmentRating}%
                </div>
              </TableCell>
              <TableCell className="py-4 text-right">
                <Badge variant="outline" className={cn(
                  "border-transparent font-medium",
                  supplier.status === "active" ? "bg-success-muted text-success-text" : "bg-bg-elevated text-text-tertiary"
                )}>
                  {supplier.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
