"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useInventoryStore } from "@/store/inventory-store";
import { mockCustomers } from "@/services/mock-data";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Mail, TrendingUp, AlertCircle, ShoppingCart } from "lucide-react";

export function CustomerDrawer() {
  const { isCustomerDrawerOpen, selectedCustomerId, closeCustomerDrawer } = useInventoryStore();

  const customer = mockCustomers.find((c) => c.id === selectedCustomerId);

  return (
    <Sheet open={isCustomerDrawerOpen} onOpenChange={(open) => !open && closeCustomerDrawer()}>
      <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-border-subtle p-0 flex flex-col">
        {customer ? (
          <>
            <SheetHeader className="p-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-xl font-medium text-text-primary">{customer.companyName}</SheetTitle>
                  <SheetDescription className="text-text-secondary mt-1">
                    {customer.contactPerson} · {customer.id.toUpperCase()}
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
              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-tertiary mb-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Lifetime Value</p>
                  <p className="text-2xl font-mono text-success-text">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", notation: "compact", maximumFractionDigits: 1 }).format(customer.lifetimeValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Outstanding</p>
                  <p className={`text-2xl font-mono ${customer.outstandingBalance > 0 ? "text-danger-text" : "text-text-secondary"}`}>
                    {customer.outstandingBalance > 0
                      ? new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", notation: "compact", maximumFractionDigits: 1 }).format(customer.outstandingBalance)
                      : "None"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-accent hover:underline text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {customer.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Last Order</p>
                  <p className="text-base text-text-primary font-medium">
                    {new Date(customer.lastOrderDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-4">Recent Orders</h4>
                <div className="rounded-md border border-border-subtle bg-bg-elevated divide-y divide-border-subtle">
                  {[
                    { id: "ORD-001", amount: 1250000, date: "10 May 2026" },
                    { id: "ORD-002", amount: 3800000, date: "2 May 2026" },
                    { id: "ORD-003", amount: 780000, date: "24 Apr 2026" },
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-4 h-4 text-text-tertiary" />
                        <div>
                          <p className="text-text-primary font-mono text-sm">{order.id}</p>
                          <p className="text-text-tertiary text-xs">{order.date}</p>
                        </div>
                      </div>
                      <span className="text-text-primary font-medium text-sm">
                        {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(order.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex gap-3 mt-auto">
              <Button className="flex-1 bg-accent hover:bg-accent-hover text-white">Create Invoice</Button>
            </div>
          </>
        ) : (
          <div className="p-6 flex items-center justify-center h-full text-text-secondary">
            Customer not found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
