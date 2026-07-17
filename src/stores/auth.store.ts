import { create } from "zustand";
import { api, setAccessToken } from "@/lib/axios";
import { useNotificationStore } from "./notification.store";

// Matches the shape returned by the backend's toJSON transform
export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  avatar: string;
  provider: "local" | "google";
  isEmailVerified: boolean;
  role: "USER" | "ADMIN";
  isProfilePublic: boolean;
  isActive: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    revisionStrategy: "sm2" | "balanced" | "cram";
    revisionSchedule: number[];
    pomodoro: {
      focusTime: number;
      breakTime: number;
      longBreakTime: number;
    };
  };
  notifications: {
    revisionReminder: boolean;
    streakReminder: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  streak: {
    current: number;
    longest: number;
    lastSolvedDate: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface FieldErrors {
  [field: string]: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  signup: (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ success: boolean; fieldErrors?: FieldErrors }>;

  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ success: boolean; fieldErrors?: FieldErrors }>;

  logout: () => Promise<void>;

  checkAuth: () => Promise<void>;

  setUser: (user: User) => void;

  updateProfile: (data: Partial<User> | string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // ---------- Signup ----------
  signup: async (firstname, lastname, email, password, rememberMe) => {
    set({ isLoading: true });
    const notification = useNotificationStore.getState();

    try {
      const response = await api.post("/auth/signup", {
        firstname,
        lastname,
        email,
        password,
        rememberMe,
      });

      const { user, accessToken } = response.data.data;
      setAccessToken(accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      notification.success(`Welcome to CrackDSA, ${user.firstname}!`);
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      const data = err?.response?.data;

      // Validation field errors (422)
      if (err?.response?.status === 422 && data?.errors) {
        return { success: false, fieldErrors: data.errors };
      }

      notification.error(data?.message || "Registration failed. Please try again.");
      return { success: false };
    }
  },

  // ---------- Login ----------
  login: async (email, password, rememberMe) => {
    set({ isLoading: true });
    const notification = useNotificationStore.getState();

    try {
      const response = await api.post("/auth/login", { email, password, rememberMe });

      const { user, accessToken } = response.data.data;
      setAccessToken(accessToken);
      set({ user, isAuthenticated: true, isLoading: false });
      notification.success(`Welcome back, ${user.firstname}!`);
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      const data = err?.response?.data;

      if (err?.response?.status === 422 && data?.errors) {
        return { success: false, fieldErrors: data.errors };
      }

      notification.error(data?.message || "Login failed. Please check your credentials.");
      return { success: false };
    }
  },

  // ---------- Logout ----------
  logout: async () => {
    const notification = useNotificationStore.getState();
    try {
      await api.post("/auth/logout");
    } catch {
      // Proceed with local cleanup even if the server call fails
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
      notification.info("Logged out successfully.");
    }
  },

  // ---------- Check Auth (called on app mount / layout load) ----------
  // Attempts a silent token refresh using the cookie, then fetches the current user.
  checkAuth: async () => {
    set({ isLoading: true });

    try {
      // Try to get a fresh access token using the refresh token cookie
      const refreshResponse = await api.post("/auth/refresh");
      const newToken: string = refreshResponse.data?.data?.accessToken;
      setAccessToken(newToken);

      // Fetch the full user profile
      const meResponse = await api.get("/auth/me");
      const user: User = meResponse.data.data.user;

      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // No valid session - user needs to log in
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // ---------- Set User (used by Google OAuth success page) ----------
  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  updateProfile: async (data) => {
    let payload: any = {};
    if (typeof data === "string") {
      const parts = data.trim().split(" ");
      payload.firstname = parts[0] || "";
      payload.lastname = parts.slice(1).join(" ") || "";
    } else {
      payload = data;
    }

    const response = await api.put("/auth/profile", payload);
    const user = response.data.data.user;
    set({ user });
  },
}));
