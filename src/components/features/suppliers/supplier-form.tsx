"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierForm({ open, onOpenChange }: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-bg-surface border-border-subtle text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Add New Supplier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="supplierName" className="text-text-secondary">Company Name</Label>
            <Input id="supplierName" placeholder="e.g. Mukwano Industries" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-text-secondary">Contact Person</Label>
              <Input id="contactPerson" placeholder="Full name" required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-text-secondary">Phone Number</Label>
              <Input id="phone" placeholder="+256 700 000000" required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierEmail" className="text-text-secondary">Email Address</Label>
            <Input id="supplierEmail" type="email" placeholder="sales@company.com" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-text-secondary">Product Category</Label>
            <Input id="category" placeholder="e.g. Groceries, Hardware" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-hover text-white">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
