import { create } from "zustand";

export type BranchId = string | "all";

interface BranchState {
  activeBranch: BranchId;
  setActiveBranch: (branch: BranchId) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  activeBranch: "all",
  setActiveBranch: (branch) => set({ activeBranch: branch }),
}));

// Alias for shop naming (keeps backward compatibility)
export const useShopStore = useBranchStore;

export type ShopId = BranchId;
