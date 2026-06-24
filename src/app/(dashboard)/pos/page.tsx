"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, stakeholderService, salesService, branchService } from "@/services/api";
import { useBranchStore } from "@/store/branch-store";
import { Product, Customer } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { CustomerModal } from "@/components/features/customers/customer-modal";
import {
    Plus,
    Minus,
    Trash2,
    Search,
    ShoppingCart,
    UserPlus,
    Check,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface CartItem {
    product: Product;
    quantity: number;
}

function POSContent() {
    const queryClient = useQueryClient();
    const { activeBranch } = useBranchStore();

    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
        searchParams.get("customer") ?? "guest"
    );
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit">("cash");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [dueDate, setDueDate] = useState("");

    const handleCustomerChange = (val: string) => {
        setSelectedCustomerId(val);
        if (val === "guest") setPaymentMethod("cash");
    };

    const { data: products = [], isLoading: isProductsLoading } = useQuery({
        queryKey: ["products", activeBranch],
        queryFn: () => inventoryService.getProducts(activeBranch),
    });

    const { data: customers = [], isLoading: isCustomersLoading } = useQuery({
        queryKey: ["customers"],
        queryFn: () => stakeholderService.getCustomers(),
    });

    // Once customers load, validate that the URL-provided ID actually exists.
    // If it doesn't (deleted/wrong ID), fall back gracefully to "guest".
    useEffect(() => {
        const urlCustomerId = searchParams.get("customer");
        if (!urlCustomerId || customers.length === 0) return;
        const exists = customers.some((c) => String(c.id) === urlCustomerId);
        if (exists) {
            setSelectedCustomerId(urlCustomerId);
        } else {
            setSelectedCustomerId("guest");
        }
    }, [customers, searchParams]);

    const { data: branches = [] } = useQuery({
        queryKey: ["branches"],
        queryFn: () => branchService.getBranches(),
    });

    const currentBranchName = useMemo(() => {
        const active = branches.find((b) => String(b.id) === activeBranch);
        return active ? active.name : "Active Shop";
    }, [branches, activeBranch]);

    const getBranchStock = (product: Product): number => {
        if (activeBranch === "all") return product.stockQty || 0;
        const branchStock = product.stocks?.find((s) => String(s.branch) === activeBranch);
        return branchStock ? branchStock.quantity : 0;
    };

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.sku.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const addToCart = (product: Product) => {
        const maxStock = getBranchStock(product);
        if (maxStock <= 0) {
            toast.error("Out of stock", {
                description: `"${product.name}" has no available stock at this branch.`,
            });
            return;
        }
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= maxStock) {
                    toast.error("Insufficient stock", {
                        description: `Cannot add more than the available ${maxStock} items.`,
                    });
                    return prev;
                }
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setSearchQuery("");
    };

    const updateQuantity = (productId: string, amount: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.product.id === productId) {
                        const nextQty = item.quantity + amount;
                        const maxStock = getBranchStock(item.product);
                        if (nextQty > maxStock) {
                            toast.error("Limit exceeded", {
                                description: `Only ${maxStock} units of "${item.product.name}" are available.`,
                            });
                            return item;
                        }
                        return { ...item, quantity: nextQty };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
        toast.success("Item removed from cart");
    };

    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);

    const checkoutMutation = useMutation({
        mutationFn: (payload: any) => salesService.createSale(payload),
        onSuccess: () => {
            toast.success("Transaction completed", {
                description: `Receipt generated for ${currentBranchName}`,
            });
            setCart([]);
            setSelectedCustomerId("guest");
            setPaymentMethod("cash");
            setDueDate("");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.items || err.message;
            toast.error("Checkout failed", { description: String(errorMsg) });
        },
    });

    const handleCheckout = () => {
        if (cart.length === 0) { toast.error("Cart is empty"); return; }
        if (activeBranch === "all") {
            toast.error("Select a specific branch", {
                description: "Select a branch in the topbar before recording a sale.",
            });
            return;
        }
        if (paymentMethod === "credit" && !dueDate) {
            toast.error("Due date is required", {
                description: "Please select a due date for credit sales.",
            });
            return;
        }
        checkoutMutation.mutate({
            branch: Number(activeBranch),
            customer: selectedCustomerId === "guest" ? null : Number(selectedCustomerId),
            total_amount: cartTotals.total,
            payment_method: paymentMethod,
            due_date: paymentMethod === "credit" ? dueDate : null,
            items: cart.map((item) => ({
                product: Number(item.product.id),
                quantity: item.quantity,
                unit_price: Number(item.product.price),
                subtotal: Number(item.product.price * item.quantity),
            })),
        });
    };

    const formatUGX = (amount: number) =>
        new Intl.NumberFormat("en-UG", {
            style: "currency",
            currency: "UGX",
            maximumFractionDigits: 0,
        }).format(amount);

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="POS Counter Checkout"
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "POS" }]}
                action={
                    <Badge variant="outline" className="px-3 py-1 bg-accent-muted border-accent/20 text-accent-text font-medium text-sm">
                        {currentBranchName}
                    </Badge>
                }
            />

            {activeBranch === "all" && (
                <div className="p-4 bg-warning-muted/10 border border-warning/30 rounded-md flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-warning-text shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-warning-text">Branch selection required</p>
                        <p className="text-sm text-text-secondary mt-0.5">
                            Choose a specific branch from the topbar before processing sales.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Left: Search + Cart */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Search */}
                    <Card className="p-4 bg-bg-surface border border-border-subtle relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search by barcode, SKU or product name…"
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={activeBranch === "all"}
                            />
                        </div>

                        {searchQuery.trim() && (
                            <div className="absolute left-4 right-4 top-[68px] z-50 bg-bg-elevated border border-border-subtle rounded-md shadow-lg max-h-64 overflow-y-auto">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => {
                                        const stock = getBranchStock(product);
                                        const isOutOfStock = stock <= 0;
                                        return (
                                            <button
                                                key={product.id}
                                                onClick={() => addToCart(product)}
                                                disabled={isOutOfStock}
                                                className="w-full flex items-center justify-between px-4 py-3 border-b border-border-subtle/50 last:border-0 hover:bg-bg-surface text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">{product.name}</p>
                                                    <p className="text-xs text-text-tertiary font-mono">{product.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-mono font-medium text-accent-text">{formatUGX(product.price)}</p>
                                                    <span className={cn(
                                                        "text-xs font-medium",
                                                        isOutOfStock ? "text-danger-text" : stock <= product.threshold ? "text-warning-text" : "text-success-text"
                                                    )}>
                                                        {isOutOfStock ? "Out of stock" : `${stock} in stock`}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-6 text-center text-sm text-text-tertiary">
                                        No products found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Cart */}
                    <Card className="p-6 bg-bg-surface border border-border-subtle flex flex-col min-h-[320px]">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-accent" />
                                <h3 className="text-sm font-semibold text-text-primary">Cart</h3>
                            </div>
                            <span className="text-xs text-text-tertiary">{cart.length} {cart.length === 1 ? "item" : "items"}</span>
                        </div>

                        {cart.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-3">
                                <div className="h-10 w-10 rounded-md bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-tertiary">
                                    <ShoppingCart className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">Cart is empty</p>
                                    <p className="text-xs text-text-tertiary mt-1">Search for products above to add them here.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border-subtle text-xs font-medium uppercase tracking-wider text-text-tertiary">
                                            <th className="pb-3">Product</th>
                                            <th className="pb-3 text-center">Qty</th>
                                            <th className="pb-3 text-right">Price</th>
                                            <th className="pb-3 text-right">Subtotal</th>
                                            <th className="pb-3 w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item) => (
                                            <tr key={item.product.id} className="border-b border-border-subtle/30 last:border-0">
                                                <td className="py-3.5">
                                                    <p className="text-sm font-medium text-text-primary">{item.product.name}</p>
                                                    <p className="text-xs text-text-tertiary font-mono">
                                                        {item.product.sku} · {getBranchStock(item.product)} in stock
                                                    </p>
                                                </td>
                                                <td className="py-3.5">
                                                    <div className="flex items-center justify-center gap-1 bg-bg-elevated border border-border-subtle rounded-md w-24 mx-auto px-1 py-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, -1)}
                                                            className="h-6 w-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-sm font-mono font-medium w-6 text-center text-text-primary">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, 1)}
                                                            className="h-6 w-6 rounded flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-right font-mono text-sm text-text-secondary">
                                                    {formatUGX(item.product.price)}
                                                </td>
                                                <td className="py-3.5 text-right font-mono text-sm font-medium text-text-primary">
                                                    {formatUGX(item.product.price * item.quantity)}
                                                </td>
                                                <td className="py-3.5 text-center">
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="p-1.5 rounded text-text-tertiary hover:text-danger-text hover:bg-danger-muted/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Checkout */}
                <div>
                    <Card className="p-6 bg-bg-surface border border-border-subtle flex flex-col gap-5">
                        <h3 className="text-sm font-semibold text-text-primary pb-4 border-b border-border-subtle">
                            Checkout
                        </h3>

                        {/* Customer */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-text-secondary">Customer</Label>
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(true)}
                                    disabled={activeBranch === "all"}
                                    className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    New customer
                                </button>
                            </div>
                            <CustomSelect
                                id="customer-select"
                                value={selectedCustomerId}
                                onChange={handleCustomerChange}
                                disabled={activeBranch === "all" || isCustomersLoading}
                                options={[
                                    { value: "guest", label: "Walk-in guest" },
                                    ...customers.map((c) => ({
                                        value: String(c.id),
                                        label: `${c.companyName} (${c.contactPerson})`,
                                    })),
                                ]}
                            />
                        </div>

                        {/* Payment method */}
                        <div className="space-y-1.5">
                            <Label className="text-text-secondary">Payment method</Label>
                            <div className="grid grid-cols-2 gap-1.5 bg-bg-elevated border border-border-subtle rounded-md p-1">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod("cash")}
                                    className={cn(
                                        "py-1.5 text-sm font-medium rounded transition-colors",
                                        paymentMethod === "cash"
                                            ? "bg-accent text-white"
                                            : "text-text-secondary hover:text-text-primary"
                                    )}
                                >
                                    Cash
                                </button>
                                <button
                                    type="button"
                                    disabled={selectedCustomerId === "guest"}
                                    onClick={() => setPaymentMethod("credit")}
                                    className={cn(
                                        "py-1.5 text-sm font-medium rounded transition-colors",
                                        selectedCustomerId === "guest"
                                            ? "opacity-40 cursor-not-allowed text-text-tertiary"
                                            : "cursor-pointer",
                                        paymentMethod === "credit"
                                            ? "bg-danger text-white"
                                            : "text-text-secondary hover:text-text-primary"
                                    )}
                                >
                                    On credit
                                </button>
                            </div>
                            {selectedCustomerId === "guest" && (
                                <p className="text-xs text-text-tertiary">Select a customer to enable credit sales.</p>
                            )}
                        </div>

                        {/* Due Date picker for credit sales */}
                        {paymentMethod === "credit" && (
                            <div className="space-y-1.5 transition-all">
                                <Label htmlFor="due-date" className="text-text-secondary">Due date</Label>
                                <Input
                                    id="due-date"
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                    className="bg-bg-elevated border border-border-subtle text-text-primary"
                                />
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-3 bg-bg-elevated border border-border-subtle rounded-md p-4">
                            <div className="flex items-center justify-between text-sm text-text-secondary">
                                <span>Subtotal</span>
                                <span className="font-mono">{formatUGX(cartTotals.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-text-secondary">
                                <span>VAT (18%)</span>
                                <span className="font-mono">{formatUGX(cartTotals.tax)}</span>
                            </div>
                            <div className="border-t border-border-subtle pt-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-text-primary">Total</span>
                                <span className="text-xl font-display font-semibold font-mono text-text-primary">
                                    {formatUGX(cartTotals.total)}
                                </span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <Button
                            onClick={handleCheckout}
                            disabled={checkoutMutation.isPending || activeBranch === "all" || cart.length === 0}
                            className="w-full bg-accent hover:bg-accent-hover text-white font-medium h-10"
                        >
                            {checkoutMutation.isPending ? (
                                "Processing…"
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Complete sale
                                </span>
                            )}
                        </Button>
                    </Card>
                </div>
            </div>

            <CustomerModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={(newCustomer) => setSelectedCustomerId(String(newCustomer.id))}
            />
        </div>
    );
}

export default function POSPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-text-secondary">Loading POS Checkout...</div>}>
            <POSContent />
        </Suspense>
    );
}