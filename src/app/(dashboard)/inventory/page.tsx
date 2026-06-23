"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, UploadCloud, Plus, Package, Search } from "lucide-react";
import { ProductTable } from "@/components/features/inventory/product-table";
import { useInventoryStore } from "@/store/inventory-store";
import { useBranchStore } from "@/store/branch-store";
import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/api";

import { ProductDrawer } from "@/components/features/inventory/product-drawer";
import { StockEditor } from "@/components/features/inventory/stock-editor";
import { ProductForm } from "@/components/features/inventory/product-form";
import { ProductEditModal } from "@/components/features/inventory/product-edit-modal";
import { CsvImport } from "@/components/features/inventory/csv-import";
import { BarcodeScanner } from "@/components/features/inventory/barcode-scanner";
import { EmptyState } from "@/components/ui/empty-state";
import { CustomSelect } from "@/components/ui/custom-select";

import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";

export default function Inventory() {
    const { setScannerOpen, setAddProductOpen, setImportOpen } = useInventoryStore();
    const { activeBranch } = useBranchStore();
    const { user } = useAuthStore();
    const canEdit = user?.role === "admin" || user?.role === "manager";

    const { data: products = [], isLoading } = useQuery({
        queryKey: ["products", activeBranch],
        queryFn: () => inventoryService.getProducts(activeBranch),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: inventoryService.getCategories,
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredProducts = products.filter((p) => {
        if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
        if (statusFilter !== "all" && p.status !== statusFilter) return false;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            if (
                !p.name.toLowerCase().includes(query) &&
                !p.sku.toLowerCase().includes(query) &&
                !p.category.toLowerCase().includes(query)
            ) return false;
        }
        return true;
    });

    const isEmpty = filteredProducts.length === 0 && !isLoading;

    return (
        <>
            <PageHeader
                title="Inventory"
                breadcrumbs={[{ label: "AIMS" }, { label: "Inventory" }]}
                action={
                    <div className="flex gap-2">
                        {canEdit && (
                            <>
                                <Button
                                    variant="outline"
                                    className="hidden sm:flex border-border-subtle text-text-secondary hover:text-text-primary"
                                    onClick={() => setImportOpen(true)}
                                >
                                    <UploadCloud className="w-4 h-4 mr-2" />
                                    Import Excel
                                </Button>
                                <Button
                                    className="bg-accent hover:bg-accent-hover text-white"
                                    onClick={() => setAddProductOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Product
                                </Button>
                            </>
                        )}
                    </div>
                }
            />

            <div className="flex flex-col gap-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-surface p-4 border border-border-subtle rounded-md">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 max-w-3xl">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                            <Input
                                placeholder="Search by name, SKU or barcode…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <CustomSelect
                            className="w-full sm:w-[180px]"
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            options={[
                                { value: "all", label: "All Categories" },
                                ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
                            ]}
                        />
                        <CustomSelect
                            className="w-full sm:w-[160px]"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "all", label: "All Statuses" },
                                { value: "In stock", label: "In Stock" },
                                { value: "Low stock", label: "Low Stock" },
                                { value: "Out of stock", label: "Out of Stock" },
                            ]}
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="border-border-subtle text-text-primary hover:bg-bg-elevated h-9 self-end md:self-auto shrink-0"
                        onClick={() => setScannerOpen(true)}
                    >
                        <Scan className="w-4 h-4 mr-2" />
                        Scan Barcode
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    </div>
                ) : isEmpty ? (
                    <EmptyState
                        icon={<Package className="w-10 h-10" strokeWidth={1.5} />}
                        title="No products yet"
                        description={
                            activeBranch === "all"
                                ? "Add your first product by scanning a barcode or entering details manually."
                                : `No products found in the selected branch.`
                        }
                        action={
                            activeBranch === "all" ? (
                                <Button
                                    className="bg-accent hover:bg-accent-hover text-white mt-2"
                                    onClick={() => setAddProductOpen(true)}
                                >
                                    Add your first product
                                </Button>
                            ) : null
                        }
                    />
                ) : (
                    <ProductTable data={filteredProducts} />
                )}
            </div>

            <ProductDrawer />
            <StockEditor />
            <ProductForm />
            <ProductEditModal />
            <CsvImport />
            <BarcodeScanner />
        </>
    );
}