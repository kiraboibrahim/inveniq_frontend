"use client";

import { useInventoryStore } from "@/store/inventory-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProductForm() {
  const { isAddProductOpen, setAddProductOpen } = useInventoryStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddProductOpen(false);
  };

  return (
    <Dialog open={isAddProductOpen} onOpenChange={setAddProductOpen}>
      <DialogContent className="sm:max-w-[500px] bg-bg-surface border-border-subtle text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-text-secondary">SKU / Barcode</Label>
              <Input id="sku" placeholder="Auto-generated or scan" className="font-mono bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-text-secondary">Category</Label>
              <Input id="category" placeholder="e.g. Groceries" className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-text-secondary">Product Name</Label>
            <Input id="name" placeholder="e.g. Maize Flour 2kg" className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-text-secondary">Unit Price (UGX)</Label>
              <Input id="price" type="number" placeholder="0" className="font-mono bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-text-secondary">Low Stock Threshold</Label>
              <Input id="threshold" type="number" placeholder="10" className="font-mono bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setAddProductOpen(false)} className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent-hover text-white">
              Save Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
