"use client";

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    getFilteredRowModel,
    ColumnFiltersState,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { Product } from "@/types";
import { ArrowUpDown, AlertCircle, Package, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useInventoryStore } from "@/store/inventory-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/services/api";
import { toast } from "sonner";

interface ProductTableProps {
    data: Product[];
}

export function ProductTable({ data }: ProductTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const { openDrawer, openStockEditor, setEditProductOpen } = useInventoryStore();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => inventoryService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product deleted successfully");
            setDeleteTarget(null);
        },
        onError: () => toast.error("Failed to delete product"),
    });

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "sku",
            header: "SKU",
            cell: ({ row }) => <div className="font-mono text-text-secondary text-xs">{row.getValue("sku")}</div>,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="hover:bg-bg-elevated text-text-secondary p-0 h-auto font-bold flex items-center gap-1.5"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Product Name
                    <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-semibold text-text-primary">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "category",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="hover:bg-bg-elevated text-text-secondary p-0 h-auto font-bold flex items-center gap-1.5"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category
                    <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-text-secondary text-sm">{row.getValue("category")}</div>,
        },
        {
            accessorKey: "stockQty",
            header: ({ column }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        className="hover:bg-bg-elevated text-text-secondary p-0 h-auto font-bold flex items-center gap-1.5 ml-auto"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Stock
                        <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const qty = row.getValue("stockQty") as number;
                const threshold = row.original.threshold;
                const isLow = qty > 0 && qty <= threshold;
                const isOut = qty === 0;

                return (
                    <div className="text-right font-mono font-medium flex items-center justify-end gap-2">
                        {(isLow || isOut) && (
                            <AlertCircle className={cn("w-4 h-4 shrink-0", isOut ? "text-danger-text animate-pulse" : "text-warning-text")} />
                        )}
                        <span className={cn(
                            isOut ? "text-danger-text font-bold" : isLow ? "text-warning-text font-bold" : "text-text-primary"
                        )}>
                            {qty} <span className="text-text-tertiary text-xs font-normal">/ {threshold}</span>
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        className="hover:bg-bg-elevated text-text-secondary p-0 h-auto font-bold flex items-center gap-1.5 ml-auto"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Price
                        <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const price = Number(row.getValue("price") || 0);
                return (
                    <div className="text-right font-mono font-bold text-accent-text">
                        {new Intl.NumberFormat("en-UG", {
                            style: "currency",
                            currency: "UGX",
                            maximumFractionDigits: 0
                        }).format(price)}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="hover:bg-bg-elevated text-text-secondary p-0 h-auto font-bold flex items-center gap-1.5"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
                </Button>
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let badgeClass = "bg-info-muted/30 text-info-text border-info/25";
                let dotClass = "bg-info";

                if (status === "In stock") {
                    badgeClass = "bg-success-muted/30 text-success-text border-success/25";
                    dotClass = "bg-success";
                } else if (status === "Low stock") {
                    badgeClass = "bg-warning-muted/30 text-warning-text border-warning/25";
                    dotClass = "bg-warning";
                } else if (status === "Out of stock") {
                    badgeClass = "bg-danger-muted/30 text-danger-text border-danger/25";
                    dotClass = "bg-danger";
                }

                return (
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", badgeClass)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />
                        {status}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right text-text-secondary font-bold">Actions</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-right flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-bg-elevated text-text-tertiary hover:text-text-primary"
                            title="Quick Stock Editor"
                            onClick={() => openStockEditor(row.original.id)}
                        >
                            <span className="sr-only">Update stock</span>
                            <Package className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-bg-elevated text-text-secondary hover:text-text-primary"
                            title="Edit product"
                            onClick={() => setEditProductOpen(true, row.original.id)}
                        >
                            <span className="sr-only">Edit product</span>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-danger/10 text-danger-text hover:text-danger"
                            title="Delete product"
                            onClick={() => setDeleteTarget(row.original)}
                        >
                            <span className="sr-only">Delete product</span>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <>
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border-subtle bg-bg-surface overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-bg-elevated border-b border-border-subtle">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-border-subtle hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-text-secondary h-12 py-3 px-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "border-b border-border-subtle hover:bg-bg-elevated/45 cursor-pointer transition-colors",
                                        row.original.stockQty === 0 && "bg-danger-muted/5 hover:bg-danger-muted/10"
                                    )}
                                    onClick={() => openDrawer(row.original.id)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-text-secondary">
                                    No products found matching filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="border-border-subtle text-text-secondary hover:text-text-primary rounded-xl"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border-border-subtle text-text-secondary hover:text-text-primary rounded-xl"
                >
                    Next
                </Button>
            </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <DialogContent className="bg-bg-surface border border-border-subtle text-text-primary max-w-sm rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-lg font-bold">
                        Delete Product
                    </DialogTitle>
                    <DialogDescription className="text-text-secondary text-sm">
                        Are you sure you want to permanently delete{" "}
                        <span className="font-semibold text-text-primary">{deleteTarget?.name}</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 mt-2">
                    <Button
                        onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                        disabled={deleteMutation.isPending}
                        className="w-full bg-danger hover:bg-danger/90 text-white rounded-xl h-11 font-medium"
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setDeleteTarget(null)}
                        className="w-full text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-xl h-11"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
