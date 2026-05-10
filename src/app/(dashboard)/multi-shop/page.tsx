"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BranchKpiTable } from "@/components/features/multi-shop/branch-kpi-table";
import { BranchDrawer } from "@/components/features/multi-shop/branch-drawer";
import { BranchForm } from "@/components/features/multi-shop/branch-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MultiShop() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Multi-Shop Management"
        breadcrumbs={[{ label: "AIMS" }, { label: "Multi-Shop" }]}
        action={
          <Button className="bg-accent hover:bg-accent-hover text-white" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded-md p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-text-primary">Branch Performance Overview</h3>
            <p className="text-sm text-text-secondary">Month-to-date metrics across all active locations.</p>
          </div>
          <BranchKpiTable />
        </div>
        <BranchDrawer />
        <BranchForm open={formOpen} onOpenChange={setFormOpen} />
      </div>
    </>
  );
}
