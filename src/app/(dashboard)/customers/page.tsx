"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, UserCheck } from "lucide-react";
import { useInventoryStore } from "@/store/inventory-store";
import { CustomerTable } from "@/components/features/customers/customer-table";
import { CustomerDrawer } from "@/components/features/customers/customer-drawer";
import { CustomerModal } from "@/components/features/customers/customer-modal";
import { useQuery } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { EmptyState } from "@/components/ui/empty-state";

import { RoleGuard } from "@/components/auth/role-guard";

export default function Customers() {
  const { isCustomerModalOpen, editingCustomer, setCustomerModalOpen } = useInventoryStore();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: stakeholderService.getCustomers,
  });

  const isEmpty = customers.length === 0 && !isLoading;

  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <PageHeader 
        title="Customers" 
        breadcrumbs={[{ label: "AIMS" }, { label: "Customers" }]}
        action={
          <Button onClick={() => setCustomerModalOpen(true, null)} className="bg-accent hover:bg-accent-hover text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        }
      />
      
      <div className="fade-in duration-300">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : isEmpty ? (
          <EmptyState 
            icon={<UserCheck className="w-10 h-10" strokeWidth={1.5} />}
            title="No customers yet"
            description="Track customer lifetime value and outstanding balances."
            action={
              <Button onClick={() => setCustomerModalOpen(true, null)} className="bg-accent hover:bg-accent-hover text-white mt-2">
                Add your first customer
              </Button>
            }
          />
        ) : (
          <CustomerTable data={customers} />
        )}
      </div>

      <CustomerDrawer />
      <CustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setCustomerModalOpen(false, null)} 
        customer={editingCustomer}
      />
    </RoleGuard>
  );
}
