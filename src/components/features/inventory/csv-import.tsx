"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useInventoryStore } from "@/store/inventory-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CsvImport() {
  const { isImportOpen, setImportOpen } = useInventoryStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle the files
    console.log(acceptedFiles);
    // Move to column mapping step (mocked)
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    }
  });

  return (
    <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
      <DialogContent className="sm:max-w-[500px] bg-bg-surface border-border-subtle">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-text-primary">Import Products</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Upload a CSV file containing your product list.
          </DialogDescription>
        </DialogHeader>
        
        <div 
          {...getRootProps()} 
          className={`mt-4 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ${
            isDragActive ? 'border-accent bg-accent-muted' : 'border-border-strong hover:border-accent hover:bg-bg-elevated'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex justify-center mb-4 text-text-tertiary">
            <UploadCloud className="h-10 w-10" />
          </div>
          {isDragActive ? (
            <p className="text-accent-text font-medium">Drop the file here ...</p>
          ) : (
            <div>
              <p className="text-text-primary font-medium mb-1">Drag and drop a CSV file here</p>
              <p className="text-text-secondary text-sm">or click to browse from your computer</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center text-sm">
          <a href="#" className="text-accent hover:underline">Download CSV template</a>
          <Button variant="outline" onClick={() => setImportOpen(false)} className="border-border-subtle text-text-secondary hover:text-text-primary">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
