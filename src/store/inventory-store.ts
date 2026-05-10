import { create } from "zustand";

interface InventoryState {
  isDrawerOpen: boolean;
  selectedProductId: string | null;
  isScannerOpen: boolean;
  isAddProductOpen: boolean;
  isImportOpen: boolean;
  
  // Supplier drawer
  isSupplierDrawerOpen: boolean;
  selectedSupplierId: string | null;
  
  // Customer drawer
  isCustomerDrawerOpen: boolean;
  selectedCustomerId: string | null;
  
  // Branch drawer
  isBranchDrawerOpen: boolean;
  selectedBranchId: string | null;
  
  openDrawer: (productId: string) => void;
  closeDrawer: () => void;
  setScannerOpen: (isOpen: boolean) => void;
  setAddProductOpen: (isOpen: boolean) => void;
  setImportOpen: (isOpen: boolean) => void;
  
  openSupplierDrawer: (supplierId: string) => void;
  closeSupplierDrawer: () => void;
  openCustomerDrawer: (customerId: string) => void;
  closeCustomerDrawer: () => void;
  openBranchDrawer: (branchId: string) => void;
  closeBranchDrawer: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  isDrawerOpen: false,
  selectedProductId: null,
  isScannerOpen: false,
  isAddProductOpen: false,
  isImportOpen: false,

  isSupplierDrawerOpen: false,
  selectedSupplierId: null,
  isCustomerDrawerOpen: false,
  selectedCustomerId: null,
  isBranchDrawerOpen: false,
  selectedBranchId: null,

  openDrawer: (productId) => set({ isDrawerOpen: true, selectedProductId: productId }),
  closeDrawer: () => set({ isDrawerOpen: false, selectedProductId: null }),
  setScannerOpen: (isOpen) => set({ isScannerOpen: isOpen }),
  setAddProductOpen: (isOpen) => set({ isAddProductOpen: isOpen }),
  setImportOpen: (isOpen) => set({ isImportOpen: isOpen }),

  openSupplierDrawer: (supplierId) => set({ isSupplierDrawerOpen: true, selectedSupplierId: supplierId }),
  closeSupplierDrawer: () => set({ isSupplierDrawerOpen: false, selectedSupplierId: null }),
  openCustomerDrawer: (customerId) => set({ isCustomerDrawerOpen: true, selectedCustomerId: customerId }),
  closeCustomerDrawer: () => set({ isCustomerDrawerOpen: false, selectedCustomerId: null }),
  openBranchDrawer: (branchId) => set({ isBranchDrawerOpen: true, selectedBranchId: branchId }),
  closeBranchDrawer: () => set({ isBranchDrawerOpen: false, selectedBranchId: null }),
}));

