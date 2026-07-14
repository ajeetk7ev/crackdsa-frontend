import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useThemeStore } from "@/stores/theme.store";
import { useAuthStore } from "@/stores/auth.store";
import { Sun, Moon, Bell, Search, Menu, Command, Sparkles } from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Parse path segments for breadcrumbs
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Capitalize path helper
  const formatSegment = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-6 shadow-sm">
      {/* Breadcrumb section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="size-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm font-medium">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          {pathnames.map((segment, index) => {
            const path = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            
            return (
              <div key={path} className="flex items-center gap-1.5 text-muted-foreground">
                <span>/</span>
                {isLast ? (
                  <span className="text-foreground font-semibold truncate max-w-[120px] md:max-w-[200px]">
                    {formatSegment(segment)}
                  </span>
                ) : (
                  <Link to={path} className="hover:text-foreground transition-colors">
                    {formatSegment(segment)}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Control panel (Right side) */}
      <div className="flex items-center gap-4">
        {/* Simulated Ctrl+K Global Search Trigger */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
          <button
            onClick={() => useThemeStore.getState().setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-44 items-center justify-between rounded-lg border border-border bg-background px-3 py-1 pl-9 text-xs text-muted-foreground shadow-sm transition-all hover:bg-muted/30 focus-visible:border-ring outline-none select-none cursor-pointer"
          >
            <span>Search problems...</span>
            <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
              <Command className="size-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => toggleTheme()}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer shadow-sm"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>

        {/* Notifications Alert Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer shadow-sm"
            title="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive animate-pulse" />
          </button>

          {/* Simple Dropdown overlay */}
          {showNotifications && (
            <>
              <div
                onClick={() => setShowNotifications(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                  <h4 className="text-xs font-bold text-foreground">Updates & Revisions</h4>
                  <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-medium">
                    New Alert
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">12-Day consistency streak!</p>
                      <p className="text-[10px] text-muted-foreground">Keep solving to increase confidence levels.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-border/40 pt-2">
                    <Sparkles className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">"LRU Cache" revision is due</p>
                      <p className="text-[10px] text-muted-foreground">Spaced repetition schedules this item for today.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="size-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground border border-border select-none uppercase">
          {user?.name?.[0] || "U"}
        </div>
      </div>
    </header>
  );
}
