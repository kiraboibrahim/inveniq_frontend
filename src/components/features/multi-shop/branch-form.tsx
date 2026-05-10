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

interface BranchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchForm({ open, onOpenChange }: BranchFormProps) {
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
          <DialogTitle className="text-xl font-medium">Add New Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="branchName" className="text-text-secondary">Branch Name</Label>
            <Input id="branchName" placeholder="e.g. Gulu Branch" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-text-secondary">Location / City</Label>
              <Input id="location" placeholder="e.g. Gulu" required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branchCode" className="text-text-secondary">Branch Code</Label>
              <Input id="branchCode" placeholder="e.g. GUL-01" required
                className="bg-bg-elevated border-border-subtle focus-visible:ring-accent font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manager" className="text-text-secondary">Branch Manager</Label>
            <Input id="manager" placeholder="Full name of manager" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerEmail" className="text-text-secondary">Manager Email</Label>
            <Input id="managerEmail" type="email" placeholder="manager@aims.com" required
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-text-secondary">Physical Address</Label>
            <Input id="address" placeholder="Plot 12, Main Street, Gulu"
              className="bg-bg-elevated border-border-subtle focus-visible:ring-accent" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
              className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated">
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
