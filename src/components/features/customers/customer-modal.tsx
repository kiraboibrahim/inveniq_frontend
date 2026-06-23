"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Customer } from "@/types";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSuccess?: (newCustomer: Customer) => void;
}

export function CustomerModal({ isOpen, onClose, customer, onSuccess }: CustomerModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!customer;

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [outstandingBalance, setOutstandingBalance] = useState("0");

  useEffect(() => {
    if (customer) {
      setCompanyName(customer.companyName);
      setContactPerson(customer.contactPerson);
      setEmail(customer.email);
      setOutstandingBalance(String(customer.outstandingBalance));
    } else {
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setOutstandingBalance("0");
    }
  }, [customer, isOpen]);

  // Mutations
  const mutation = useMutation({
    mutationFn: (data: Partial<Customer>) => {
      if (isEditMode && customer) {
        return stakeholderService.updateCustomer(customer.id, data);
      }
      return stakeholderService.createCustomer(data);
    },
    onSuccess: (data: any) => {
      toast.success(
        isEditMode
          ? "Customer profile updated successfully"
          : "Customer profile created successfully"
      );
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (customer) {
        queryClient.invalidateQueries({ queryKey: ["customer", customer.id] });
      }
      if (onSuccess) {
        onSuccess(data);
      }
      onClose();
    },
    onError: (err: any) => {
      const detail = err.response?.data?.email?.[0] || err.message;
      toast.error(isEditMode ? "Failed to update profile" : "Failed to create profile", {
        description: detail,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload: Partial<Customer> = {
      companyName,
      contactPerson,
      email,
      outstandingBalance: Number(outstandingBalance) || 0,
    };

    if (!isEditMode) {
      payload.lifetimeValue = 0;
    }

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-bg-surface border border-border-subtle text-text-primary max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">
            {isEditMode ? "Edit Customer Details" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-cust-name">Company / Client Name <span className="text-danger-text">*</span></Label>
            <Input
              id="modal-cust-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-cust-contact">Contact Person <span className="text-danger-text">*</span></Label>
            <Input
              id="modal-cust-contact"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-cust-email">Email Address <span className="text-danger-text">*</span></Label>
            <Input
              id="modal-cust-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@acme.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modal-cust-bal">Outstanding Balance / Debt (UGX)</Label>
            <Input
              id="modal-cust-bal"
              type="number"
              value={outstandingBalance}
              onChange={(e) => setOutstandingBalance(e.target.value)}
              placeholder="0"
              min="0"
            />
            <p className="text-[11px] text-text-tertiary">
              Set the initial outstanding balance/debt for this customer.
            </p>
          </div>

          <Button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white rounded-xl mt-2 h-11 font-semibold"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create Customer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
