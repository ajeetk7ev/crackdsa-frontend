import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Sidebar } from "@/components/common/Sidebar";
import { Navbar } from "@/components/common/Navbar";
import { PageLoader } from "@/components/ui/loader";
import { ToastContainer } from "@/components/common/Toast";
import { ShieldAlert } from "lucide-react";

export function AdminLayout() {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  // Enforce auth and admin access restrictions
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/auth/login", { replace: true });
      } else if (user?.role !== "admin") {
        useNotificationStore.getState().error("Access Denied: Administrative credentials required.");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return <PageLoader message="Validating admin authorization credentials..." />;
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* 1. Sidebar Container */}
      <Sidebar
        isOpenOnMobile={mobileMenuOpen}
        setIsOpenOnMobile={setMobileMenuOpen}
      />

      {/* 2. Main Content Frame */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
        
        {/* Subtle top banner indicating Admin visibility */}
        <div className="flex items-center gap-2 px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-500">
          <ShieldAlert className="size-3.5 shrink-0" />
          Administrative Mode: Changes will affect the global Mock Database instantly.
        </div>

        {/* Workspace panel content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 bg-background-secondary/40">
          <Outlet />
        </main>
      </div>

      {/* Toast provider */}
      <ToastContainer />
    </div>
  );
}
