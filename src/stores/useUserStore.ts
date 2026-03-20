import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUsers, User } from "../services/api";

type UserStore = {
  users: User[];
  favorites: number[];
  pinnedUserId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastFetched: number | null;

  fetchUsers: () => Promise<void>;
  toggleFavorite: (userId: number) => void;
  setPinnedUser: (userId: number | null) => void;
  clearUsers: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [],
      favorites: [],
      pinnedUserId: null,
      status: "idle",
      error: null,
      lastFetched: null,

      // fetch users from API
      fetchUsers: async () => {
        try {
          set({ status: "loading", error: null });

          const data = await getUsers();

          set({
            users: data,
            status: "succeeded",
            lastFetched: Date.now(),
          });
        } catch (error) {
          set({
            status: "failed",
            error: "Something went wrong",
          });
        }
      },

      // add or remove from favorites
      toggleFavorite: (userId: number) => {
        const { favorites } = get();

        if (favorites.includes(userId)) {
          set({
            favorites: favorites.filter((id) => id !== userId),
          });
        } else {
          set({
            favorites: [...favorites, userId],
          });
        }
      },

      // set pinned user
      setPinnedUser: (userId: number | null) => {
        set({ pinnedUserId: userId });
      },

      // clear users
      clearUsers: () => {
        set({
          users: [],
          lastFetched: null,
        });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),

      // only persist required fields
      partialize: (state) => ({
        users: state.users,
        favorites: state.favorites,
        lastFetched: state.lastFetched,
      }),
    }
  )
);