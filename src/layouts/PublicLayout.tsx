import { Outlet, Link } from "react-router-dom";
import { useThemeStore } from "@/stores/theme.store";
import { Sun, Moon } from "lucide-react";
import { ToastContainer } from "@/components/common/Toast";

export function PublicLayout() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-foreground tracking-tight select-none">
          <span className="bg-primary text-primary-foreground size-6 rounded-md flex items-center justify-center font-bold text-xs">
            C
          </span>
          CrackDSA
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/auth/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth/register"
            className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            Get Started
          </Link>
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
