import { create } from "zustand";
import { api } from "@/lib/axios";
import { useNotificationStore } from "./notification.store";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "student";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("crackdsa-token"),
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true });
    const notification = useNotificationStore.getState();
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem("crackdsa-token", token);
      localStorage.setItem("crackdsa-user", JSON.stringify(user));
      
      set({ token, user, isAuthenticated: true, isLoading: false });
      notification.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      notification.error(err?.response?.data?.message || "Login failed. Please verify credentials.");
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    const notification = useNotificationStore.getState();
    try {
      const response = await api.post("/auth/register", { email, password, name });
      const { token, user } = response.data;
      
      localStorage.setItem("crackdsa-token", token);
      localStorage.setItem("crackdsa-user", JSON.stringify(user));
      
      set({ token, user, isAuthenticated: true, isLoading: false });
      notification.success("Account registered successfully! Ready to solve.");
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      notification.error(err?.response?.data?.message || "Registration failed. Try again.");
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("crackdsa-token");
    localStorage.removeItem("crackdsa-user");
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    useNotificationStore.getState().info("Logged out successfully.");
  },

  checkAuth: async () => {
    const token = localStorage.getItem("crackdsa-token");
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get("/auth/check");
      const { user } = response.data;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("crackdsa-token");
      localStorage.removeItem("crackdsa-user");
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (name) => {
    const notification = useNotificationStore.getState();
    try {
      const response = await api.post("/settings/profile", { name });
      const { user } = response.data;
      localStorage.setItem("crackdsa-user", JSON.stringify(user));
      set({ user });
      notification.success("Profile details updated successfully.");
    } catch (err: any) {
      notification.error("Failed to update profile settings.");
    }
  },
}));
