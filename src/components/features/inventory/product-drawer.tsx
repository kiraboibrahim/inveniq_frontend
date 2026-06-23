"use client";

import { useState } from "react";
import { useInventoryStore } from "@/store/inventory-store";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, stakeholderService } from "@/services/api";
import { useBranchStore } from "@/store/branch-store";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { TrendingUp, TrendingDown, Minus, BarChart3, ShoppingCart, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Custom Tooltip ────────────────────────────────────────────────
function StockTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-bg-elevated border border-border-strong rounded-xl px-3.5 py-2.5 shadow-xl backdrop-blur-sm">
            <p className="text-xs text-text-tertiary mb-1 font-medium">{label}</p>
            <p className="text-base font-mono font-bold text-text-primary">
                {payload[0]?.value} <span className="text-text-tertiary text-xs font-normal">units</span>
            </p>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────
export function ProductDrawer() {
    const { isDrawerOpen, selectedProductId, closeDrawer } = useInventoryStore();
    const { activeBranch } = useBranchStore();
    const queryClient = useQueryClient();

    // PO form state
    const [showPoForm, setShowPoForm] = useState(false);
    const [poSupplierId, setPoSupplierId] = useState("");
    const [poBranchId, setPoBranchId] = useState("");
    const [poQty, setPoQty] = useState("");
    const [poUnitCost, setPoUnitCost] = useState("");

    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["product", selectedProductId],
        queryFn: () => selectedProductId ? inventoryService.getProduct(selectedProductId) : null,
        enabled: !!selectedProductId && isDrawerOpen,
    });

    const { data: stockHistory = [], isLoading: isLoadingHistory } = useQuery({
        queryKey: ["stockHistory", selectedProductId],
        queryFn: () => selectedProductId ? inventoryService.getStockHistory(selectedProductId) : [],
        enabled: !!selectedProductId && isDrawerOpen,
    });

    const { data: suppliers = [] } = useQuery({
        queryKey: ["suppliers"],
        queryFn: stakeholderService.getSuppliers,
        enabled: isDrawerOpen && showPoForm,
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["branches-raw"],
        queryFn: async () => {
            const res = await import("@/services/api").then(m => m.inventoryService.getProducts("all"));
            // Fetch branches directly
            const { default: api } = await import("@/lib/api-client");
            const r = await api.get("/inventory/branches/");
            return r.data as { id: number; name: string }[];
        },
        enabled: isDrawerOpen && showPoForm,
    });

    const poMutation = useMutation({
        mutationFn: inventoryService.createPurchaseOrder,
        onSuccess: (data) => {
            toast.success("Purchase order created successfully", {
                description: `PO #${data.id} has been submitted to ${data.supplier_name}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            setShowPoForm(false);
            setPoSupplierId("");
            setPoBranchId("");
            setPoQty("");
            setPoUnitCost("");
        },
        onError: (err: any) => {
            toast.error("Failed to create purchase order", { description: err.message });
        },
    });

    const handlePoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !poSupplierId || !poBranchId) return;
        poMutation.mutate({
            supplier: Number(poSupplierId),
            branch: Number(poBranchId),
            items: [{
                product: Number(selectedProductId),
                quantity: Number(poQty),
                unit_cost: Number(poUnitCost),
            }],
        });
    };

    const handleClose = () => {
        setShowPoForm(false);
        closeDrawer();
    };

    // Derive trend from history
    const trendInfo = (() => {
        if ((stockHistory as any[]).length < 2) return null;
        const first = (stockHistory as any[])[0]?.stock ?? 0;
        const last = (stockHistory as any[])[(stockHistory as any[]).length - 1]?.stock ?? 0;
        const delta = last - first;
        const pct = first > 0 ? Math.round((delta / first) * 100) : 0;
        return { delta, pct };
    })();

    const hist = stockHistory as any[];
    const stockMin = hist.length ? Math.min(...hist.map(p => p.stock)) : 0;
    const stockMax = hist.length ? Math.max(...hist.map(p => p.stock)) : 0;
    const xTicks = hist.filter((_: any, i: number) => i % 5 === 0 || i === hist.length - 1).map(p => p.date);

    // PO total preview
    const poTotal = Number(poQty) > 0 && Number(poUnitCost) > 0
        ? new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(poQty) * Number(poUnitCost))
        : null;

    return (
        <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent className="w-full sm:max-w-[500px] bg-bg-surface border-border-subtle p-0 flex flex-col shadow-2xl rounded-l-2xl">
                <VisuallyHidden.Root>
                    <SheetTitle>{product?.name ?? "Product Details"}</SheetTitle>
                    <SheetDescription>{product?.sku ?? "Product information"}</SheetDescription>
                </VisuallyHidden.Root>

                {isLoadingProduct ? (
                    <div className="p-6 flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    </div>
                ) : product ? (
                    <>
                        {/* HEADER */}
                        <div className="p-6 border-b border-border-subtle">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold text-text-primary tracking-tight font-display">{product.name}</p>
                                    <p className="text-text-secondary font-mono mt-1.5 text-xs">{product.sku}</p>
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                    product.status === "In stock"
                                        ? "bg-success-muted/30 text-success-text border-success/25"
                                        : product.status === "Low stock"
                                        ? "bg-warning-muted/30 text-warning-text border-warning/25"
                                        : "bg-danger-muted/30 text-danger-text border-danger/25"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        product.status === "In stock" ? "bg-success" :
                                        product.status === "Low stock" ? "bg-warning" : "bg-danger"
                                    }`} />
                                    {product.status}
                                </div>
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            {/* Key Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Current Stock", value: product.stockQty, mono: true },
                                    { label: "Low Stock Limit", value: product.threshold, mono: true },
                                    {
                                        label: "Selling Price",
                                        value: new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(product.price),
                                        mono: true,
                                    },
                                    {
                                        label: "Cost Price",
                                        value: new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(product.costPrice || 0),
                                        mono: true,
                                    },
                                    {
                                        label: "Profit Margin",
                                        value: product.price > 0
                                            ? `${Math.round(((product.price - (product.costPrice || 0)) / product.price) * 100)}%`
                                            : "0%",
                                        highlight: "success",
                                        mono: true,
                                    },
                                    { label: "Category", value: product.category || "Unassigned" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-3.5 rounded-xl bg-bg-elevated border border-border-subtle">
                                        <p className="text-xs text-text-tertiary uppercase tracking-wider mb-1.5">{stat.label}</p>
                                        <p className={`text-base font-bold truncate ${stat.highlight === "success" ? "text-success-text" : "text-text-primary"} ${stat.mono ? "font-mono" : ""}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Supplier */}
                            <div className="px-3.5 py-3 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-between">
                                <span className="text-xs text-text-tertiary uppercase tracking-wider">Primary Supplier</span>
                                <span className="text-sm font-semibold text-text-primary">{product.primarySupplier || "None Assigned"}</span>
                            </div>

                            {/* Expiry Date */}
                            {product.expiryDate && (
                                <div className="p-4 rounded-xl border border-warning/25 bg-warning/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-warning-text mb-0.5 font-medium uppercase tracking-wider">Expiry Date</p>
                                        <p className="text-text-primary text-sm font-semibold">
                                            {new Date(product.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                                        </p>
                                    </div>
                                    {product.daysRemaining !== null && (
                                        <div className="text-right">
                                            <span className="text-xs text-text-tertiary">Days Left</span>
                                            <p className={`font-mono font-bold text-lg ${product.daysRemaining <= 30 ? "text-warning-text" : "text-text-primary"}`}>
                                                {product.daysRemaining}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 30-Day Stock History */}
                            <div className="rounded-2xl border border-border-subtle bg-bg-elevated/40 overflow-hidden">
                                <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-border-subtle/50">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">30-Day Stock Movement</p>
                                        {trendInfo !== null && (
                                            <div className={`flex items-center gap-1.5 mt-1.5 ${trendInfo.delta > 0 ? "text-success-text" : trendInfo.delta < 0 ? "text-danger-text" : "text-text-tertiary"}`}>
                                                {trendInfo.delta > 0 ? <TrendingUp className="w-4 h-4" /> : trendInfo.delta < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                                <span className="text-sm font-bold font-mono">{trendInfo.delta > 0 ? "+" : ""}{trendInfo.pct}%</span>
                                                <span className="text-xs text-text-tertiary font-normal">vs 30 days ago</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-text-tertiary">Range</p>
                                        <p className="text-xs font-mono font-semibold text-text-primary mt-0.5">{stockMin} – {stockMax} units</p>
                                    </div>
                                </div>
                                <div className="px-2 pt-4 pb-2">
                                    {isLoadingHistory ? (
                                        <div className="h-[180px] flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                                        </div>
                                    ) : hist.length === 0 ? (
                                        <div className="h-[180px] flex flex-col items-center justify-center gap-3 text-center px-8">
                                            <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center">
                                                <BarChart3 className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-secondary">No movement recorded yet</p>
                                                <p className="text-xs text-text-tertiary mt-1">Stock changes will appear here once sales or adjustments are made.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <AreaChart data={hist} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                                                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                                                <XAxis dataKey="date" ticks={xTicks} tick={{ fill: "var(--color-text-tertiary)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} dy={6} />
                                                <YAxis tick={{ fill: "var(--color-text-tertiary)", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} width={40} />
                                                <ReferenceLine y={product.threshold} stroke="var(--color-warning)" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Threshold", fill: "var(--color-warning-text)", fontSize: 9, position: "insideTopRight" }} />
                                                <Tooltip content={<StockTooltip />} cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1 }} />
                                                <Area type="monotone" dataKey="stock" stroke="#6366F1" strokeWidth={2} fill="url(#stockGradient)" dot={false} activeDot={{ r: 4, fill: "#6366F1", strokeWidth: 2, stroke: "var(--color-bg-surface)" }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER — Purchase Order */}
                        <div className="border-t border-border-subtle bg-bg-surface/50 backdrop-blur-sm">
                            {/* Toggle trigger */}
                            <button
                                onClick={() => setShowPoForm((v) => !v)}
                                className={cn(
                                    "w-full flex items-center justify-between px-6 py-4 text-sm font-semibold transition-colors",
                                    showPoForm
                                        ? "text-accent bg-accent/5"
                                        : "text-text-primary hover:bg-bg-elevated"
                                )}
                            >
                                <span className="flex items-center gap-2.5">
                                    <ShoppingCart className="w-4 h-4" />
                                    Create Purchase Order
                                </span>
                                {showPoForm ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />}
                            </button>

                            {/* Inline PO form */}
                            {showPoForm && (
                                <form onSubmit={handlePoSubmit} className="px-6 pb-6 pt-2 space-y-4 border-t border-border-subtle/60">
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Supplier */}
                                        <div className="col-span-2 space-y-1.5">
                                            <Label className="text-xs text-text-secondary uppercase tracking-wider">Supplier</Label>
                                            <CustomSelect
                                                value={poSupplierId}
                                                onChange={setPoSupplierId}
                                                placeholder="Select supplier…"
                                                options={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
                                            />
                                        </div>

                                        {/* Branch */}
                                        <div className="col-span-2 space-y-1.5">
                                            <Label className="text-xs text-text-secondary uppercase tracking-wider">Deliver To Branch</Label>
                                            <CustomSelect
                                                value={poBranchId}
                                                onChange={setPoBranchId}
                                                placeholder="Select branch…"
                                                options={branches.map((b: any) => ({ value: String(b.id), label: b.name }))}
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-text-secondary uppercase tracking-wider">Quantity</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                required
                                                value={poQty}
                                                onChange={(e) => setPoQty(e.target.value)}
                                                placeholder="e.g. 50"
                                                className="font-mono"
                                            />
                                        </div>

                                        {/* Unit Cost */}
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-text-secondary uppercase tracking-wider">Unit Cost (UGX)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                required
                                                value={poUnitCost}
                                                onChange={(e) => setPoUnitCost(e.target.value)}
                                                placeholder="e.g. 850"
                                                className="font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Total preview */}
                                    {poTotal && (
                                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-accent/8 border border-accent/20">
                                            <span className="text-xs text-text-secondary">Order Total</span>
                                            <span className="text-sm font-mono font-bold text-accent">{poTotal}</span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowPoForm(false)}
                                            className="flex-1 text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-xl h-10 text-sm"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={poMutation.isPending || !poSupplierId || !poBranchId}
                                            className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-xl h-10 font-medium text-sm"
                                        >
                                            {poMutation.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <div className="w-3.5 h-3.5 border-b-2 border-white rounded-full animate-spin" />
                                                    Submitting…
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Submit PO
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-6 flex items-center justify-center h-full text-text-secondary">
                        Product not found.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}