"use client";

import { useEffect, useState } from "react";
import { useInventoryStore } from "@/store/inventory-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, stakeholderService } from "@/services/api";
import { toast } from "sonner";

export function ProductEditModal() {
  const { isEditProductOpen, editingProductId, setEditProductOpen } = useInventoryStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [threshold, setThreshold] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const { data: product } = useQuery({
    queryKey: ["product", editingProductId],
    queryFn: () => editingProductId ? inventoryService.getProduct(editingProductId) : null,
    enabled: !!editingProductId && isEditProductOpen,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: inventoryService.getCategories,
    enabled: isEditProductOpen,
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: stakeholderService.getSuppliers,
    enabled: isEditProductOpen,
  });

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSku(product.sku || "");
      setPrice(String(product.price || 0));
      setCostPrice(String(product.costPrice || 0));
      setThreshold(String(product.threshold || 10));
      setExpiryDate(product.expiryDate || "");
      // Re-resolve categoryId each time categories or product changes
      const matchedCategory = categories.find((c) => c.id === product.category_id);
      setCategoryId(matchedCategory ? String(matchedCategory.id) : "");
      setSupplierId(product.primarySupplierId ? String(product.primarySupplierId) : "none");
    }
  }, [product, categories]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", editingProductId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      setEditProductOpen(false);
    },
    onError: () => toast.error("Failed to update product"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    updateMutation.mutate({
      id: editingProductId,
      data: {
        sku,
        name,
        price: Number(price),
        cost_price: Number(costPrice),
        threshold: Number(threshold),
        expiry_date: expiryDate || null,
        category_id: categoryId ? Number(categoryId) : null,
        primary_supplier_id: supplierId === "none" ? null : Number(supplierId),
      },
    });
  };

  return (
    <Dialog open={isEditProductOpen} onOpenChange={(open) => setEditProductOpen(open)}>
      <DialogContent className="bg-bg-surface border border-border-subtle text-text-primary max-w-lg rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <DialogTitle className="font-display text-xl font-bold text-text-primary">
            Edit Product
          </DialogTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            Update product details and pricing information.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-text-secondary text-sm font-medium">Product Name</Label>
            <Input
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Green Tea"
            />
          </div>

          {/* SKU / Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm font-medium">SKU / Barcode</Label>
              <Input
                value={sku}
                required
                onChange={(e) => setSku(e.target.value)}
                className="font-mono"
                placeholder="e.g. SKU-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm font-medium">Low Stock Limit</Label>
              <Input
                type="number"
                min="1"
                value={threshold}
                required
                onChange={(e) => setThreshold(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm font-medium">Selling Price (UGX)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                required
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm font-medium">Cost Price (UGX)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5">
            <Label className="text-text-secondary text-sm font-medium">
              Expiry Date <span className="text-text-tertiary font-normal">(optional)</span>
            </Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="[color-scheme:dark]"
            />
          </div>

          {/* Category / Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm font-medium">Category</Label>
              <CustomSelect
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select category"
                options={categories.map((cat) => ({
                  value: String(cat.id),
                  label: cat.name,
                }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-secondary text-sm font-medium">Supplier</Label>
              <CustomSelect
                value={supplierId}
                onChange={setSupplierId}
                placeholder="Select supplier"
                options={[
                  { value: "none", label: "None (Optional)" },
                  ...suppliers.map((sup: any) => ({
                    value: String(sup.id),
                    label: sup.name,
                  })),
                ]}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border-subtle/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditProductOpen(false)}
              className="flex-1 border-border-subtle text-text-secondary hover:text-text-primary rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-xl h-11 font-medium"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
