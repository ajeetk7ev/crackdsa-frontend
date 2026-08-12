import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import {
  ClipboardCheck,
  ChevronRight,
  Clock,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
  Mixed: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export function MockTestWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/mock-tests/dashboard-summary");
        setData(res.data.data);
      } catch {
        // Silently fail if endpoint is temporarily unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-xl border border-border bg-card animate-pulse space-y-4">
        <div className="h-5 w-1/3 rounded bg-muted/60" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded bg-muted/30" />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-14 rounded bg-muted/30" />
          <div className="h-14 rounded bg-muted/30" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    testsTaken: 0,
    avgScorePercent: 0,
    bestScorePercent: 0,
    totalTimeMinutes: 0,
  };

  const recentTests = data?.recentTests || [];

  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <ClipboardCheck className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Mock Tests Assessment</h3>
        </div>
        <button
          onClick={() => navigate("/mock-tests")}
          className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          View All ({recentTests.length > 0 ? "Hub" : "Explore"})
          <ChevronRight className="size-3" />
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/80 text-center">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Tests Taken
          </span>
          <span className="text-base font-bold text-foreground">{stats.testsTaken}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/80 text-center">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Avg Score
          </span>
          <span className="text-base font-bold text-amber-500">{stats.avgScorePercent}%</span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/80 text-center">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Best Score
          </span>
          <span className="text-base font-bold text-emerald-500">{stats.bestScorePercent}%</span>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/80 text-center">
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
            Total Time
          </span>
          <span className="text-base font-bold text-blue-500 font-mono">
            {stats.totalTimeMinutes >= 60
              ? `${Math.floor(stats.totalTimeMinutes / 60)}h ${stats.totalTimeMinutes % 60}m`
              : `${stats.totalTimeMinutes}m`}
          </span>
        </div>
      </div>

      {/* Recommended / Suggested Mock Tests */}
      <div className="space-y-2">
        {recentTests.length === 0 ? (
          <div className="py-6 text-center">
            <ClipboardCheck className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No mock tests available.</p>
          </div>
        ) : (
          recentTests.slice(0, 3).map((test: any) => {
            const isCompleted = Boolean(test.userAttempt);
            return (
              <div
                key={test.id || test.title}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">{test.title}</p>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        difficultyBadge[test.difficulty] || difficultyBadge.Mixed
                      }`}
                    >
                      {test.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="size-2.5" /> {test.duration}m
                    </span>
                    {test.tags?.length > 0 && (
                      <>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          #{test.tags[0]}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {isCompleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mock-tests/${test.id}/result`)}
                      className="h-7 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
                    >
                      Score: {test.userAttempt.score}%
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/mock-tests/${test.id}/test`)}
                      className="h-7 text-xs flex items-center gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Start <ChevronRight className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
