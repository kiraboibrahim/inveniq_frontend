import { create } from "zustand";

export type BranchId = "main" | "entebbe" | "all";

interface BranchState {
  activeBranch: BranchId;
  setActiveBranch: (branch: BranchId) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  activeBranch: "all",
  setActiveBranch: (branch) => set({ activeBranch: branch }),
}));
