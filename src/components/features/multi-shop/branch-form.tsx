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
import { branchService } from "@/services/api";
import { toast } from "sonner";
import { Branch } from "@/types";

interface BranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchToEdit?: (Branch & { manager_email?: string; address?: string }) | null;
}

export function BranchForm({ open, onOpenChange, branchToEdit }: BranchFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(branchToEdit?.name || "");
  const [code, setCode] = useState(branchToEdit?.code || "");
  const [location, setLocation] = useState(branchToEdit?.location || "");
  const [manager, setManager] = useState(branchToEdit?.manager || "");
  const [managerEmail, setManagerEmail] = useState(
    branchToEdit?.manager_email || 
    (branchToEdit?.manager ? `${branchToEdit.manager.toLowerCase().replace(/\s+/g, "")}@aims.com` : "")
  );
  const [address, setAddress] = useState(branchToEdit?.address || branchToEdit?.location || "");

  const queryClient = useQueryClient();

  const mutationFn = branchToEdit 
    ? (data: Partial<Branch>) => branchService.updateBranch(branchToEdit.id, data)
    : branchService.createBranch;

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branchKpis"] });
      queryClient.invalidateQueries({ queryKey: ["branch", branchToEdit?.id] });
      onOpenChange(false);
      toast.success(branchToEdit ? "Branch updated successfully" : "Branch created successfully");
      setIsLoading(false);
    },
    onError: () => {
      toast.error(branchToEdit ? "Failed to update branch" : "Failed to create branch");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    mutation.mutate({
      name,
      code,
      location,
      manager,
      ...({
        manager_email: managerEmail,
        address: address,
      } as Record<string, string>),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-bg-surface border-border-subtle text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            {branchToEdit ? "Edit Branch" : "Add New Branch"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="branchName" className="text-text-secondary">Branch Name</Label>
            <Input 
              id="branchName" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gulu Branch" 
              required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-text-secondary">Location / City</Label>
              <Input 
                id="location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gulu" 
                required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode" className="text-text-secondary">Branch Code</Label>
              <Input 
                id="branchCode" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. GUL-01" 
                required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent font-mono" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager" className="text-text-secondary">Branch Manager</Label>
            <Input 
              id="manager" 
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Full name of manager" 
              required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerEmail" className="text-text-secondary">Manager Email</Label>
            <Input 
              id="managerEmail" 
              type="email" 
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              placeholder="manager@aims.com" 
              required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-text-secondary">Physical Address</Label>
            <Input 
              id="address" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot 12, Main Street, Gulu"
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent-hover text-white">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Branch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
