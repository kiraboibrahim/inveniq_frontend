"use client";

import { useInventoryStore } from "@/store/inventory-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, stakeholderService } from "@/services/api";
import { toast } from "sonner";
import { useState } from "react";
import { SkuBarcodeInput } from "./sku-bardcode-input";
import { useShopStore } from "@/store/branch-store";
import { CustomSelect } from "@/components/ui/custom-select";

export function ProductForm() {
    const { isAddProductOpen, setAddProductOpen } = useInventoryStore();
    const queryClient = useQueryClient();
    const [sku, setSku] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: inventoryService.getCategories,
        enabled: isAddProductOpen,
    });

    const { data: suppliers = [] } = useQuery({
        queryKey: ["suppliers"],
        queryFn: stakeholderService.getSuppliers,
        enabled: isAddProductOpen,
    });

    const { activeBranch } = useShopStore();

    const createMutation = useMutation({
        mutationFn: inventoryService.createProduct,
        onSuccess: async (product: any) => {
            if (activeBranch && activeBranch !== "all") {
                try {
                    await inventoryService.createStock({ product: product.id, branch: activeBranch, quantity: 0 });
                } catch (e) {
                    console.error("Failed to create initial stock for shop", e);
                }
            }
            await queryClient.invalidateQueries({ queryKey: ["products", activeBranch] });
            await queryClient.invalidateQueries({ queryKey: ["products"] });
            setAddProductOpen(false);
            setSelectedCategoryId("");
            setSelectedSupplierId("");
            setSku("");
            toast.success("Product created successfully");
        },
        onError: () => {
            toast.error("Failed to create product");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const expiryDate = formData.get("expiry_date");

        createMutation.mutate({
            sku,
            name: formData.get("name") as string,
            category_id: selectedCategoryId ? Number(selectedCategoryId) : null,
            price: Number(formData.get("price")),
            costPrice: Number(formData.get("cost_price") || 0),
            primarySupplierId: selectedSupplierId ? Number(selectedSupplierId) : null,
            threshold: Number(formData.get("threshold") || 10),
            expiryDate: expiryDate ? (expiryDate as string) : null,
        });
    };

    const handleClose = () => {
        setAddProductOpen(false);
        setSelectedCategoryId("");
        setSelectedSupplierId("");
        setSku("");
    };

    return (
        <Dialog open={isAddProductOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="sm:max-w-[550px] bg-bg-surface border-border-subtle text-text-primary">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Add New Product</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-3">
                    <div className="grid grid-cols-2 gap-4">
                        <SkuBarcodeInput value={sku} onChange={setSku} required />

                        <div className="space-y-1.5">
                            <Label htmlFor="price" className="text-text-secondary text-sm font-medium">Selling Price (UGX)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="cost_price" className="text-text-secondary text-sm font-medium">Cost Price (UGX)</Label>
                            <Input
                                id="cost_price"
                                name="cost_price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="threshold" className="text-text-secondary text-sm font-medium">Low Stock Threshold</Label>
                            <Input
                                id="threshold"
                                name="threshold"
                                type="number"
                                min="1"
                                placeholder="10"
                                defaultValue="10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-text-secondary text-sm font-medium">Product Name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder="e.g. Maize Flour 2kg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="expiry_date" className="text-text-secondary text-sm font-medium">Expiry Date</Label>
                            <Input
                                id="expiry_date"
                                name="expiry_date"
                                type="date"
                                className="cursor-pointer"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-text-secondary text-sm font-medium">Category</Label>
                            <CustomSelect
                                value={selectedCategoryId}
                                onChange={setSelectedCategoryId}
                                placeholder="Select category"
                                options={categories.map((cat: { id: number; name: string }) => ({
                                    value: String(cat.id),
                                    label: cat.name,
                                }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-text-secondary text-sm font-medium">Primary Supplier</Label>
                        <CustomSelect
                            value={selectedSupplierId || "none"}
                            onChange={(val) => setSelectedSupplierId(val === "none" ? "" : val)}
                            placeholder="Select primary supplier (optional)"
                            options={[
                                { value: "none", label: "None (Optional)" },
                                ...suppliers.map((sup: any) => ({
                                    value: String(sup.id),
                                    label: `${sup.name} (${sup.contactPerson})`,
                                }))
                            ]}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 border-t border-border-subtle/50">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleClose}
                            className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-accent hover:bg-accent-hover text-white font-medium px-5"
                        >
                            {createMutation.isPending ? "Saving..." : "Save Product"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}