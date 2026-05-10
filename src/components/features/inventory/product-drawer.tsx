"use client";

import { useInventoryStore } from "@/store/inventory-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { mockProducts } from "@/services/mock-data";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

const mockStockHistory = [
  { day: 1, stock: 50 }, { day: 5, stock: 48 }, { day: 10, stock: 40 },
  { day: 15, stock: 45 }, { day: 20, stock: 30 }, { day: 25, stock: 25 }, { day: 30, stock: 45 }
];

export function ProductDrawer() {
  const { isDrawerOpen, selectedProductId, closeDrawer } = useInventoryStore();

  const product = mockProducts.find(p => p.id === selectedProductId);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-border-subtle p-0 flex flex-col">
        {product ? (
          <>
            <SheetHeader className="p-6 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <SheetTitle className="text-xl font-medium text-text-primary">{product.name}</SheetTitle>
                  <SheetDescription className="text-text-secondary font-mono mt-1">
                    {product.sku}
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
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Current Stock</p>
                  <p className="text-2xl font-mono text-text-primary">{product.stockQty}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Unit Price</p>
                  <p className="text-2xl font-mono text-text-primary">
                    {new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(product.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Category</p>
                  <p className="text-base text-text-primary font-medium">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary mb-1">Low Stock Threshold</p>
                  <p className="text-base font-mono text-text-primary">{product.threshold}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-primary mb-4">30-Day Stock History</h4>
                <div className="h-[200px] w-full border border-border-subtle rounded-md p-4 bg-bg-elevated">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockStockHistory}>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                        labelStyle={{ color: 'var(--color-text-secondary)' }}
                      />
                      <Line type="stepAfter" dataKey="stock" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {product.expiryDate && (
                <div className="p-4 rounded-md border border-warning/20 bg-warning/5">
                  <p className="text-sm font-medium text-warning-text mb-1">Expiry Date</p>
                  <p className="text-text-primary">{new Date(product.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border-subtle flex gap-3 mt-auto">
              <Button className="flex-1 bg-accent hover:bg-accent-hover text-white">Create Purchase Order</Button>
            </div>
          </>
        ) : (
          <div className="p-6 flex items-center justify-center h-full text-text-secondary">
            Product not found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
