import { create } from "zustand";

type UIStore = {
  searchQuery: string;
  expandedUserId: number | null;

  setSearchQuery: (query: string) => void;
  setExpandedUserId: (userId: number | null) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: "",
  expandedUserId: null,

  // update search text
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // track which user card is expanded
  setExpandedUserId: (userId: number | null) => {
    set({ expandedUserId: userId });
  },
}));
