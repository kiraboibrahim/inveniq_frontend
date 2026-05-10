"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Scan, UploadCloud, Plus } from "lucide-react";
import { ProductTable } from "@/components/features/inventory/product-table";
import { mockProducts } from "@/services/mock-data";
import { useInventoryStore } from "@/store/inventory-store";

// Modals & Overlays
import { ProductDrawer } from "@/components/features/inventory/product-drawer";
import { ProductForm } from "@/components/features/inventory/product-form";
import { CsvImport } from "@/components/features/inventory/csv-import";
import { BarcodeScanner } from "@/components/features/inventory/barcode-scanner";
import { EmptyState } from "@/components/ui/empty-state";
import { Package } from "lucide-react";

export default function Inventory() {
  const { setScannerOpen, setAddProductOpen, setImportOpen } = useInventoryStore();

  const isEmpty = mockProducts.length === 0;

  return (
    <>
      <PageHeader 
        title="Inventory" 
        breadcrumbs={[{ label: "AIMS" }, { label: "Inventory" }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="hidden sm:flex border-border-subtle text-text-secondary hover:text-text-primary" onClick={() => setImportOpen(true)}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button className="bg-accent hover:bg-accent-hover text-white" onClick={() => setAddProductOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        }
      />
      
      <div className="flex flex-col gap-6 fade-in duration-300">
        <div className="flex justify-between items-center bg-bg-surface p-4 border border-border-subtle rounded-md">
          <div className="flex gap-4">
            <select className="h-9 px-3 bg-bg-elevated border border-border-subtle rounded-md text-sm text-text-primary focus:outline-none focus:border-accent">
              <option value="all">All Categories</option>
              <option value="groceries">Groceries</option>
              <option value="electronics">Electronics</option>
              <option value="hardware">Hardware</option>
            </select>
            <select className="h-9 px-3 bg-bg-elevated border border-border-subtle rounded-md text-sm text-text-primary focus:outline-none focus:border-accent">
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          <Button variant="outline" className="border-border-strong text-text-primary hover:bg-bg-elevated" onClick={() => setScannerOpen(true)}>
            <Scan className="w-4 h-4 mr-2" />
            Scan Barcode
          </Button>
        </div>

        {isEmpty ? (
          <EmptyState 
            icon={<Package className="w-10 h-10" strokeWidth={1.5} />}
            title="No products yet"
            description="Add your first product by scanning a barcode or entering details manually."
            action={<Button className="bg-accent hover:bg-accent-hover text-white mt-2" onClick={() => setAddProductOpen(true)}>Add your first product</Button>}
          />
        ) : (
          <ProductTable data={mockProducts} />
        )}
      </div>

      {/* Render Modals at the bottom level */}
      <ProductDrawer />
      <ProductForm />
      <CsvImport />
      <BarcodeScanner />
    </>
  );
}
