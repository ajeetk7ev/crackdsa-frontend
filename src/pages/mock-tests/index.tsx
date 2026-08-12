import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { MockTestCard } from "./components/MockTestCard";
import { MockTestStats } from "./components/MockTestStats";
import {
  ClipboardCheck,
  History,
  BarChart3,
  Filter,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Tab = "available" | "history" | "stats";
type DifficultyFilter = "all" | "Easy" | "Medium" | "Hard" | "Mixed";

export function MockTestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("available");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [tests, setTests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  const fetchTests = useCallback(async () => {
    try {
      const params: any = {};
      if (difficultyFilter !== "all") params.difficulty = difficultyFilter;
      const res = await api.get("/mock-tests", { params });
      setTests(res.data.data);
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to fetch mock tests.", "error");
    }
  }, [difficultyFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/mock-tests/my-stats");
      setStats(res.data.data);
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to fetch stats.", "error");
    }
  }, []);

  const fetchHistory = useCallback(async (page: number) => {
    try {
      const res = await api.get("/mock-tests/my-history", { params: { page, limit: 10 } });
      setHistory(res.data.data.attempts);
      setHistoryTotalPages(res.data.data.pagination.totalPages);
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to fetch history.", "error");
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchTests(), fetchStats(), fetchHistory(1)]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (!loading) fetchTests();
  }, [difficultyFilter]);

  const handleStart = (testId: string) => {
    navigate(`/mock-tests/${testId}/test`);
  };

  const handleViewResult = (testId: string) => {
    navigate(`/mock-tests/${testId}/result`);
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="h-7 w-1/3 rounded bg-muted/60" />
          <div className="h-4 w-2/3 rounded bg-muted/40" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card h-60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Typography variant="h2" className="font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="size-6 text-primary" />
          Mock Tests
        </Typography>
        <p className="text-sm text-muted-foreground mt-1">
          Practice timed coding assessments. Solve LeetCode problems under exam conditions.
        </p>
      </div>

      {/* Stats */}
      {stats && stats.testsTaken > 0 && <MockTestStats stats={stats} />}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border w-fit">
        {([
          { key: "available", label: "Available Tests", icon: ClipboardCheck },
          { key: "history", label: "My History", icon: History },
          { key: "stats", label: "My Stats", icon: BarChart3 },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              activeTab === key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Available Tests Tab */}
      {activeTab === "available" && (
        <div className="space-y-4">
          {/* Difficulty filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-3.5 text-muted-foreground" />
            {(["all", "Easy", "Medium", "Hard", "Mixed"] as DifficultyFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  difficultyFilter === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                }`}
              >
                {d === "all" ? "All Difficulties" : d}
              </button>
            ))}
          </div>

          {tests.length === 0 ? (
            <div className="p-12 rounded-xl border border-border bg-card/50 text-center">
              <ClipboardCheck className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No mock tests available.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <MockTestCard
                  key={test.id}
                  test={test}
                  onStart={() => handleStart(test.id)}
                  onViewResult={() => handleViewResult(test.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-12 rounded-xl border border-border bg-card/50 text-center">
              <History className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No mock test history yet.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Take your first mock test to see results here.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Test</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Score</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Time</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Date</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((attempt) => (
                      <tr key={attempt.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{attempt.mockTest?.title || "Unknown"}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-emerald-500">{attempt.scorePercent}%</span>
                          <span className="text-muted-foreground text-xs ml-1">({attempt.score}/{attempt.totalPoints})</span>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {attempt.totalTimeTaken >= 60
                              ? `${Math.floor(attempt.totalTimeTaken / 60)}m`
                              : `${attempt.totalTimeTaken}s`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            attempt.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : attempt.status === "timed_out"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}>
                            {attempt.status === "completed" ? "Completed" : attempt.status === "timed_out" ? "Timed Out" : "In Progress"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {attempt.completedAt
                            ? new Date(attempt.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const testId = attempt.mockTest?._id || attempt.mockTest?.id;
                              if (testId) navigate(`/mock-tests/${testId}/result`);
                            }}
                            className="text-xs cursor-pointer"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
                  <span className="text-xs text-muted-foreground">Page {historyPage} of {historyTotalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={historyPage <= 1} onClick={() => { setHistoryPage(historyPage - 1); fetchHistory(historyPage - 1); }} className="cursor-pointer">
                      <ChevronLeft className="size-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={historyPage >= historyTotalPages} onClick={() => { setHistoryPage(historyPage + 1); fetchHistory(historyPage + 1); }} className="cursor-pointer">
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          {stats && stats.testsTaken > 0 ? (
            <MockTestStats stats={stats} />
          ) : (
            <div className="p-12 rounded-xl border border-border bg-card/50 text-center">
              <BarChart3 className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No stats yet. Complete a mock test to see your analytics.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
