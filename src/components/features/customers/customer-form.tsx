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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { toast } from "sonner";

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerForm({ open, onOpenChange }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: stakeholderService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onOpenChange(false);
      toast.success("Customer created successfully");
    },
    onError: () => {
      toast.error("Failed to create customer");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    createMutation.mutate({
      companyName: formData.get("companyName") as string,
      contactPerson: formData.get("customerContact") as string,
      email: formData.get("customerEmail") as string,
      lifetimeValue: 0,
      outstandingBalance: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-bg-surface border-border-subtle text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-text-secondary">Company Name</Label>
            <Input id="companyName" name="companyName" placeholder="e.g. Quality Supermarket" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerContact" className="text-text-secondary">Contact Person</Label>
              <Input id="customerContact" name="customerContact" placeholder="Full name" required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-text-secondary">Phone Number</Label>
              <Input id="customerPhone" name="customerPhone" placeholder="+256 700 000000"
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail" className="text-text-secondary">Email Address</Label>
            <Input id="customerEmail" name="customerEmail" type="email" placeholder="procurement@company.co.ug" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditLimit" className="text-text-secondary">Credit Limit (UGX)</Label>
              <Input id="creditLimit" name="creditLimit" type="number" placeholder="5000000"
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms" className="text-text-secondary">Payment Terms (days)</Label>
              <Input id="paymentTerms" name="paymentTerms" type="number" placeholder="30"
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent font-mono" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-accent hover:bg-accent-hover text-white">
              {isLoading || createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
