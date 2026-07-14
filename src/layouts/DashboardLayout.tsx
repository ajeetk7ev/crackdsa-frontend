import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Sidebar } from "@/components/common/Sidebar";
import { Navbar } from "@/components/common/Navbar";
import { PageLoader } from "@/components/ui/loader";
import { ToastContainer } from "@/components/common/Toast";

export function DashboardLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Perform initial session checks
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  // Navigate to login if auth checks complete and user is unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <PageLoader message="Loading dashboard workspace..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      {/* 1. Sidebar Container */}
      <Sidebar
        isOpenOnMobile={mobileMenuOpen}
        setIsOpenOnMobile={setMobileMenuOpen}
      />

      {/* 2. Main Content Frame */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onMenuToggle={() => setMobileMenuOpen((prev) => !prev)} />
        
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
