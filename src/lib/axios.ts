import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  withCredentials: true, // required so the browser sends the HTTP-only refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// In-memory access token store.
// The token lives only in this module's closure — never in localStorage or sessionStorage.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Attach the in-memory access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track whether a token refresh is already in progress to prevent parallel refreshes
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processPendingQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  pendingQueue = [];
};

// Response interceptor: on 401, attempt a silent token refresh using the cookie
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh for 401 errors that are not from the refresh endpoint itself
    // and have not already been retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/signup")
    ) {
      if (isRefreshing) {
        // Queue the request until the refresh completes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const newToken: string = response.data?.data?.accessToken;

        setAccessToken(newToken);
        processPendingQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        processPendingQueue(refreshError, null);

        // Clear in-memory state and redirect to login if not already there
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login?expired=true";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
