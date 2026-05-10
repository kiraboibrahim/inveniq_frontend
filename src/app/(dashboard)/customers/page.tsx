"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CustomerTable } from "@/components/features/customers/customer-table";
import { CustomerDrawer } from "@/components/features/customers/customer-drawer";
import { CustomerForm } from "@/components/features/customers/customer-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Customers() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="B2B Customers"
        breadcrumbs={[{ label: "AIMS" }, { label: "Customers" }]}
        action={
          <Button className="bg-accent hover:bg-accent-hover text-white" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        <CustomerTable />
        <CustomerDrawer />
        <CustomerForm open={formOpen} onOpenChange={setFormOpen} />
      </div>
    </>
  );
}
