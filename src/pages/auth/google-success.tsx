import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { setAccessToken } from "@/lib/axios";
import { api } from "@/lib/axios";
import { PageLoader } from "@/components/ui/loader";
import { useNotificationStore } from "@/stores/notification.store";

/**
 * Landing page after a successful Google OAuth redirect.
 *
 * The backend redirects here with the access token as a query param:
 *   /auth/google/success?token=<accessToken>
 *
 * This page:
 * 1. Reads the token from the URL and stores it in memory
 * 2. Clears the token from the URL immediately (security hygiene)
 * 3. Calls GET /auth/me to fetch the full user object
 * 4. Sets the user in the store and navigates to the dashboard
 */
export function GoogleSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const notification = useNotificationStore.getState();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get("token");

    if (!token) {
      notification.error("Google authentication failed. No token received.");
      navigate("/auth/login", { replace: true });
      return;
    }

    // Store the access token in memory and immediately clean the URL
    setAccessToken(token);
    window.history.replaceState({}, document.title, "/auth/google/success");

    // Fetch the current user using the new token
    api
      .get("/auth/me")
      .then((response) => {
        const user = response.data.data.user;
        setUser(user);
        notification.success(`Welcome, ${user.firstname}! Signed in with Google.`);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        setAccessToken(null);
        notification.error("Failed to load your profile after Google sign-in. Please try again.");
        navigate("/auth/login", { replace: true });
      });
  }, []);

  return <PageLoader message="Completing Google sign-in..." />;
}
