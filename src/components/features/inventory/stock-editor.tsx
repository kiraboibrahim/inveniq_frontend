"use client";

import { useInventoryStore } from "@/store/inventory-store";
import { useBranchStore } from "@/store/branch-store";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/api";
import { useState } from "react";
import { Minus, Plus, Package } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

export function StockEditor() {
    const { isStockEditorOpen, selectedProductId, closeStockEditor } = useInventoryStore();
    const { activeBranch } = useBranchStore();
    const queryClient = useQueryClient();

    const { data: product, isLoading } = useQuery({
        queryKey: ["product", selectedProductId],
        queryFn: () => (selectedProductId ? inventoryService.getProduct(selectedProductId) : null),
        enabled: !!selectedProductId && !!isStockEditorOpen,
    });

    const [quantity, setQuantity] = useState<number | "">(0);

    const createStock = useMutation({
        mutationFn: (data: { product: string | number; branch: string | number; quantity: number }) =>
            inventoryService.createStock(data),
        onSuccess: () => {
            if (selectedProductId) {
                queryClient.invalidateQueries({ queryKey: ["product", selectedProductId] });
                queryClient.invalidateQueries({ queryKey: ["stockHistory", selectedProductId] });
            }
            queryClient.invalidateQueries({ queryKey: ["products", activeBranch] });
            setQuantity(0);
            closeStockEditor();
        },
    });

    const qty = typeof quantity === "number" ? quantity : 0;
    const adjust = (delta: number) => setQuantity(Math.max(0, qty + delta));

    const save = () => {
        if (!selectedProductId) return;
        createStock.mutate({
            product: selectedProductId,
            branch: activeBranch === "all" ? "" : activeBranch,
            quantity: qty,
        } as { product: string | number; branch: string | number; quantity: number });
    };

    const isPending = createStock.status === "pending";

    return (
        <Sheet open={!!isStockEditorOpen} onOpenChange={(open) => !open && closeStockEditor()}>
            <SheetContent className="w-full sm:max-w-[400px] bg-bg-surface border-border-subtle p-0 flex flex-col">
                <VisuallyHidden.Root>
                    <SheetTitle>{product?.name ?? "Update Stock"}</SheetTitle>
                    <SheetDescription>Set the stock quantity for this product</SheetDescription>
                </VisuallyHidden.Root>

                {/* Header */}
                <div className="p-6 border-b border-border-subtle">
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">Update Stock</p>
                    {isLoading ? (
                        <div className="h-10 w-48 rounded bg-bg-elevated animate-pulse" />
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-accent" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-medium text-text-primary leading-tight truncate">{product?.name}</p>
                                <p className="text-xs font-mono text-text-tertiary mt-0.5">{product?.sku}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                    {/* Current stock context */}
                    {product?.stockQty !== undefined && (
                        <div className="text-center">
                            <p className="text-xs text-text-tertiary mb-1">Current stock</p>
                            <p className="text-3xl font-mono text-text-secondary">{product.stockQty}</p>
                        </div>
                    )}

                    {/* Quantity stepper */}
                    <div className="flex flex-col items-center gap-3 w-full">
                        <p className="text-xs text-text-tertiary">New quantity</p>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => adjust(-1)}
                                disabled={qty <= 0}
                                className="h-10 w-10 rounded-full border border-border-subtle bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:bg-accent/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            <input
                                type="number"
                                min="0"
                                aria-label="Stock quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                                className={cn(
                                    "w-28 text-center text-3xl font-mono font-medium bg-bg-elevated border border-border-subtle rounded-lg py-3",
                                    "text-text-primary focus:outline-none focus:border-accent transition-colors",
                                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                )}
                            />

                            <button
                                type="button"
                                onClick={() => adjust(1)}
                                className="h-10 w-10 rounded-full border border-border-subtle bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:bg-accent/5 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick-set chips */}
                        <div className="flex gap-2 mt-1">
                            {[10, 25, 50, 100].map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setQuantity(n)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs border transition-colors",
                                        qty === n
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-border-subtle bg-bg-elevated text-text-tertiary hover:text-text-primary hover:border-accent/50"
                                    )}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-subtle flex gap-3">
                    <Button
                        variant="outline"
                        onClick={closeStockEditor}
                        className="flex-1 border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={save}
                        disabled={isPending || qty === product?.stockQty}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white disabled:opacity-50"
                    >
                        {isPending ? "Saving…" : "Update Stock"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default StockEditor;