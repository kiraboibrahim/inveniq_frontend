"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SupplierDirectory } from "@/components/features/suppliers/supplier-directory";
import { SupplierDrawer } from "@/components/features/suppliers/supplier-drawer";
import { SupplierForm } from "@/components/features/suppliers/supplier-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Suppliers() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Suppliers"
        breadcrumbs={[{ label: "AIMS" }, { label: "Suppliers" }]}
        action={
          <Button className="bg-accent hover:bg-accent-hover text-white" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <SupplierDirectory />
        <SupplierDrawer />
        <SupplierForm open={formOpen} onOpenChange={setFormOpen} />
      </div>
    </>
  );
}
