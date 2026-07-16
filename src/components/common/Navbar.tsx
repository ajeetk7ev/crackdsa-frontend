import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useThemeStore } from "@/stores/theme.store";
import { useAuthStore } from "@/stores/auth.store";
import { Sun, Moon, Bell, Menu, Sparkles, User, Settings, LogOut } from "lucide-react";

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Parse path segments for breadcrumbs
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Capitalize path helper
  const formatSegment = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstname?.[0] || "";
    const last = user.lastname?.[0] || "";
    return (first + last).toUpperCase() || "U";
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

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="size-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-sm text-muted-foreground border border-border select-none uppercase cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none overflow-hidden"
            title="User Profile Menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstname ? `${user.firstname} ${user.lastname}` : "User Profile"}
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              getInitials()
            )}
          </button>

          {showProfileMenu && (
            <>
              {/* Overlay to close on outside click */}
              <div
                onClick={() => setShowProfileMenu(false)}
                className="fixed inset-0 z-40"
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 z-50 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                {/* User Info Header */}
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user ? `${user.firstname} ${user.lastname}` : "User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium"
                >
                  <User className="size-3.5" />
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium"
                >
                  <Settings className="size-3.5" />
                  Profile Settings
                </Link>

                <div className="my-1 border-t border-border/40" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors font-semibold cursor-pointer text-left gap-2"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
