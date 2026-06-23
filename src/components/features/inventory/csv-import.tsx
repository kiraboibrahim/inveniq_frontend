"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useInventoryStore } from "@/store/inventory-store";
import { useBranchStore } from "@/store/branch-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inventoryService } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CsvImport() {
    const { isImportOpen, setImportOpen } = useInventoryStore();
    const { activeBranch } = useBranchStore();
    const queryClient = useQueryClient();
    const [isSuccess, setIsSuccess] = useState(false);

    const importMutation = useMutation({
        mutationFn: (file: File) => inventoryService.importExcel(file, activeBranch),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success(data.message || "Import successful");
            setIsSuccess(true);
            setTimeout(() => {
                setImportOpen(false);
                setIsSuccess(false);
            }, 2000);
        },
        onError: (error: unknown) => {
            const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Import failed. Check file format.";
            toast.error(msg);
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            importMutation.mutate(acceptedFiles[0]);
        }
    }, [importMutation]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        disabled: importMutation.isPending || isSuccess,
    });

    return (
        <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
            <DialogContent className="sm:max-w-[500px] bg-bg-surface border-border-subtle">
                <DialogHeader>
                    <DialogTitle className="text-xl font-medium text-text-primary">Import Products</DialogTitle>
                    <DialogDescription className="text-text-secondary">
                        Upload an Excel spreadsheet (.xlsx, .xls) with columns: <code className="bg-bg-elevated px-1 rounded">sku, name, category, price, quantity, threshold, description</code>. The imported quantities will be added to the active branch.
                    </DialogDescription>
                </DialogHeader>

                <div
                    {...getRootProps()}
                    className={`mt-4 border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 ${isDragActive ? 'border-accent bg-accent-muted' : 'border-border-strong'
                        } ${importMutation.isPending || isSuccess ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent hover:bg-bg-elevated cursor-pointer'}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex justify-center mb-4">
                        {importMutation.isPending ? (
                            <Loader2 className="h-10 w-10 text-accent animate-spin" />
                        ) : isSuccess ? (
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        ) : (
                            <UploadCloud className="h-10 w-10 text-text-tertiary" />
                        )}
                    </div>

                    {importMutation.isPending ? (
                        <p className="text-text-primary font-medium">Uploading and processing...</p>
                    ) : isSuccess ? (
                        <p className="text-success font-medium">Import complete!</p>
                    ) : isDragActive ? (
                        <p className="text-accent-text font-medium">Drop the Excel file here ...</p>
                    ) : (
                        <div>
                            <p className="text-text-primary font-medium mb-1">Drag and drop an Excel file here</p>
                            <p className="text-text-secondary text-sm">or click to browse from your computer (.xlsx, .xls)</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex justify-between items-center text-sm">
                    <button
                        type="button"
                        onClick={() => inventoryService.downloadTemplate().catch(() => toast.error("Failed to download template"))}
                        className="text-accent hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                        Download Excel template
                    </button>
                    <Button variant="outline" onClick={() => setImportOpen(false)} className="border-border-subtle text-text-secondary hover:text-text-primary">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
