"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { salesService, branchService, stakeholderService } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CustomSelect } from "@/components/ui/custom-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
    Receipt,
    Filter,
    Calendar,
    Building2,
    Clock,
    CheckCircle2,
    Search,
    ChevronRight,
    TrendingUp,
    AlertCircle,
    UserCheck,
    Coins,
    DollarSign,
    User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Format UGX currency
const UGX = (n: number) =>
    new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
    }).format(n);

export default function SalesPage() {
    const { user } = useAuthStore();
    const role = user?.role ?? "staff";

    // ── Filters State ────────────────────────────────────────────────────────
    const [branchFilter, setBranchFilter] = useState<string>("all");
    const [customerFilter, setCustomerFilter] = useState<string>("all");
    const [methodFilter, setMethodFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // ── Pagination State ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 10;

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [branchFilter, customerFilter, methodFilter, statusFilter, searchQuery]);

    // ── Selected Sale for Detail Drawer ──────────────────────────────────────
    const [selectedSale, setSelectedSale] = useState<any | null>(null);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: sales = [], isLoading: isSalesLoading } = useQuery({
        queryKey: ["sales"],
        queryFn: () => salesService.getSales(),
    });

    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: () => branchService.getBranches(),
    });

    const { data: customers = [] } = useQuery({
        queryKey: ["customers"],
        queryFn: () => stakeholderService.getCustomers(),
    });

    // ── Computed Filtered Sales ──────────────────────────────────────────────
    const filteredSales = useMemo(() => {
        return sales.filter((sale: any) => {
            const matchBranch = branchFilter === "all" || String(sale.branch) === branchFilter;
            const matchCustomer = customerFilter === "all" || String(sale.customer) === customerFilter;
            const matchMethod = methodFilter === "all" || sale.payment_method === methodFilter;
            
            let matchStatus = true;
            if (statusFilter === "paid") {
                matchStatus = sale.is_paid === true;
            } else if (statusFilter === "unpaid") {
                matchStatus = sale.is_paid === false;
            }

            const searchLower = searchQuery.toLowerCase().trim();
            const matchSearch =
                !searchLower ||
                String(sale.id).includes(searchLower) ||
                (sale.customer_name && sale.customer_name.toLowerCase().includes(searchLower)) ||
                (sale.branch_name && sale.branch_name.toLowerCase().includes(searchLower)) ||
                (sale.items && sale.items.some((item: any) => 
                    item.product_name && item.product_name.toLowerCase().includes(searchLower)
                ));

            return matchBranch && matchCustomer && matchMethod && matchStatus && matchSearch;
        });
    }, [sales, branchFilter, customerFilter, methodFilter, statusFilter, searchQuery]);

    // ── Paginated Sales ──────────────────────────────────────────────────────
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSales.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSales, currentPage]);

    // ── Real-time KPI Stats ──────────────────────────────────────────────────
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let cashRevenue = 0;
        let creditRevenue = 0;
        let unpaidCredit = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        filteredSales.forEach((sale: any) => {
            const total = Number(sale.total_amount) || 0;
            const paid = Number(sale.paid_amount) || 0;
            totalRevenue += total;

            if (sale.payment_method === "credit") {
                creditRevenue += total;
                unpaidCredit += (total - paid);
            } else {
                cashRevenue += total;
            }

            if (sale.is_paid) {
                paidCount += 1;
            } else {
                unpaidCount += 1;
            }
        });

        return {
            totalRevenue,
            cashRevenue,
            creditRevenue,
            unpaidCredit,
            paidCount,
            unpaidCount,
            totalCount: filteredSales.length,
        };
    }, [filteredSales]);

    // Helper: format dates
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

    const formatDueDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="flex flex-col gap-6 p-1 sm:p-0">
            {/* Header */}
            <PageHeader
                title="Sales & Invoices Ledger"
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Sales Ledger" }]}
                action={
                    <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-surface border border-border-subtle px-3 py-1.5 rounded-lg shadow-sm">
                        <UserCheck className="w-3.5 h-3.5 text-accent" />
                        Role: <span className="font-semibold capitalize text-text-primary">{role}</span>
                    </div>
                }
            />

            {/* ── KPI Dashboard Widgets ────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24 shadow-sm hover:border-border-strong transition-all">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Total Revenue</p>
                        <p className="text-lg font-bold font-mono text-text-primary mt-1">{UGX(stats.totalRevenue)}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-accent/10 text-accent">
                        <Coins className="w-4 h-4" />
                    </div>
                </Card>

                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24 shadow-sm hover:border-border-strong transition-all">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Cash Sales</p>
                        <p className="text-lg font-bold font-mono text-success-text mt-1">{UGX(stats.cashRevenue)}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-success/10 text-success-text">
                        <DollarSign className="w-4 h-4" />
                    </div>
                </Card>

                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24 shadow-sm hover:border-border-strong transition-all">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Credit Balance Due</p>
                        <p className="text-lg font-bold font-mono text-warning-text mt-1">{UGX(stats.unpaidCredit)}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-warning/10 text-warning-text">
                        <Clock className="w-4 h-4" />
                    </div>
                </Card>

                <Card className="p-4 bg-bg-surface border-border-subtle relative overflow-hidden flex flex-col justify-between h-24 shadow-sm hover:border-border-strong transition-all">
                    <div>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-semibold">Transactions</p>
                        <p className="text-lg font-bold font-display text-text-primary mt-1">{stats.totalCount}</p>
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-info/10 text-info">
                        <Receipt className="w-4 h-4" />
                    </div>
                </Card>
            </div>

            {/* ── Filtering Controls ────────────────────────────────────────── */}
            <Card className="p-4 bg-bg-surface border-border-subtle flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent shrink-0" />
                    <h3 className="text-sm font-semibold text-text-primary">Search & Filter Sales</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Quick search</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search INV ID, item..."
                                className="h-9 w-full pl-8 pr-3 text-xs bg-bg-elevated border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                id="sales-search-input"
                            />
                            <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Branch Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Branch / Shop</label>
                        <CustomSelect
                            id="sales-branch-filter"
                            value={branchFilter}
                            onChange={setBranchFilter}
                            options={[
                                { value: "all", label: "All Branches" },
                                ...branches.map((b) => ({ value: String(b.id), label: b.name })),
                            ]}
                        />
                    </div>

                    {/* Customer Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Customer</label>
                        <CustomSelect
                            id="sales-customer-filter"
                            value={customerFilter}
                            onChange={setCustomerFilter}
                            options={[
                                { value: "all", label: "All Customers" },
                                ...customers.map((c) => ({ value: String(c.id), label: c.companyName || c.contactPerson })),
                            ]}
                        />
                    </div>

                    {/* Payment Method Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Payment Method</label>
                        <CustomSelect
                            id="sales-method-filter"
                            value={methodFilter}
                            onChange={setMethodFilter}
                            options={[
                                { value: "all", label: "All Methods" },
                                { value: "cash", label: "Cash" },
                                { value: "credit", label: "On Credit" },
                            ]}
                        />
                    </div>

                    {/* Paid Status Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-text-secondary uppercase">Settle Status</label>
                        <CustomSelect
                            id="sales-status-filter"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: "all", label: "All Statuses" },
                                { value: "paid", label: "Fully Settled / Paid" },
                                { value: "unpaid", label: "Pending Repayment" },
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* ── Sales Ledger Table ────────────────────────────────────────── */}
            <Card className="bg-bg-surface border-border-subtle overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-surface/50">
                    <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-text-primary">Sales Ledger</span>
                    </div>
                    <span className="text-xs text-text-tertiary font-mono">
                        Showing {filteredSales.length} of {sales.length} invoices
                    </span>
                </div>

                {isSalesLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    </div>
                ) : paginatedSales.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-subtle bg-bg-elevated/40 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                                        <th className="py-3.5 px-6">Invoice ID</th>
                                        <th className="py-3.5 px-4">Date & Time</th>
                                        <th className="py-3.5 px-4">Branch</th>
                                        <th className="py-3.5 px-4">Customer</th>
                                        <th className="py-3.5 px-4">Method</th>
                                        <th className="py-3.5 px-4 text-center">Status</th>
                                        <th className="py-3.5 px-4 text-right">Amount</th>
                                        <th className="py-3.5 px-6 w-12" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle/55">
                                    {paginatedSales.map((sale: any) => (
                                        <tr
                                            key={sale.id}
                                            onClick={() => setSelectedSale(sale)}
                                            className="group hover:bg-bg-elevated/40 cursor-pointer transition-colors"
                                        >
                                            <td className="py-4 px-6 font-mono font-bold text-accent-text group-hover:underline">
                                                INV-#{sale.id}
                                            </td>
                                            <td className="py-4 px-4 text-xs text-text-tertiary">
                                                {formatDate(sale.timestamp)}
                                            </td>
                                            <td className="py-4 px-4 text-xs text-text-secondary">
                                                {sale.branch_name || "—"}
                                            </td>
                                            <td className="py-4 px-4 text-xs font-semibold text-text-primary">
                                                {sale.customer_name || <span className="text-text-tertiary font-normal italic">Walk-in Customer</span>}
                                            </td>
                                            <td className="py-4 px-4 text-xs">
                                                <span className="capitalize">{sale.payment_method}</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] px-2.5 py-0.5 rounded-full font-bold border-none",
                                                        sale.is_paid ? "bg-success/15 text-success-text" : "bg-warning/15 text-warning-text"
                                                    )}
                                                >
                                                    {sale.is_paid ? "Settled" : "Pending"}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4 text-xs text-right font-mono font-semibold text-text-primary">
                                                {UGX(Number(sale.total_amount) || 0)}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between bg-bg-surface/50 text-xs">
                            <span className="text-text-tertiary">
                                Showing <span className="font-semibold text-text-secondary">{filteredSales.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                                <span className="font-semibold text-text-secondary">{Math.min(currentPage * itemsPerPage, filteredSales.length)}</span> of{" "}
                                <span className="font-semibold text-text-secondary">{filteredSales.length}</span> invoices
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-3 text-xs border-border-strong text-text-secondary hover:text-text-primary disabled:opacity-40"
                                >
                                    Previous
                                </Button>
                                <span className="text-text-secondary font-medium font-mono px-2">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 px-3 text-xs border-border-strong text-text-secondary hover:text-text-primary disabled:opacity-40"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-24 text-center">
                        <div className="h-12 w-12 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto text-text-tertiary mb-3">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-text-primary">No sales transactions found</p>
                        <p className="text-xs text-text-tertiary mt-1">
                            Adjust filters or create a transaction in the POS page.
                        </p>
                    </div>
                )}
            </Card>

            {/* ── Invoice Detail Drawer ──────────────────────────────────────── */}
            <Sheet open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
                <SheetContent className="w-full sm:max-w-[500px] bg-bg-surface border-border-subtle p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-border-subtle bg-bg-elevated/20">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-lg font-bold font-display text-text-primary">
                                Invoice INV-#{selectedSale?.id}
                            </SheetTitle>
                            <Badge
                                className={cn(
                                    "text-[10px] px-2.5 py-0.5 rounded-full font-bold border-none",
                                    selectedSale?.is_paid ? "bg-success/15 text-success-text" : "bg-warning/15 text-warning-text"
                                )}
                            >
                                {selectedSale?.is_paid ? "Settled" : "Pending Payment"}
                            </Badge>
                        </div>
                        <SheetDescription className="text-xs text-text-tertiary">
                            Processed on {formatDate(selectedSale?.timestamp)}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedSale && (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Workflow status */}
                            <div className="bg-bg-elevated/40 border border-border-subtle rounded-xl p-4 space-y-3">
                                <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                                    Payment Breakdown
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                                    <div>
                                        <p className="text-text-tertiary">Paid Amount</p>
                                        <p className="font-semibold text-success-text font-mono text-sm mt-0.5">
                                            {UGX(Number(selectedSale.paid_amount) || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-tertiary">Remaining Balance</p>
                                        <p className="font-semibold text-warning-text font-mono text-sm mt-0.5">
                                            {UGX(Math.max(0, Number(selectedSale.total_amount) - (Number(selectedSale.paid_amount) || 0)))}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Card Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-bg-elevated border border-border-subtle rounded-xl flex items-start gap-2.5">
                                    <User className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-text-tertiary">Customer</p>
                                        <p className="text-xs font-semibold text-text-primary mt-0.5">
                                            {selectedSale.customer_name || "Walk-in Customer"}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-bg-elevated border border-border-subtle rounded-xl flex items-start gap-2.5">
                                    <Building2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-text-tertiary">Branch / Shop</p>
                                        <p className="text-xs font-semibold text-text-primary mt-0.5">{selectedSale.branch_name || "—"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Terms section for credit sales */}
                            {selectedSale.payment_method === "credit" && (
                                <div className={cn(
                                    "p-3.5 border rounded-xl flex items-start gap-3",
                                    selectedSale.is_paid ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"
                                )}>
                                    {selectedSale.is_paid ? (
                                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                    ) : (
                                        <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                    )}
                                    <div className="text-xs">
                                        <p className={cn("font-bold", selectedSale.is_paid ? "text-success-text" : "text-warning-text")}>
                                            {selectedSale.is_paid ? "Credit Term Succeeded" : "Outstanding Credit Account"}
                                        </p>
                                        <p className="text-text-tertiary mt-1">
                                            Due date was set to <span className="font-semibold text-text-secondary">{formatDueDate(selectedSale.due_date)}</span>.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Line Items Table */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
                                    Purchased Items
                                </h4>
                                <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-surface">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-bg-elevated/50 border-b border-border-subtle text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                                                <th className="py-2.5 px-4">Item</th>
                                                <th className="py-2.5 px-3 text-center">Qty</th>
                                                <th className="py-2.5 px-3 text-right">Unit Price</th>
                                                <th className="py-2.5 px-4 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-subtle/50">
                                            {selectedSale.items && selectedSale.items.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-bg-elevated/20">
                                                    <td className="py-3 px-4 font-semibold text-text-primary">
                                                        {item.product_name || "Unknown Product"}
                                                    </td>
                                                    <td className="py-3 px-3 text-center font-mono">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-mono text-text-secondary">
                                                        {UGX(Number(item.unit_price) || 0)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-semibold text-text-primary">
                                                        {UGX((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-bg-elevated/20 border-t border-border-subtle">
                                                <td colSpan={3} className="py-3 px-4 text-right font-semibold text-text-secondary">
                                                    Grand Total
                                                </td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-text-primary text-sm">
                                                    {UGX(Number(selectedSale.total_amount) || 0)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
