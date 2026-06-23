"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stakeholderService } from "@/services/api";
import { toast } from "sonner";
import { UgPhoneInput } from "@/components/ui/ug-phone-input";
import type { Supplier } from "@/types";

interface SupplierFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier?: Supplier | null;
}

export function SupplierForm({ open, onOpenChange, supplier }: SupplierFormProps) {
    const isEdit = !!supplier;
    const [isLoading, setIsLoading] = useState(false);
    const [phone, setPhone] = useState(supplier?.phone || "");
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: stakeholderService.createSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            onOpenChange(false);
            setPhone("");
            toast.success("Supplier created successfully");
        },
        onError: () => {
            toast.error("Failed to create supplier");
            setIsLoading(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<Supplier> }) =>
            stakeholderService.updateSupplier(String(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
            queryClient.invalidateQueries({ queryKey: ["supplier", supplier?.id] });
            onOpenChange(false);
            setPhone("");
            toast.success("Supplier updated successfully");
        },
        onError: () => {
            toast.error("Failed to update supplier");
            setIsLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            name: formData.get("supplierName") as string,
            contactPerson: formData.get("contactPerson") as string,
            phone: phone,
            email: formData.get("supplierEmail") as string,
        };

        if (isEdit && supplier) {
            updateMutation.mutate({ id: supplier.id, data });
        } else {
            createMutation.mutate({
                ...data,
                status: "active",
                fulfillmentRating: 0,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] bg-bg-surface border-border-subtle text-text-primary">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        {isEdit ? "Edit supplier" : "Add new supplier"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2" key={open ? (supplier?.id || "new") : "closed"}>
                    <div className="space-y-2">
                        <Label htmlFor="supplierName" className="text-text-secondary">Company name</Label>
                        <Input
                            id="supplierName"
                            name="supplierName"
                            placeholder="e.g. Mukwano Industries"
                            defaultValue={supplier?.name || ""}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson" className="text-text-secondary">Contact person</Label>
                            <Input
                                id="contactPerson"
                                name="contactPerson"
                                placeholder="Full name"
                                defaultValue={supplier?.contactPerson || ""}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-text-secondary">Phone number</Label>
                            <UgPhoneInput
                                id="phone"
                                name="phone"
                                onChange={setPhone}
                                initialValue={supplier?.phone || ""}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="supplierEmail" className="text-text-secondary">Email address</Label>
                        <Input
                            id="supplierEmail"
                            name="supplierEmail"
                            type="email"
                            placeholder="sales@company.com"
                            defaultValue={supplier?.email || ""}
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border-subtle">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-accent hover:bg-accent-hover text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save supplier"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}