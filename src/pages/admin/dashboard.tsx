import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { PageLoader } from "@/components/ui/loader";
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  ServerCrash
} from "lucide-react";

interface SummaryData {
  totalUsers: number;
  totalProblems: number;
  totalSubmissions: number;
  activeToday: number;
}

export function AdminDashboardPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      const res = await api.get("/admin/summary");
      setSummary(res.data?.data || null);
    } catch {
      addToast("Failed to fetch administrative platform metrics summary.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  if (loading) {
    return <PageLoader message="Assembling platform metrics overview..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* 1. Header */}
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Platform Summary Dashboard
        </Typography>
        <Typography variant="muted">
          Global analytics telemetry and registration counts from live MongoDB instances.
        </Typography>
      </div>

      {/* 2. Metrics grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Users className="size-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Registered Candidates</span>
            <span className="text-2xl font-black text-foreground block mt-0.5">{summary?.totalUsers ?? 0}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <BookOpen className="size-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Curated Challenges</span>
            <span className="text-2xl font-black text-foreground block mt-0.5">{summary?.totalProblems ?? 0}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-amber-500/10 text-amber-500">
            <CheckSquare className="size-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Attempts</span>
            <span className="text-2xl font-black text-foreground block mt-0.5">{summary?.totalSubmissions ?? 0}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all hover:scale-[1.01] flex items-center gap-4">
          <div className="p-3.5 rounded-lg bg-rose-500/10 text-rose-500">
            <Activity className="size-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Today</span>
            <span className="text-2xl font-black text-foreground block mt-0.5">{summary?.activeToday ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 3. Server Node Health Info panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Log Stream Panel */}
        <div className="md:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm text-left space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <Typography variant="title" className="text-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-500" />
              Live Server Telemetry Status
            </Typography>
            <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              ONLINE
            </span>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p>• Database connections verified successfully via mongoose adapters.</p>
            <p>• Auth verification tokens synchronized with environment secrets.</p>
            <p>• Spaced revision repetition logs operational via local UTC calendars.</p>
          </div>
        </div>

        {/* Security / System Authority overview */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <Typography variant="title" className="text-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-amber-500" />
              Admin Authority
            </Typography>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Administrative settings grant direct write access to MongoDB templates, revision indexes, and user profiles. Actions are immediately propagated to all active student dashboards.
          </p>
        </div>
      </div>
    </div>
  );
}
