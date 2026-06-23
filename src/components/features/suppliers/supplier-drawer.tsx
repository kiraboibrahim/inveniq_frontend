"use client";

import { useState, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useInventoryStore } from "@/store/inventory-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Building2, Mail, Phone, Star,
    Download, ShoppingCart, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { stakeholderService, inventoryService } from "@/services/api";
import { SupplierOrderModal } from "./supplier-order-modal";
import { formatUgPhone } from "@/lib/phone-utils";
import { toast } from "sonner";

// ────────────────────────────────────────────────────────────────────────────
export function SupplierDrawer() {
    const { isSupplierDrawerOpen, selectedSupplierId, closeSupplierDrawer } =
        useInventoryStore();

    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // ── Supplier detail ──────────────────────────────────────────
    const { data: supplier, isLoading } = useQuery({
        queryKey: ["supplier", selectedSupplierId],
        queryFn: () =>
            selectedSupplierId
                ? stakeholderService.getSupplier(selectedSupplierId)
                : null,
        enabled: !!selectedSupplierId && isSupplierDrawerOpen,
    });

    // ── Order history (fetched lazily once drawer mounts) ────────
    const { data: orderHistory = [], isFetching: isFetchingOrders } = useQuery({
        queryKey: ["purchase-orders", selectedSupplierId],
        queryFn: () =>
            selectedSupplierId
                ? inventoryService.getPurchaseOrdersBySupplier(selectedSupplierId)
                : [],
        enabled: !!selectedSupplierId && isSupplierDrawerOpen,
        staleTime: 60_000,
    });

    const initials = supplier?.name
        ? supplier.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "??";

    // ── Download PDF ─────────────────────────────────────────────
    const handleDownloadPdf = useCallback(async () => {
        if (!supplier) return;
        setIsDownloading(true);
        try {
            await inventoryService.downloadSupplierOrdersPdf(supplier.id, supplier.name);
            toast.success("PDF downloaded", {
                description: `Order history for ${supplier.name} saved.`,
            });
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Failed to download PDF";
            toast.error(msg);
        } finally {
            setIsDownloading(false);
        }
    }, [supplier]);

    // ── Render ───────────────────────────────────────────────────
    return (
        <>
            <Sheet
                open={isSupplierDrawerOpen}
                onOpenChange={(open) => !open && closeSupplierDrawer()}
            >
                <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-l border-border-subtle p-0 flex flex-col">
                    {/* Accessibility */}
                    {supplier ? (
                        <VisuallyHidden.Root>
                            <SheetTitle>{supplier.name}</SheetTitle>
                            <SheetDescription>
                                {String(supplier.id).toUpperCase()}
                            </SheetDescription>
                        </VisuallyHidden.Root>
                    ) : (
                        <VisuallyHidden.Root>
                            <SheetTitle>Supplier details</SheetTitle>
                            <SheetDescription>Loading supplier information</SheetDescription>
                        </VisuallyHidden.Root>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                        </div>
                    ) : supplier ? (
                        <>
                            {/* ── Header ─────────────────────────────────────────── */}
                            <SheetHeader className="p-6 border-b border-border-subtle">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 shrink-0 text-sm font-bold text-accent-text tracking-wide">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold text-text-primary leading-snug truncate">
                                                {supplier.name}
                                            </p>
                                            <p className="text-xs text-text-tertiary font-mono mt-0.5">
                                                {String(supplier.id).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>

                            {/* ── Body ───────────────────────────────────────────── */}
                            <div className="p-6 flex-1 overflow-y-auto space-y-6">

                                {/* Fulfillment + status */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-elevated">
                                    <div className="flex items-center gap-2.5">
                                        <Star
                                            className={cn(
                                                "w-5 h-5",
                                                supplier.fulfillmentRating > 90
                                                    ? "text-accent fill-accent"
                                                    : "text-warning fill-warning"
                                            )}
                                        />
                                        <span className="text-lg font-bold font-mono text-text-primary leading-none">
                                            {supplier.fulfillmentRating}%
                                        </span>
                                        <span className="text-sm text-text-tertiary">
                                            Fulfillment rating
                                        </span>
                                    </div>
                                    <Badge
                                        variant={
                                            supplier.status === "active" ? "success" : "secondary"
                                        }
                                    >
                                        {supplier.status}
                                    </Badge>
                                </div>

                                {/* Contact */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                                        Primary contact
                                    </h4>
                                    <div className="border border-border-subtle rounded-xl overflow-hidden">
                                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle hover:bg-bg-elevated transition-colors">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-muted border border-border-subtle shrink-0">
                                                <Building2 className="w-4 h-4 text-text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">
                                                    {supplier.contactPerson}
                                                </p>
                                                <p className="text-xs text-text-tertiary">Account manager</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle hover:bg-bg-elevated transition-colors">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-muted border border-border-subtle shrink-0">
                                                <Mail className="w-4 h-4 text-text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">
                                                    {supplier.email}
                                                </p>
                                                <p className="text-xs text-text-tertiary">Business email</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bg-muted border border-border-subtle shrink-0">
                                                <Phone className="w-4 h-4 text-text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">
                                                    {formatUgPhone(supplier.phone)}
                                                </p>
                                                <p className="text-xs text-text-tertiary">Direct phone</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent orders preview */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                                            Recent orders
                                        </h4>
                                        {isFetchingOrders && (
                                            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent" />
                                        )}
                                    </div>

                                    {orderHistory.length > 0 ? (
                                        <div className="border border-border-subtle rounded-xl overflow-hidden divide-y divide-border-subtle">
                                            {orderHistory.slice(0, 4).map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="flex items-center justify-between px-4 py-3 hover:bg-bg-elevated transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-text-primary">
                                                            PO-{order.id}
                                                        </p>
                                                        <p className="text-xs text-text-tertiary">
                                                            {order.branch_name} ·{" "}
                                                            {order.created_at
                                                                ? new Date(order.created_at).toLocaleDateString()
                                                                : "—"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-mono font-semibold text-text-primary">
                                                            UGX{" "}
                                                            {(order.total_value ?? 0).toLocaleString("en-UG")}
                                                        </p>
                                                        <Badge
                                                            variant={
                                                                order.status === "received"
                                                                    ? "success"
                                                                    : order.status === "sent"
                                                                    ? "default"
                                                                    : "secondary"
                                                            }
                                                            className="text-[10px] mt-0.5"
                                                        >
                                                            {order.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}

                                            {orderHistory.length > 4 && (
                                                <div className="px-4 py-2 text-center text-xs text-text-tertiary bg-bg-muted">
                                                    +{orderHistory.length - 4} more ·{" "}
                                                    <button
                                                        onClick={handleDownloadPdf}
                                                        className="text-accent hover:underline"
                                                    >
                                                        download full history
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 py-6 rounded-xl border border-border-subtle border-dashed">
                                            <FileText className="w-7 h-7 text-text-tertiary" strokeWidth={1.5} />
                                            <p className="text-xs text-text-tertiary">No orders yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Footer ─────────────────────────────────────────── */}
                            <div className="p-6 border-t border-border-subtle flex gap-3 mt-auto">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-10 rounded-xl border-border-strong text-text-secondary hover:text-text-primary hover:bg-bg-elevated gap-2"
                                    onClick={handleDownloadPdf}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Download history
                                </Button>
                                <Button
                                    className="flex-1 h-10 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold gap-2"
                                    onClick={() => setIsOrderModalOpen(true)}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    New order
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm text-text-secondary">
                            Supplier not found.
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {supplier && (
                <SupplierOrderModal
                    open={isOrderModalOpen}
                    onOpenChange={setIsOrderModalOpen}
                    supplier={supplier}
                />
            )}
        </>
    );
}