"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { useInventoryStore } from "@/store/inventory-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    Landmark,
    CheckCircle2,
    Clock,
    User,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const UGX = (n: number) =>
    new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
        maximumFractionDigits: 0,
    }).format(n);

export function CustomerDrawer() {
    const queryClient = useQueryClient();
    const {
        isCustomerDrawerOpen,
        selectedCustomerId,
        closeCustomerDrawer,
        setCustomerModalOpen,
    } = useInventoryStore();

    const [isPaying, setIsPaying] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    // ── Queries ──────────────────────────────────────────────────────────────
    const { data: customer, isLoading } = useQuery({
        queryKey: ["customer", selectedCustomerId],
        queryFn: () =>
            selectedCustomerId
                ? stakeholderService.getCustomer(selectedCustomerId)
                : null,
        enabled: !!selectedCustomerId && isCustomerDrawerOpen,
    });

    const { data: payments = [], isFetching: isFetchingHistory } = useQuery({
        queryKey: ["customer-payments", selectedCustomerId],
        queryFn: () => stakeholderService.getCustomerPayments(selectedCustomerId!),
        enabled: !!selectedCustomerId && isCustomerDrawerOpen && showHistory,
    });

    // ── Payment mutation (uses dedicated endpoint) ────────────────────────────
    const paymentMutation = useMutation({
        mutationFn: (data: { amount: number; note?: string }) =>
            stakeholderService.recordPayment(selectedCustomerId!, data),
        onSuccess: (res) => {
            toast.success("Payment recorded", {
                description: `Outstanding balance updated to ${UGX(
                    Number(res.customer.outstandingBalance)
                )}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["customer", selectedCustomerId] });
            queryClient.invalidateQueries({ queryKey: ["customer-payments", selectedCustomerId] });
            setIsPaying(false);
            setPaymentAmount("");
            setPaymentNote("");
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (err as any)?.response?.data?.error ?? "Failed to record payment.";
            toast.error(msg);
        },
    });

    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        const amount = Number(paymentAmount);
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid payment amount.");
            return;
        }
        paymentMutation.mutate({ amount, note: paymentNote });
    };

    const handleSettleFull = () => {
        if (!customer || customer.outstandingBalance <= 0) return;
        if (
            !confirm(
                `Settle the full outstanding balance of ${UGX(customer.outstandingBalance)} for ${customer.companyName}?`
            )
        )
            return;
        paymentMutation.mutate({
            amount: customer.outstandingBalance,
            note: "Full balance settlement",
        });
    };

    const handleClose = () => {
        closeCustomerDrawer();
        setIsPaying(false);
        setPaymentAmount("");
        setPaymentNote("");
        setShowHistory(false);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <Sheet open={isCustomerDrawerOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent className="w-full sm:max-w-[480px] bg-bg-surface border-border-subtle p-0 flex flex-col">
                <SheetTitle className="sr-only">
                    {customer ? customer.companyName : "Customer Details"}
                </SheetTitle>
                <SheetDescription className="sr-only">
                    {customer
                        ? `Details and payment history for ${customer.companyName}`
                        : "Loading customer details..."}
                </SheetDescription>

                {isLoading ? (
                    <div className="p-6 flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                    </div>
                ) : customer ? (
                    <>
                        {/* ── Header ────────────────────────────────────────── */}
                        <SheetHeader className="p-6 border-b border-border-subtle">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-xl font-semibold text-text-primary font-display">
                                        {customer.companyName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-text-secondary mt-1 text-sm">
                                        <User className="w-3.5 h-3.5" />
                                        {customer.contactPerson}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        closeCustomerDrawer();
                                        setCustomerModalOpen(true, customer);
                                    }}
                                    className="text-xs text-text-secondary hover:text-text-primary border border-border-subtle rounded-lg h-8 px-3"
                                >
                                    Edit
                                </Button>
                            </div>
                        </SheetHeader>

                        {/* ── Body ──────────────────────────────────────────── */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">

                            {/* KPI cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1">
                                        Lifetime Value
                                    </p>
                                    <p className="text-base font-mono font-bold text-success-text">
                                        {UGX(customer.lifetimeValue)}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        "p-4 rounded-xl border",
                                        customer.outstandingBalance > 0
                                            ? "bg-danger/5 border-danger/20"
                                            : "bg-bg-elevated border-border-subtle"
                                    )}
                                >
                                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1">
                                        Outstanding Balance
                                    </p>
                                    <p
                                        className={cn(
                                            "text-base font-mono font-bold",
                                            customer.outstandingBalance > 0
                                                ? "text-danger-text"
                                                : "text-text-tertiary"
                                        )}
                                    >
                                        {UGX(customer.outstandingBalance)}
                                    </p>
                                </div>
                            </div>

                            {/* ── Payment section ──────────────────────────── */}
                            {customer.outstandingBalance > 0 ? (
                                <div className="rounded-xl border border-accent/15 bg-bg-elevated/40 overflow-hidden">
                                    {/* Section header */}
                                    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border-subtle">
                                        <Landmark className="w-4 h-4 text-accent shrink-0" />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-text-primary">
                                                Record Payment
                                            </h4>
                                            <p className="text-xs text-text-tertiary mt-0.5">
                                                Reduce debt by registering a payment received.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-3">
                                        {!isPaying ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => setIsPaying(true)}
                                                    className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-lg h-9 text-xs font-semibold"
                                                >
                                                    Enter Amount
                                                </Button>
                                                <Button
                                                    onClick={handleSettleFull}
                                                    disabled={paymentMutation.isPending}
                                                    variant="outline"
                                                    className="flex-1 border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/50 rounded-lg h-9 text-xs font-semibold gap-1.5"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Settle Full Balance
                                                </Button>
                                            </div>
                                        ) : (
                                            <form
                                                onSubmit={handleRecordPayment}
                                                className="flex flex-col gap-3"
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-medium text-text-secondary">
                                                        Amount Received (UGX){" "}
                                                        <span className="text-danger-text">*</span>
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        value={paymentAmount}
                                                        onChange={(e) =>
                                                            setPaymentAmount(e.target.value)
                                                        }
                                                        placeholder={`Max ${UGX(customer.outstandingBalance)}`}
                                                        max={customer.outstandingBalance}
                                                        min="1"
                                                        required
                                                        className="h-9 rounded-lg"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-medium text-text-secondary">
                                                        Note (optional)
                                                    </label>
                                                    <Input
                                                        value={paymentNote}
                                                        onChange={(e) =>
                                                            setPaymentNote(e.target.value)
                                                        }
                                                        placeholder="e.g. Cash via MTN Mobile Money"
                                                        className="h-9 rounded-lg"
                                                        maxLength={255}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={paymentMutation.isPending}
                                                        className="bg-success text-white hover:bg-success-hover text-xs h-9 px-4 rounded-lg"
                                                    >
                                                        {paymentMutation.isPending
                                                            ? "Saving…"
                                                            : "Confirm Payment"}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsPaying(false);
                                                            setPaymentAmount("");
                                                            setPaymentNote("");
                                                        }}
                                                        variant="ghost"
                                                        className="text-text-secondary hover:text-text-primary text-xs h-9 px-3 rounded-lg"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-xl border border-success/20 bg-success/5">
                                    <CheckCircle2 className="w-5 h-5 text-success-text shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-success-text">
                                            No outstanding balance
                                        </p>
                                        <p className="text-xs text-text-tertiary mt-0.5">
                                            This customer has no pending debt.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Payment history ──────────────────────────── */}
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setShowHistory((v) => !v)}
                                    className="w-full flex items-center justify-between px-1 py-1 text-xs font-semibold text-text-tertiary uppercase tracking-widest hover:text-text-secondary transition-colors"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Payment History
                                    </span>
                                    {showHistory ? (
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                </button>

                                {showHistory && (
                                    <div className="border border-border-subtle rounded-xl overflow-hidden">
                                        {isFetchingHistory ? (
                                            <div className="flex justify-center py-6">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
                                            </div>
                                        ) : payments.length > 0 ? (
                                            <div className="divide-y divide-border-subtle">
                                                {payments.map((p) => (
                                                    <div
                                                        key={p.id}
                                                        className="flex items-center justify-between px-4 py-3 hover:bg-bg-elevated transition-colors"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-mono font-semibold text-success-text">
                                                                +{UGX(Number(p.amount))}
                                                            </p>
                                                            <p className="text-xs text-text-tertiary mt-0.5 truncate max-w-[200px]">
                                                                {p.note || "—"}
                                                            </p>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-3">
                                                            <p className="text-xs text-text-secondary">
                                                                {new Date(p.created_at).toLocaleDateString(
                                                                    "en-GB",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </p>
                                                            {p.recorded_by_name && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-[9px] mt-0.5"
                                                                >
                                                                    {p.recorded_by_name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-6 text-center text-xs text-text-tertiary">
                                                No payments recorded yet.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Contact */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-widest">
                                    Contact
                                </h4>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle">
                                    <Mail className="w-4 h-4 text-text-tertiary" />
                                    <span className="text-sm text-text-primary">
                                        {customer.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer ────────────────────────────────────────── */}
                        <div className="p-6 border-t border-border-subtle mt-auto">
                            <Button
                                onClick={() => {
                                    closeCustomerDrawer();
                                    window.location.href = `/pos?customer=${customer.id}`;
                                }}
                                className="w-full bg-bg-elevated hover:bg-bg-elevated/80 border border-border-subtle text-text-primary font-semibold h-11 rounded-xl flex items-center justify-center gap-2"
                            >
                                <Landmark className="w-4 h-4 text-accent" />
                                Go to POS to sell on credit
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 flex items-center justify-center h-full text-text-secondary">
                        Customer not found.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
