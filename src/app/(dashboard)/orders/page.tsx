"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, stakeholderService, branchService } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { PurchaseOrder } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CustomSelect } from "@/components/ui/custom-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
    ClipboardList,
    Filter,
    Calendar,
    Building2,
    Truck,
    Clock,
    CheckCircle2,
    ArrowRight,
    Search,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const UGX = (n: number) =>
    new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
    }).format(n);

export default function OrdersPage() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const role = user?.role ?? "staff";
    const isAdminOrManager = role === "admin" || role === "manager";

    // ── Filters State ────────────────────────────────────────────────────────
    const [supplierFilter, setSupplierFilter] = useState<string>("all");
    const [branchFilter, setBranchFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>(" "); // starts with space or empty

    // ── Selected Order for Drawer ─────────────────────────────────────────────
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: suppliers = [] } = useQuery({
        queryKey: ["suppliers"],
        queryFn: () => stakeholderService.getSuppliers(),
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: () => branchService.getBranches(),
    });

    const { data: purchaseOrders = [], isLoading: isOrdersLoading } = useQuery({
        queryKey: ["purchase-orders"],
        queryFn: () => inventoryService.getPurchaseOrders(),
    });

    // ── Mutation for status transition ──────────────────────────────────────
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: "draft" | "sent" | "received" }) =>
            inventoryService.updatePurchaseOrderStatus(id, status),
        onSuccess: (updatedOrder) => {
            toast.success("Order status updated successfully", {
                description: `PO #${updatedOrder.id} is now ${(updatedOrder.status ?? "").toUpperCase()}`,
            });
            // Update local selected state
            setSelectedOrder(updatedOrder);
            // Refresh tables
            queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.error ?? "Failed to update status.";
            toast.error(errorMsg);
        },
    });

    // ── Computed stats and filtered list ─────────────────────────────────────
    const filteredOrders = useMemo(() => {
        return purchaseOrders.filter((order) => {
            const matchSupplier = supplierFilter === "all" || String(order.supplier) === supplierFilter;
            const matchBranch = branchFilter === "all" || String(order.branch) === branchFilter;
            const matchStatus = statusFilter === "all" || order.status === statusFilter;

            const searchLower = searchQuery.toLowerCase().trim();
            const matchSearch =
                !searchLower ||
                String(order.id).includes(searchLower) ||
                order.supplier_name?.toLowerCase().includes(searchLower) ||
                order.branch_name?.toLowerCase().includes(searchLower);

            return matchSupplier && matchBranch && matchStatus && matchSearch;
        });
    }, [purchaseOrders, supplierFilter, branchFilter, statusFilter, searchQuery]);

    const stats = useMemo(() => {
        let totalVal = 0;
        let pending = 0;
        let received = 0;
        purchaseOrders.forEach((o) => {
            const val = o.total_value ?? 0;
            totalVal += val;
            if (o.status === "received") {
                received += 1;
            } else {
                pending += 1;
            }
        });
        return {
            total: purchaseOrders.length,
            value: totalVal,
            pending,
            received,
        };
    }, [purchaseOrders]);

    // Helper: format dates nicely
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleStatusTransition = (status: "draft" | "sent" | "received") => {
        if (!selectedOrder?.id) return;
        updateStatusMutation.mutate({ id: selectedOrder.id, status });
    };

    return (
        <div className="flex flex-col gap-6 p-1 sm:p-0">
            <PageHeader
                title="Purchase Orders Management"
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Orders" }]}
                action={
                    <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-lg shadow-sm">
                        <UserCheck className="w-3.5 h-3.5 text-accent" />
                        Role: <span className="font-semibold capitalize text-text-primary">{role}</span>
                    </div>
                }
            />

            {/* ── KPI Widgets ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Total Orders</p>
                        <p className="text-xl font-bold font-display text-text-primary mt-1">{stats.total}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-accent/10 text-accent">
                        <ClipboardList className="w-4 h-4" />
                    </div>
                </Card>

                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Pending / Sent</p>
                        <p className="text-xl font-bold font-display text-warning-text mt-1">{stats.pending}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-warning/10 text-warning-text">
                        <Clock className="w-4 h-4" />
                    </div>
                </Card>

                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Fully Received</p>
                        <p className="text-xl font-bold font-display text-success-text mt-1">{stats.received}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-success/10 text-success-text">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </Card>

                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Total Spend</p>
                        <p className="text-sm font-semibold font-mono text-text-primary mt-2">{UGX(stats.value)}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-info/10 text-info">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                </Card>
            </div>

            {/* ── Search and Filtering Controls ─────────────────────────────── */}
            <Card className="p-4 bg-bg-surface border-border-subtle flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent shrink-0" />
                    <h3 className="text-sm font-semibold text-text-primary">Search & Filter Orders</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search by PO or name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Quick search</label>
                        <input
                            type="text"
                            placeholder="Search by ID, supplier, branch..."
                            className="h-9 px-3 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                            value={searchQuery.trim() === "" ? "" : searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Supplier Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Supplier</label>
                        <CustomSelect
                            id="supplier-filter-select"
                            value={supplierFilter}
                            onChange={setSupplierFilter}
                            options={[
                                { value: "all", label: "All Suppliers" },
                                ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
                            ]}
                        />
                    </div>

                    {/* Branch Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Branch</label>
                        <CustomSelect
                            id="branch-filter-select"
                            value={branchFilter}
                            onChange={setBranchFilter}
                            options={[
                                { value: "all", label: "All Branches" },
                                ...branches.map((b) => ({ value: String(b.id), label: b.name })),
                            ]}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Order Status</label>
                        <CustomSelect
                            id="status-filter-select"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "all", label: "All Statuses" },
                                { value: "draft", label: "Draft" },
                                { value: "sent", label: "Sent" },
                                { value: "received", label: "Received" },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* ── Table Grid of Orders ──────────────────────────────────────── */}
            <Card className="bg-bg-surface border-border-subtle overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-surface/50">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-text-primary">Order History Ledger</span>
                    </div>
                    <span className="text-xs text-text-tertiary font-mono">
                        Showing {filteredOrders.length} of {purchaseOrders.length} POs
                    </span>
                </div>

                {isOrdersLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border-subtle bg-bg-elevated/40 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                                    <th className="py-3.5 px-6">Order ID</th>
                                    <th className="py-3.5 px-4">Supplier</th>
                                    <th className="py-3.5 px-4">Branch</th>
                                    <th className="py-3.5 px-4 text-right">Value (UGX)</th>
                                    <th className="py-3.5 px-4">Order Date</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-6 w-12" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle/55">
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="group hover:bg-bg-elevated/40 cursor-pointer transition-colors"
                                    >
                                        <td className="py-4 px-6 font-mono font-bold text-accent-text group-hover:underline">
                                            PO-#{order.id}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-semibold text-text-primary">
                                            {order.supplier_name}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-text-secondary">
                                            {order.branch_name}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-right font-mono font-semibold text-text-primary">
                                            {UGX(order.total_value ?? 0)}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-text-tertiary">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] px-2.5 py-0.5 rounded-full font-bold border-none",
                                                    order.status === "received" && "bg-success/15 text-success-text",
                                                    order.status === "sent" && "bg-accent/15 text-accent-text",
                                                    order.status === "draft" && "bg-text-tertiary/15 text-text-secondary"
                                                )}
                                            >
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <div className="h-12 w-12 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto text-text-tertiary mb-3">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-text-primary">No purchase orders found</p>
                        <p className="text-xs text-text-tertiary mt-1">
                            Adjust filters or create a purchase order from the Suppliers ledger.
                        </p>
                    </div>
                )}
            </Card>

            {/* ── Order Detail Drawer ────────────────────────────────────────── */}
            <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <SheetContent className="w-full sm:max-w-[500px] bg-bg-surface border-border-subtle p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-border-subtle bg-bg-elevated/20">
                        <SheetTitle className="text-lg font-bold font-display text-text-primary">
                            Purchase Order PO-#{selectedOrder?.id}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-text-tertiary">
                            Created on {formatDate(selectedOrder?.created_at)}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Workflow Stepper */}
                            <div className="bg-bg-elevated/40 border border-border-subtle rounded-xl p-4 space-y-3">
                                <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                                    Order Process Flow
                                </h4>
                                <div className="flex items-center justify-between text-center relative mt-2 px-2">
                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                                selectedOrder.status === "draft" || selectedOrder.status === "sent" || selectedOrder.status === "received"
                                                    ? "bg-text-secondary text-white border-text-secondary"
                                                    : "bg-bg-surface border-border-subtle text-text-tertiary"
                                            )}
                                        >
                                            1
                                        </div>
                                        <span className="text-[10px] font-medium text-text-secondary">Draft</span>
                                    </div>

                                    <div className="flex-1 h-[2px] bg-border-subtle absolute left-8 right-8 top-3" />

                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                                selectedOrder.status === "sent" || selectedOrder.status === "received"
                                                    ? "bg-accent text-white border-accent"
                                                    : "bg-bg-surface border-border-subtle text-text-tertiary"
                                            )}
                                        >
                                            2
                                        </div>
                                        <span className="text-[10px] font-medium text-text-secondary">Sent</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5 z-10">
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                                selectedOrder.status === "received"
                                                    ? "bg-success text-white border-success"
                                                    : "bg-bg-surface border-border-subtle text-text-tertiary"
                                            )}
                                        >
                                            3
                                        </div>
                                        <span className="text-[10px] font-medium text-text-secondary">Received</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Card Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-bg-elevated border border-border-subtle rounded-xl flex items-start gap-2.5">
                                    <Truck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-text-tertiary">Supplier</p>
                                        <p className="text-xs font-semibold text-text-primary mt-0.5">{selectedOrder.supplier_name}</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-bg-elevated border border-border-subtle rounded-xl flex items-start gap-2.5">
                                    <Building2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-text-tertiary">Destination Shop</p>
                                        <p className="text-xs font-semibold text-text-primary mt-0.5">{selectedOrder.branch_name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Line Items Table */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
                                    Line Items list
                                </h4>
                                <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-surface">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-bg-elevated/50 border-b border-border-subtle text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                                                <th className="py-2.5 px-4">Item</th>
                                                <th className="py-2.5 px-3 text-center">Qty</th>
                                                <th className="py-2.5 px-3 text-right">Cost</th>
                                                <th className="py-2.5 px-4 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-subtle/50">
                                            {selectedOrder.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-bg-elevated/20">
                                                    <td className="py-3 px-4 font-semibold text-text-primary">
                                                        {item.product_name || "Unknown Product"}
                                                        <span className="block text-[10px] font-mono text-text-tertiary mt-0.5 font-normal">
                                                            SKU: {item.product_sku || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-mono text-text-secondary">
                                                        {UGX(item.unit_cost)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-semibold text-text-primary">
                                                        {UGX(item.quantity * item.unit_cost)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-bg-elevated/20 border-t border-border-subtle">
                                                <td colSpan={3} className="py-3 px-4 text-right font-semibold text-text-secondary">
                                                    Total Cost
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-text-primary text-sm">
                                                    {UGX(selectedOrder.total_value ?? 0)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Inventory status update logic */}
                            {selectedOrder.status === "received" && (
                                <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-success-text shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-success-text">Order Received & Stock Updated</p>
                                        <p className="text-[11px] text-text-tertiary mt-1">
                                            Stock levels for the items above have been increased automatically at the destination branch. A stock entry audit record has been logged.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Status transitions workflow controls */}
                            {isAdminOrManager && selectedOrder.status !== "received" && (
                                <div className="bg-accent-muted/10 border border-accent/20 rounded-xl p-4 space-y-3">
                                    <h4 className="text-xs font-semibold text-accent-text flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-accent" />
                                        Administrative Actions
                                    </h4>
                                    <p className="text-[11px] text-text-tertiary">
                                        Advance order status logic. Transitioning to <span className="font-semibold text-success-text">Received</span> will atomically increment inventory stock levels.
                                    </p>

                                    <div className="flex flex-col gap-2 pt-1">
                                        {selectedOrder.status === "draft" && (
                                            <Button
                                                onClick={() => handleStatusTransition("sent")}
                                                disabled={updateStatusMutation.isPending}
                                                className="w-full bg-accent hover:bg-accent-hover text-white text-xs h-9 font-semibold gap-1.5"
                                            >
                                                Mark as Sent to Supplier
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Button>
                                        )}

                                        {(selectedOrder.status === "draft" || selectedOrder.status === "sent") && (
                                            <Button
                                                onClick={() => handleStatusTransition("received")}
                                                disabled={updateStatusMutation.isPending}
                                                className="w-full bg-success text-white hover:bg-success-hover text-xs h-9 font-semibold gap-1.5"
                                            >
                                                Mark as Received & Update Stocks
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {!isAdminOrManager && selectedOrder.status !== "received" && (
                                <div className="flex items-center gap-2.5 p-3.5 bg-warning-muted/10 border border-warning/30 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-warning-text shrink-0" />
                                    <p className="text-[10px] text-text-tertiary">
                                        Orders can only be transitioned by admins or managers.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
