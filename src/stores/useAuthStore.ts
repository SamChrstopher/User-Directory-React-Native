import { create } from "zustand";
import { saveSecure, getSecure, deleteSecure } from "../services/secureStorage";

type AuthStore = {
  token: string | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  isLoading: false,

  // load token from SecureStore on app start
  initialize: async () => {
    try {
      set({ isLoading: true });

      let token = await getSecure("auth_token");

      // create mock token if token doesn't exist
      if (!token) {
        token = "tk_93jf8sk2lq";
        await saveSecure("auth_token", token);
      }

      set({ token });
    } catch (error) {
      console.log("Error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // update token 
  setToken: async (token: string) => {
    set({ token });
    await saveSecure("auth_token", token);
  },

  // clear token 
  clearToken: async () => {
    set({ token: null });
    await deleteSecure("auth_token");
  },
}));