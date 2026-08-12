import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  ArrowLeft,
  Users,
  Target,
  Clock,
  CheckCircle2,
  ExternalLink,
  Award,
} from "lucide-react";

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function AdminMockTestAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/mock-tests/${id}`);
        setData(res.data.data);
      } catch (err: any) {
        addToast(err?.response?.data?.message || "Failed to load test analytics.", "error");
        navigate("/admin/mock-tests");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate, addToast]);

  if (loading || !data) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="p-8 rounded-xl border border-border bg-card h-36" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card h-28" />
          ))}
        </div>
      </div>
    );
  }

  const { analytics, recentAttempts } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/mock-tests")}
            className="flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Button>
          <div>
            <Typography variant="h2" className="font-bold text-foreground text-xl flex items-center gap-2">
              <BarChart2 className="size-5 text-primary" />
              {data.title} — Analytics
            </Typography>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.difficulty} · {data.durationMinutes} min · {data.problems?.length} problems · {data.totalPoints} total points
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/mock-tests/edit/${id}`)}
          className="text-xs cursor-pointer"
        >
          Edit Mock Test
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Users className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Total Attempts
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics?.totalAttempts || 0}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Completed
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">
            {analytics?.completedAttempts || 0}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Target className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Avg Score
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-500">
            {analytics?.avgScorePercent || 0}%
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Clock className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Duration Limit
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{data.durationMinutes}m</p>
        </div>
      </div>

      {/* Per-Problem Solve Rates */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
          Per-Problem Solve Rate Breakdown
        </h3>

        <div className="space-y-4">
          {analytics?.problemSolveRates?.map((item: any, idx: number) => {
            const prob = item.problem || {};
            const rate = item.solveRate || 0;
            return (
              <div key={prob._id || idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-muted-foreground">#{idx + 1}</span>
                    <span className="font-semibold text-foreground truncate">{prob.title}</span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                        difficultyBadge[prob.difficulty] || difficultyBadge.Medium
                      }`}
                    >
                      {prob.difficulty}
                    </span>
                    <span className="text-muted-foreground text-[10px]">({prob.topic})</span>
                  </div>
                  <span className="font-bold text-emerald-500 shrink-0">{rate}% Solved</span>
                </div>

                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
          Candidate Submissions & Performance ({recentAttempts?.length || 0})
        </h3>

        {recentAttempts?.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            No candidates have attempted this mock test yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">Candidate</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground text-xs">Score</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground text-xs">Time</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground text-xs">Status</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-muted-foreground text-xs">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt: any) => {
                  const scorePct =
                    attempt.totalPoints > 0
                      ? Math.round((attempt.score / attempt.totalPoints) * 100)
                      : 0;
                  return (
                    <tr key={attempt._id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {attempt.user?.avatar ? (
                            <img src={attempt.user.avatar} alt="" className="size-6 rounded-full object-cover" />
                          ) : (
                            <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {attempt.user?.firstname?.[0] || "?"}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {attempt.user?.firstname} {attempt.user?.lastname}
                            </p>
                            <p className="text-[10px] text-muted-foreground">@{attempt.user?.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-emerald-500 text-xs">{scorePct}%</span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({attempt.score}/{attempt.totalPoints})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {attempt.totalTimeTaken >= 60
                          ? `${Math.floor(attempt.totalTimeTaken / 60)}m`
                          : `${attempt.totalTimeTaken}s`}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            attempt.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {attempt.status === "completed" ? "Submitted" : "Timed Out"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
