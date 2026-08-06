import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  LayoutDashboard,
  RefreshCw,
  FolderHeart,
  Bookmark,
  User,
  Settings,
  Database,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Trophy,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";

interface SidebarProps {
  isOpenOnMobile: boolean;
  setIsOpenOnMobile: (open: boolean) => void;
}

export function Sidebar({ isOpenOnMobile, setIsOpenOnMobile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const mainNav = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "DSA Sheets", to: "/sheets", icon: Layers },
    // { name: "Problems", to: "/problems", icon: BookOpen },
    { name: "Bookmarked Problems", to: "/bookmarks", icon: Bookmark },
    { name: "Revision Queue", to: "/revision", icon: RefreshCw },
    { name: "Collections", to: "/collections", icon: FolderHeart },
    { name: "Contests", to: "/contests", icon: Trophy },
  ];

  const userNav = [
    { name: "My Profile", to: "/profile", icon: User },
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  const adminNav = [
    { name: "Admin Summary", to: "/admin/dashboard", icon: Shield },
    { name: "Admin Problems", to: "/admin/problems", icon: Database },
    { name: "Admin Users", to: "/admin/users", icon: Users },
    { name: "Admin Analytics", to: "/admin/analytics", icon: Activity },
    { name: "Admin DSA Sheets", to: "/admin/sheets", icon: Layers },
  ];

  const renderNavGroup = (title: string, items: typeof mainNav) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </h3>
      )}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setIsOpenOnMobile(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group cursor-pointer",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )
          }
          title={isCollapsed ? item.name : undefined}
        >
          <item.icon className="size-4 shrink-0 group-hover:scale-105 transition-transform" />
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </NavLink>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={() => setIsOpenOnMobile(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Core Component Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-border bg-card shadow-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isOpenOnMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:sticky lg:h-screen"
        )}
      >
        {/* Brand Header */}
        <div className="relative flex h-14 items-center justify-between px-4 border-b border-border">
          {!isCollapsed ? (
            <Logo size={35} className="mx-auto" />
          ) : (
            <Logo size={24} iconOnly={true} className="mx-auto" />
          )}
          
          {/* Collapse toggle (desktop only) - floats on border line in between sidebar and header corner */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute top-4 -right-3 z-50 size-6 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer shadow-sm hover:scale-105 transition-all animate-in fade-in duration-200"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {renderNavGroup("Practice", mainNav)}
          {renderNavGroup("Account", userNav)}
          {user?.role?.toLowerCase() === "admin" && renderNavGroup("Management", adminNav)}
        </div>

        {/* Footer Area - Logout Only */}
        <div className="p-3 border-t border-border mt-auto">
          <button
            onClick={() => logout()}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              isCollapsed ? "justify-center" : ""
            )}
            title="Sign Out"
          >
            <LogOut className="size-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
