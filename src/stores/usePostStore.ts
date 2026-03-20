import { create } from "zustand";
import { getPostsForUser, Post } from "../services/api";

type PostStore = {
  byUserId: Record<number, Post[]>;
  loadingForUser: number | null;
  error: string | null;

  fetchPosts: (userId: number) => Promise<void>;
  clearCache: () => void;
};

export const usePostStore = create<PostStore>((set, get) => ({
  byUserId: {},
  loadingForUser: null,
  error: null,

  // fetch posts for a user
  fetchPosts: async (userId: number) => {
    const { byUserId } = get();

    // If already fetched skip API call
    if (byUserId[userId]) return;

    try {
      set({ loadingForUser: userId, error: null });

      const data = await getPostsForUser(userId);

      set((state) => ({
        byUserId: {
          ...state.byUserId,
          [userId]: data.slice(0, 3), // keep only first 3 posts 
        },
        loadingForUser: null,
      }));
    } catch (error) {
      set({
        error: "Something went wrong",
        loadingForUser: null,
      });
    }
  },

  // clear all cached posts. It is used on refresh
  clearCache: () => {
    set({
      byUserId: {},
    });
  },
}));