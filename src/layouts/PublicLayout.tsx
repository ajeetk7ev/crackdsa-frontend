import { useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useThemeStore } from "@/stores/theme.store";
import { useAuthStore } from "@/stores/auth.store";
import { Sun, Moon } from "lucide-react";
import { ToastContainer } from "@/components/common/Toast";
import { Logo } from "@/components/common/Logo";

export function PublicLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2 select-none">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-all shadow-sm transform hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/95 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
          <button
            onClick={() => toggleTheme()}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer shadow-sm"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 flex flex-col justify-center">
        <Outlet />
      </main>

      {/* Global Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
}
