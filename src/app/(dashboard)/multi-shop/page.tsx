"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { BranchKpiTable } from "@/components/features/multi-shop/branch-kpi-table";
import { BranchDrawer } from "@/components/features/multi-shop/branch-drawer";
import { BranchForm } from "@/components/features/multi-shop/branch-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Branch } from "@/types";

export default function MultiShop() {
    const [formOpen, setFormOpen] = useState(false);
    const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

    const handleEdit = (branch: Branch) => {
        setBranchToEdit(branch);
        setFormOpen(true);
    };

    const handleAdd = () => {
        setBranchToEdit(null);
        setFormOpen(true);
    };

    return (
        <RoleGuard allowedRoles={["admin", "manager"]}>
            <PageHeader
                title="Multi-Shop Management"
                breadcrumbs={[{ label: "AIMS" }, { label: "Multi-Shop" }]}
                action={
                    <Button className="bg-accent hover:bg-accent-hover text-white" onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Shop
                    </Button>
                }
            />
            <div className="flex flex-col gap-6 w-full pb-12">
                <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-border-subtle">
                        <h3 className="text-base font-semibold text-text-primary">Branch Performance Overview</h3>
                        <p className="text-sm text-text-secondary mt-0.5">Month-to-date metrics across all active locations.</p>
                    </div>
                    <div className="p-6">
                        <BranchKpiTable onEdit={handleEdit} />
                    </div>
                </div>
                <BranchDrawer />
                <BranchForm key={branchToEdit?.id ?? "new"} open={formOpen} onOpenChange={setFormOpen} branchToEdit={branchToEdit} />
            </div>
        </RoleGuard>
    );
}