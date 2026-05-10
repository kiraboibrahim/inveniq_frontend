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
import { ArrowUpDown, MoreHorizontal, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInventoryStore } from "@/store/inventory-store";

interface ProductTableProps {
  data: Product[];
}

export function ProductTable({ data }: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { openDrawer } = useInventoryStore();

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <div className="font-mono text-text-secondary">{row.getValue("sku")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4 hover:bg-bg-elevated text-text-secondary"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium text-text-primary">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div className="text-text-secondary">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "stockQty",
      header: () => <div className="text-right">Stock</div>,
      cell: ({ row }) => {
        const qty = row.getValue("stockQty") as number;
        const threshold = row.original.threshold;
        const isLow = qty > 0 && qty <= threshold;
        const isOut = qty === 0;

        return (
          <div className="text-right font-mono font-medium flex items-center justify-end gap-2">
            {(isLow || isOut) && (
              <AlertCircle className={cn("w-4 h-4", isOut ? "text-danger-text" : "text-warning-text")} />
            )}
            <span className={cn(
              isOut && "text-danger-text",
              isLow && "text-warning-text"
            )}>{qty}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let badgeClass = "bg-info-muted text-info-text";
        
        if (status === "In stock") badgeClass = "bg-success-muted text-success-text";
        if (status === "Low stock") badgeClass = "bg-warning-muted text-warning-text";
        if (status === "Out of stock") badgeClass = "bg-danger-muted text-danger-text";

        return (
          <div className={cn("inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold", badgeClass)}>
            {status}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openDrawer(row.original.id); }}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-text-tertiary" />
            </Button>
          </div>
        )
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
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter products..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-bg-surface border-border-subtle"
        />
      </div>
      <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden">
        <Table>
          <TableHeader className="bg-bg-elevated border-b border-border-strong">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border-subtle hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-text-secondary h-11">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                    "border-b border-border-subtle hover:bg-bg-elevated cursor-pointer transition-colors",
                    row.original.stockQty === 0 && "bg-danger/5 hover:bg-danger/10 border-danger/20"
                  )}
                  onClick={() => openDrawer(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-text-secondary">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-border-subtle text-text-secondary hover:text-text-primary"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-border-subtle text-text-secondary hover:text-text-primary"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
