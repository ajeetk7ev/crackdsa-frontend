import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowLeft,
  Share2,
  RotateCcw,
  Target,
  BarChart2,
} from "lucide-react";

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function MockTestResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/mock-tests/${id}/result`);
        if (!res.data.data || !res.data.data.attempt) {
          addToast("No completed attempt found for this mock test.", "warning");
          navigate(`/mock-tests`);
          return;
        }
        setData(res.data.data);
      } catch (err: any) {
        addToast(err?.response?.data?.message || "Failed to load test results.", "error");
        navigate(`/mock-tests`);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, navigate, addToast]);

  if (loading || !data) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="p-8 rounded-xl border border-border bg-card h-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card h-28" />
          ))}
        </div>
      </div>
    );
  }

  const { attempt, mockTest } = data;
  const scorePercent =
    attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;
  const solvedCount =
    attempt.problemResults?.filter((r: any) => r.status === "solved").length || 0;
  const totalProblems = mockTest.problems?.length || 0;

  const getPerformanceMessage = (pct: number) => {
    if (pct === 100) return { title: "Outstanding Performance! 🏆", desc: "Perfect score! You mastered all problems in this mock assessment." };
    if (pct >= 75) return { title: "Great Job! 🎯", desc: "Solid performance. You demonstrated strong problem-solving skills under time pressure." };
    if (pct >= 50) return { title: "Good Attempt! 👍", desc: "You passed the benchmark. Review the unsolved problems to solidify concepts." };
    return { title: "Keep Practicing! 💪", desc: "Time management and pattern recognition take practice. Upsolve the remaining questions!" };
  };

  const perf = getPerformanceMessage(scorePercent);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/mock-tests")}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <ArrowLeft className="size-3.5" /> Back to Mock Tests
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/mock-tests/${id}/leaderboard`)}
          className="flex items-center gap-2 cursor-pointer text-xs text-primary border-primary/30 hover:bg-primary/10"
        >
          <Trophy className="size-3.5" /> View Leaderboard
        </Button>
      </div>

      {/* Hero Summary Card */}
      <div className="relative overflow-hidden p-8 rounded-2xl border border-border bg-card shadow-sm text-center space-y-6">
        <div className="absolute -top-24 -left-24 size-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <Trophy className="size-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{perf.title}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">{perf.desc}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4 border-t border-border/60">
          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Final Score
            </span>
            <span className="text-2xl font-bold text-emerald-500">{scorePercent}%</span>
            <span className="text-xs text-muted-foreground block">
              {attempt.score}/{attempt.totalPoints} pts
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Solved
            </span>
            <span className="text-2xl font-bold text-foreground">{solvedCount}</span>
            <span className="text-xs text-muted-foreground block">
              out of {totalProblems}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Time Taken
            </span>
            <span className="text-2xl font-bold text-indigo-500 font-mono">
              {attempt.totalTimeTaken >= 60
                ? `${Math.floor(attempt.totalTimeTaken / 60)}m`
                : `${attempt.totalTimeTaken}s`}
            </span>
            <span className="text-xs text-muted-foreground block">
              limit: {mockTest.durationMinutes}m
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Status
            </span>
            <span className="text-lg font-bold capitalize text-foreground mt-1 block">
              {attempt.status === "completed" ? "Submitted" : "Timed Out"}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Problem Breakdown Section */}
      <div className="space-y-4">
        <Typography variant="h3" className="font-semibold text-foreground border-l-2 border-primary pl-2 text-left text-base">
          Problem Breakdown & Solutions
        </Typography>

        <div className="space-y-3">
          {mockTest.problems?.map((p: any, index: number) => {
            const prob = p.problem;
            const res = attempt.problemResults?.find(
              (r: any) => (r.problem?._id || r.problem).toString() === (prob?._id || prob).toString()
            );

            const isSolved = res?.status === "solved";
            const isAttempted = res?.status === "attempted";

            return (
              <div
                key={prob?._id || index}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 flex-wrap ${
                  isSolved
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isAttempted
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSolved
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : isAttempted
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isSolved ? "✓" : index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {prob?.title || "Problem"}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          difficultyBadge[prob?.difficulty] || difficultyBadge.Medium
                        }`}
                      >
                        {prob?.difficulty}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      {prob?.topic} · Max: {p.points} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold block ${
                        isSolved ? "text-emerald-500" : "text-muted-foreground"
                      }`}
                    >
                      +{res?.pointsEarned || 0} pts
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {res?.timeTaken ? `${Math.round(res.timeTaken / 60)}m logged` : "—"}
                    </span>
                  </div>

                  {prob?.leetcodeUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(prob.leetcodeUrl, "_blank")}
                      className="text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      LeetCode <ExternalLink className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
