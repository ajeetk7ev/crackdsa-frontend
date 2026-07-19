import { useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { Sun, Moon, Calendar, Zap, Target } from "lucide-react";
import { ToastContainer } from "@/components/common/Toast";
import { PageLoader } from "@/components/ui/loader";
import { Logo } from "@/components/common/Logo";

export function AuthLayout() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  // Perform initial session check
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  // Redirect immediately if already signed in
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <PageLoader message="Verifying session..." />;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* 1. Left Graphic Panel (Desktop only) */}
      <div className="hidden lg:flex w-1/2 bg-black dark:bg-[#0a0a0a] text-white p-12 flex-col justify-between relative overflow-hidden border-r border-border">
        {/* Subtle grid lines background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <Link to="/" className="flex items-center gap-2 select-none relative z-10">
          <Logo size={40} textColorClass="text-white" />
        </Link>

        {/* Motivational / Feature highlight block */}
        <div className="space-y-6 relative z-10 max-w-lg">
          <h2 className="text-3xl font-light leading-tight tracking-tight">
            Stop grind-and-forget. <br />
            <span className="font-semibold text-white">Retain your solutions.</span>
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            CrackDSA uses intelligent spaced-repetition logic, similar to Anki, that schedules active recall reminders for every coding question you solve. Ensure your algorithms memory remains fresh for interviews.
          </p>

          {/* Linear-style feature micro-grid */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <Calendar className="size-4 text-emerald-500 mb-1.5" />
              <p className="text-xs font-semibold text-white">SRS Cycles</p>
              <p className="text-[10px] text-zinc-500">Auto Anki schedule</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <Zap className="size-4 text-amber-500 mb-1.5" />
              <p className="text-xs font-semibold text-white">12d Streak</p>
              <p className="text-[10px] text-zinc-500">Consistency helper</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <Target className="size-4 text-indigo-500 mb-1.5" />
              <p className="text-xs font-semibold text-white">Readiness Index</p>
              <p className="text-[10px] text-zinc-500">Track mock speeds</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-500 relative z-10">
          © {new Date().getFullYear()} CrackDSA SaaS Inc. All rights reserved.
        </p>
      </div>

      {/* 2. Right Credentials Input Panel */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-12 relative">
        <header className="flex justify-between items-center lg:justify-end mb-6">
          <Link to="/" className="lg:hidden flex items-center gap-2 select-none">
            <Logo size={60} />
          </Link>
          <button
            onClick={() => toggleTheme()}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center max-w-sm w-full mx-auto">
          <Outlet />
        </main>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms and Privacy details.
        </footer>
      </div>

      {/* Toast provider */}
      <ToastContainer />
    </div>
  );
}
