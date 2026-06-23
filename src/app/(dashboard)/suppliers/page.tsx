"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { SupplierDirectory } from "@/components/features/suppliers/supplier-directory";
import { SupplierDrawer } from "@/components/features/suppliers/supplier-drawer";
import { SupplierForm } from "@/components/features/suppliers/supplier-form";
import { useQuery } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";
import type { Supplier } from "@/types";

import { RoleGuard } from "@/components/auth/role-guard";

export default function Suppliers() {
    const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { data: suppliers = [], isLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: stakeholderService.getSuppliers,
    });

    const isEmpty = suppliers.length === 0 && !isLoading;

    const handleAddSupplier = () => {
        setEditingSupplier(null);
        setIsSupplierFormOpen(true);
    };

    const handleEditSupplier = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsSupplierFormOpen(true);
    };

    const handleFormOpenChange = (open: boolean) => {
        setIsSupplierFormOpen(open);
        if (!open) {
            setEditingSupplier(null);
        }
    };

    return (
        <RoleGuard allowedRoles={["admin", "manager"]}>
            <PageHeader
                title="Suppliers"
                breadcrumbs={[{ label: "AIMS" }, { label: "Suppliers" }]}
                action={
                    <Button
                        className="bg-accent hover:bg-accent-hover text-white"
                        onClick={handleAddSupplier}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier
                    </Button>
                }
            />

            <div className="fade-in duration-300">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                ) : isEmpty ? (
                    <EmptyState
                        icon={<Users className="w-10 h-10" strokeWidth={1.5} />}
                        title="No suppliers yet"
                        description="Manage your product sources and track fulfillment ratings."
                        action={
                            <Button
                                className="bg-accent hover:bg-accent-hover text-white mt-2"
                                onClick={handleAddSupplier}
                            >
                                Add your first supplier
                            </Button>
                        }
                    />
                ) : (
                    <SupplierDirectory 
                        data={suppliers} 
                        onEditSupplier={handleEditSupplier}
                    />
                )}
            </div>

            <SupplierDrawer />
            <SupplierForm 
                open={isSupplierFormOpen} 
                onOpenChange={handleFormOpenChange} 
                supplier={editingSupplier}
            />
        </RoleGuard>
    );
}
