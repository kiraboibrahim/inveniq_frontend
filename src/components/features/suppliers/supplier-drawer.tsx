"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useInventoryStore } from "@/store/inventory-store";
import { mockSuppliers } from "@/services/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Star, Pencil, Trash2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function SupplierDrawer() {
  const { isSupplierDrawerOpen, selectedSupplierId, closeSupplierDrawer } = useInventoryStore();

  const supplier = mockSuppliers.find((s) => s.id === selectedSupplierId);

  return (
    <Sheet open={isSupplierDrawerOpen} onOpenChange={(open) => !open && closeSupplierDrawer()}>
      <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-border-subtle p-0 flex flex-col">
        {supplier ? (
          <>
            <SheetHeader className="p-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-xl font-medium text-text-primary">{supplier.name}</SheetTitle>
                  <SheetDescription className="text-text-secondary font-mono mt-1">
                    {supplier.id.toUpperCase()}
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
              {/* Status & Rating */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Status</p>
                  <Badge variant="outline" className={cn(
                    "border-transparent font-medium",
                    supplier.status === "active" ? "bg-success-muted text-success-text" : "bg-bg-elevated text-text-tertiary"
                  )}>
                    {supplier.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Fulfillment Rating</p>
                  <div className="flex items-center gap-1.5 text-warning-text font-medium text-lg">
                    <Star className="w-4 h-4 fill-current" />
                    {supplier.fulfillmentRating}%
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Contact Person</p>
                  <p className="text-base text-text-primary font-medium">{supplier.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Total Orders</p>
                  <p className="text-2xl font-mono text-text-primary">148</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-4">Contact Information</h4>
                <div className="rounded-md border border-border-subtle bg-bg-elevated divide-y divide-border-subtle">
                  <div className="flex items-center gap-3 p-4">
                    <Mail className="w-4 h-4 text-text-tertiary" />
                    <div>
                      <p className="text-xs text-text-tertiary">Email</p>
                      <a href={`mailto:${supplier.email}`} className="text-accent hover:underline text-sm">{supplier.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4">
                    <Phone className="w-4 h-4 text-text-tertiary" />
                    <div>
                      <p className="text-xs text-text-tertiary">Phone</p>
                      <p className="text-text-primary text-sm">{supplier.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Supplied */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-4">Products Supplied</h4>
                <div className="rounded-md border border-border-subtle bg-bg-elevated divide-y divide-border-subtle">
                  {["Maize Flour 2kg", "Cooking Oil 1L", "Washing Soap Box"].map((product) => (
                    <div key={product} className="flex items-center gap-3 p-4">
                      <Package className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-primary text-sm">{product}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-subtle flex gap-3 mt-auto">
              <Button className="flex-1 bg-accent hover:bg-accent-hover text-white">Create Purchase Order</Button>
            </div>
          </>
        ) : (
          <div className="p-6 flex items-center justify-center h-full text-text-secondary">
            Supplier not found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
