"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import type { Supplier } from "@/types";

interface OrderItem {
    product: string;
    product_name: string;
    quantity: number;
    unit_cost: number;
}

interface SupplierOrderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier;
}

const emptyItem = (): OrderItem => ({
    product: "",
    product_name: "",
    quantity: 1,
    unit_cost: 0,
});

export function SupplierOrderModal({
    open,
    onOpenChange,
    supplier,
}: SupplierOrderModalProps) {
    const queryClient = useQueryClient();
    const [selectedBranch, setSelectedBranch] = useState("");
    const [items, setItems] = useState<OrderItem[]>([emptyItem()]);

    // ── Data queries ──────────────────────────────────────────────

    const { data: branchList = [] } = useQuery({
        queryKey: ["branch-list"],
        queryFn: async () => {
            const { branchService } = await import("@/services/api");
            return branchService.getBranches();
        },
        enabled: open,
    });

    const { data: products = [] } = useQuery({
        queryKey: ["products"],
        queryFn: () => inventoryService.getProducts(),
        enabled: open,
    });

    // ── Mutation ───────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: () => {
            const validItems = items.filter((i) => i.product && i.quantity > 0);
            if (!validItems.length) throw new Error("Add at least one item.");
            if (!selectedBranch) throw new Error("Please select a branch.");
            return inventoryService.createPurchaseOrder({
                supplier: supplier.id,
                branch: selectedBranch,
                items: validItems.map((i) => ({
                    product: i.product,
                    quantity: i.quantity,
                    unit_cost: i.unit_cost,
                })),
            });
        },
        onSuccess: () => {
            toast.success("Purchase order created", {
                description: `Order placed with ${supplier.name}`,
            });
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            queryClient.invalidateQueries({ queryKey: ["purchase-orders", supplier.id] });
            handleClose();
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error ? err.message : "Failed to create order";
            toast.error(message);
        },
    });

    // ── Helpers ────────────────────────────────────────────────────
    const handleClose = useCallback(() => {
        setSelectedBranch("");
        setItems([emptyItem()]);
        onOpenChange(false);
    }, [onOpenChange]);

    const updateItem = (index: number, patch: Partial<OrderItem>) => {
        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
        );
    };

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const addItem = () => setItems((prev) => [...prev, emptyItem()]);

    const totalValue = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0
    );

    const productOptions = products.map((p) => ({
        value: String(p.id),
        label: `${p.name} (${p.sku})`,
    }));

    const branchOptions = branchList.map((b) => ({
        value: String(b.id),
        label: b.name,
    }));

    // ── Render ─────────────────────────────────────────────────────
    return (
        <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
            <DialogContent className="bg-bg-surface border border-border-subtle text-text-primary max-w-xl rounded-2xl p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
                            <ShoppingCart className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold text-text-primary">
                                New Purchase Order
                            </DialogTitle>
                            <p className="text-xs text-text-tertiary mt-0.5">
                                Ordering from{" "}
                                <span className="font-medium text-text-secondary">
                                    {supplier.name}
                                </span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                    {/* Branch selection */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Deliver to branch <span className="text-danger-text">*</span>
                        </Label>
                        <CustomSelect
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            options={branchOptions}
                            placeholder="Select a branch…"
                        />
                    </div>

                    {/* Line items */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Order items <span className="text-danger-text">*</span>
                            </Label>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add item
                            </button>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="grid grid-cols-[1fr_80px_100px_36px] gap-2 items-center p-3 rounded-xl border border-border-subtle bg-bg-elevated"
                                >
                                    {/* Product */}
                                    <CustomSelect
                                        value={item.product}
                                        onChange={(val) => {
                                            const p = products.find(
                                                (pr) => String(pr.id) === val
                                            );
                                            updateItem(idx, {
                                                product: val,
                                                product_name: p?.name ?? "",
                                                unit_cost: p?.costPrice ?? 0,
                                            });
                                        }}
                                        options={productOptions}
                                        placeholder="Product…"
                                    />

                                    {/* Qty */}
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateItem(idx, {
                                                quantity: Math.max(1, Number(e.target.value)),
                                            })
                                        }
                                        className="h-9 text-center px-2"
                                        placeholder="Qty"
                                    />

                                    {/* Unit cost */}
                                    <Input
                                        type="number"
                                        min={0}
                                        step={100}
                                        value={item.unit_cost}
                                        onChange={(e) =>
                                            updateItem(idx, {
                                                unit_cost: Number(e.target.value),
                                            })
                                        }
                                        className="h-9 text-right px-2"
                                        placeholder="Cost"
                                    />

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        disabled={items.length === 1}
                                        className="flex items-center justify-center w-9 h-9 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Column labels hint */}
                        <div className="grid grid-cols-[1fr_80px_100px_36px] gap-2 px-1">
                            <span className="text-[10px] text-text-tertiary">Product</span>
                            <span className="text-[10px] text-text-tertiary text-center">Qty</span>
                            <span className="text-[10px] text-text-tertiary text-right">Unit cost (UGX)</span>
                            <span />
                        </div>
                    </div>

                    {/* Total summary */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bg-muted border border-border-subtle">
                        <span className="text-sm text-text-secondary">Estimated total</span>
                        <span className="text-base font-bold font-mono text-text-primary">
                            UGX{" "}
                            {totalValue.toLocaleString("en-UG", {
                                minimumFractionDigits: 0,
                            })}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-border-strong text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        className="bg-accent hover:bg-accent-hover text-white font-semibold min-w-[140px]"
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Placing…
                            </>
                        ) : (
                            "Place Order"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
