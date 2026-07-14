import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Inject Authorization Token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("crackdsa-token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: handle standard formats and unauthorized errors
api.interceptors.response.use(
  (response) => {
    // Return the custom data payload directly if present
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      // Auto-logout user if token is invalid or expired
      if (status === 401) {
        localStorage.removeItem("crackdsa-token");
        localStorage.removeItem("crackdsa-user");
        // We can let the auth store know or redirect via window pathing
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login?expired=true";
        }
      }
    }
    return Promise.reject(error);
  }
);
