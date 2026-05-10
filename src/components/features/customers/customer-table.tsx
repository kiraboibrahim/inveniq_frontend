"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockCustomers } from "@/services/mock-data";
import { UserCircle2, Mail } from "lucide-react";
import { useInventoryStore } from "@/store/inventory-store";

export function CustomerTable() {
  const { openCustomerDrawer } = useInventoryStore();

  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-bg-elevated border-b border-border-strong">
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="text-text-secondary h-12 w-[350px]">Company Name</TableHead>
            <TableHead className="text-text-secondary h-12">Contact Person</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Lifetime Value</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Outstanding Bal</TableHead>
            <TableHead className="text-text-secondary h-12 text-right">Last Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCustomers.map((customer) => (
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
                    <p className="text-xs text-text-tertiary font-mono">{customer.id.toUpperCase()}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-text-primary font-medium">{customer.contactPerson}</span>
                  <span className="text-sm text-text-secondary flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    {customer.email}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-right font-mono text-text-primary font-medium">
                {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(customer.lifetimeValue)}
              </TableCell>
              <TableCell className="py-4 text-right font-mono">
                {customer.outstandingBalance > 0 ? (
                  <span className="text-danger-text font-medium">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(customer.outstandingBalance)}
                  </span>
                ) : (
                  <span className="text-text-secondary">Ugx 0</span>
                )}
              </TableCell>
              <TableCell className="py-4 text-right text-text-secondary text-sm">
                {new Date(customer.lastOrderDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
