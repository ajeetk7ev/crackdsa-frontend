import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/loader";

import {
  CheckCircle2,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
  status: string;
  interval: number;
  repetitions: number;
}

type FilterMode = "All" | "Due" | "Overdue" | "Completed" | "Bookmarked" | "Mastered";

export function RevisionPage() {
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  // States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterMode, setFilterMode] = useState<FilterMode>("Due");

  // Load Data
  const loadRevisionData = async () => {
    try {
      const probRes = await api.get("/problems");
      const revRes = await api.get("/revisions");
      
      const rawSub = localStorage.getItem("mock_submissions") || "[]";
      const rawBookmarks = localStorage.getItem("crackdsa_bookmarks") || "[]";

      setProblems(probRes.data);
      setRevisions(revRes.data);
      setSubmissions(JSON.parse(rawSub));
      setBookmarks(JSON.parse(rawBookmarks));
    } catch {
      addToast("Failed to fetch revision database logs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevisionData();
  }, []);

  // Filter Helper Logic
  const processedQueue = useMemo(() => {
    let result = revisions.map((rev) => {
      const prob = problems.find((p) => p.id === rev.problemId);
      const probSubmissions = submissions.filter((s) => s.problemId === rev.problemId);
      
      return {
        ...rev,
        problemTitle: prob?.title || "Unknown Problem",
        topic: prob?.topic || "Arrays",
        difficulty: prob?.difficulty || "Medium",
        submissions: probSubmissions,
      };
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const nowTime = Date.now();

    if (filterMode === "Due") {
      result = result.filter((r) => {
        const d = new Date(r.nextReviewDate).getTime();
        return d <= nowTime && r.status === "todo";
      });
    } 
    else if (filterMode === "Overdue") {
      result = result.filter((r) => {
        const d = new Date(r.nextReviewDate).getTime();
        // Overdue if nextReviewDate is yesterday or older and status is todo
        const yesterday = Date.now() - 24 * 3600 * 1000;
        return d < yesterday && r.status === "todo";
      });
    } 
    else if (filterMode === "Completed") {
      // Completed reviews logged today
      const todayStr = new Date().toISOString().split("T")[0];
      result = result.filter((r) => {
        return r.submissions.some((s) => s.status === "Correct" && s.date.startsWith(todayStr));
      });
    } 
    else if (filterMode === "Bookmarked") {
      result = result.filter((r) => bookmarks.includes(r.problemId));
    } 
    else if (filterMode === "Mastered") {
      result = result.filter((r) => r.interval >= 15);
    }

    return result;
  }, [revisions, problems, submissions, bookmarks, filterMode]);

  // Calculations for Hero / Progress Cards
  const dueItems = useMemo(() => {
    const nowTime = Date.now();
    return revisions.filter((r) => new Date(r.nextReviewDate).getTime() <= nowTime && r.status === "todo");
  }, [revisions]);

  const completedTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const uniqueSolvedToday = new Set(
      submissions
        .filter((s) => s.status === "Correct" && s.date.startsWith(todayStr))
        .map((s) => s.problemId)
    );
    return uniqueSolvedToday.size;
  }, [submissions]);

  const totalTodayTasks = dueItems.length + completedTodayCount;
  const progressPercent = totalTodayTasks > 0 ? Math.ceil((completedTodayCount / totalTodayTasks) * 100) : 0;

  // Estimated Time: 15 min per due problem
  const estMinutes = dueItems.length * 15;
  const estHours = Math.floor(estMinutes / 60);
  const estRemainingMins = estMinutes % 60;
  const estTimeStr = estHours > 0 ? `${estHours}h ${estRemainingMins}m` : `${estRemainingMins}m`;

  // Difficulty breakdown of due tasks
  const difficultyBreakdown = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    dueItems.forEach((rev) => {
      const prob = problems.find((p) => p.id === rev.problemId);
      if (prob) {
        const diff = prob.difficulty as "Easy" | "Medium" | "Hard";
        if (counts[diff] !== undefined) counts[diff]++;
      }
    });
    return counts;
  }, [dueItems, problems]);

  // Tomorrow / Weekly / Monthly Forecasts
  const forecastCounts = useMemo(() => {
    const now = Date.now();
    const tomorrowLimit = now + 24 * 3600 * 1000;
    const weekLimit = now + 7 * 24 * 3600 * 1000;
    const monthLimit = now + 30 * 24 * 3600 * 1000;

    const tomorrow = revisions.filter((r) => {
      const d = new Date(r.nextReviewDate).getTime();
      return d > now && d <= tomorrowLimit && r.status === "todo";
    }).length;

    const thisWeek = revisions.filter((r) => {
      const d = new Date(r.nextReviewDate).getTime();
      return d > now && d <= weekLimit && r.status === "todo";
    }).length;

    const nextMonth = revisions.filter((r) => {
      const d = new Date(r.nextReviewDate).getTime();
      return d > now && d <= monthLimit && r.status === "todo";
    }).length;

    return { tomorrow, thisWeek, nextMonth };
  }, [revisions]);

  // Dynamic status check resolver
  const getProblemStatusDot = (probId: string) => {
    const revision = revisions.find((r) => r.problemId === probId);
    
    if (revision) {
      if (revision.interval >= 15) return "🟣";
      if (revision.status === "todo") {
        const isDue = new Date(revision.nextReviewDate).getTime() <= Date.now();
        return isDue ? "🟡" : "🔵";
      }
      return "🔵";
    }
    return "⚪";
  };

  // Last revised relative dates
  const getLastRevisedLabel = (subs: any[]) => {
    if (subs.length === 0) return "Never";
    const correctOnes = subs.filter((s) => s.status === "Correct");
    if (correctOnes.length === 0) return "Never";
    
    const latest = new Date(correctOnes[0].date);
    const diffDays = Math.ceil(Math.abs(Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Just now";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Streaks count resolver
  const activeStreak = useMemo(() => {
    const streaks = JSON.parse(localStorage.getItem("mock_streaks") || "[]");
    return streaks.length;
  }, []);

  // Solve accuracy today
  const todayAccuracy = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySubs = submissions.filter((s) => s.date.startsWith(todayStr));
    if (todaySubs.length === 0) return "100%";
    const correctCount = todaySubs.filter((s) => s.status === "Correct").length;
    return `${Math.ceil((correctCount / todaySubs.length) * 100)}%`;
  }, [submissions]);

  // Mastered counts
  const masteredCount = useMemo(() => {
    return revisions.filter((r) => r.interval >= 15).length;
  }, [revisions]);

  // Trigger start review
  const handleStartRevising = () => {
    if (dueItems.length > 0) {
      navigate(`/problems/${dueItems[0].problemId}`);
    } else {
      addToast("Your revision queue is fully caught up!", "success");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted/60 rounded animate-pulse" />
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      
      {/* Page Header */}
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          Daily Revision Board
        </Typography>
        <Typography variant="muted">
          Spaced repetition recall loops to solidify algorithm pattern retention.
        </Typography>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Left Column (2/3 width) - Today's Mission & Queue Table */}
        <div className="md:col-span-2 space-y-6">
          
          {/* SECTION 1: TODAY'S MISSION HERO CARD */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                Today's Mission
              </span>
              <Typography variant="h2" className="font-semibold text-foreground">
                Today's Revision Queue
              </Typography>
              
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
                <span className="font-semibold text-foreground">{dueItems.length} Problems Due</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-indigo-500" /> Est: {estTimeStr}
                </span>
                <span>•</span>
                <span className="space-x-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Easy {difficultyBreakdown.Easy}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">Medium {difficultyBreakdown.Medium}</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">Hard {difficultyBreakdown.Hard}</span>
                </span>
              </div>
            </div>

            <Button
              onClick={handleStartRevising}
              disabled={dueItems.length === 0}
              variant="default"
              className="h-10 px-6 cursor-pointer shadow-sm shrink-0"
            >
              Start Revising
            </Button>
          </div>

          {/* SECTION 2: TODAY'S REVISION PROGRESS BAR */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-muted-foreground uppercase">Today's Progress</span>
              <span className="font-semibold text-foreground">
                {completedTodayCount} / {totalTodayTasks} Revised ({progressPercent}%)
              </span>
            </div>
            
            {/* Progress bar line */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* SECTION 4: QUICK FILTERS TOOLBAR */}
          <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
            {(["Due", "Overdue", "Completed", "Bookmarked", "Mastered", "All"] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  filterMode === mode
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                )}
              >
                {mode === "Due" ? "Due Today" : mode === "All" ? "Show All" : mode}
              </button>
            ))}
          </div>

          {/* SECTION 3: REVISION QUEUE DATA TABLE */}
          <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
                    <th className="px-4 py-3 text-center w-12">S</th>
                    <th className="px-4 py-3">Problem</th>
                    <th className="px-4 py-3 w-32">Topic</th>
                    <th className="px-4 py-3 w-28">Difficulty</th>
                    <th className="px-4 py-3 w-28 text-center">Revision #</th>
                    <th className="px-4 py-3 w-32">Last Solved</th>
                    <th className="px-4 py-3 w-32">Due Date</th>
                    <th className="px-4 py-3 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {processedQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <XCircleWidget mode={filterMode} />
                      </td>
                    </tr>
                  ) : (
                    processedQueue.map((item) => {
                      const dot = getProblemStatusDot(item.problemId);
                      const isDue = new Date(item.nextReviewDate).getTime() <= Date.now();

                      return (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 text-center text-base">
                            {dot}
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/problems/${item.problemId}`} className="font-semibold text-foreground hover:underline">
                              {item.problemTitle}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground font-medium">
                            {item.topic}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5", difficultyColors[item.difficulty])}>
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-xs font-semibold">
                            {item.repetitions}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {getLastRevisedLabel(item.submissions)}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium">
                            <span className={cn(
                              isDue && item.status === "todo" ? "text-rose-500 font-semibold" : "text-muted-foreground"
                            )}>
                              {item.status === "completed" ? "Done" : isDue ? "Overdue" : new Date(item.nextReviewDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link to={`/problems/${item.problemId}`}>
                              <Button
                                variant="outline"
                                size="xs"
                                className="text-xs h-7 hover:bg-indigo-500/10 hover:text-indigo-600 cursor-pointer"
                              >
                                Review <ChevronRight className="size-3 ml-0.5" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - upcoming list, stats metrics, motivational cards */}
        <div className="space-y-6">
          
          {/* SECTION 8: MOTIVATION ALERTS CARD */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-center space-y-3 relative overflow-hidden">
            <div className="size-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-xl">
              🔥
            </div>
            
            {dueItems.length > 0 ? (
              <div className="space-y-1">
                <Typography variant="title" className="text-foreground block">
                  Keep the Momentum Going!
                </Typography>
                <p className="text-xs text-muted-foreground">
                  Only <span className="font-bold text-foreground">{dueItems.length} problems</span> left to revise today. Complete them to safeguard your consistency streak.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Typography variant="title" className="text-emerald-600 dark:text-emerald-400 block font-semibold">
                  Today's Revision Completed
                </Typography>
                <p className="text-xs text-muted-foreground">
                  Great job! You have cleared today's spaced recall queue. Solve new challenges to build memory index lists.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 6: UPCOMING REVISIONS FORECAST */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <Typography variant="title" className="text-foreground block">
                Upcoming Revision Forecast
              </Typography>
            </div>
            
            <div className="space-y-3">
              {[
                { label: "Tomorrow", count: forecastCounts.tomorrow },
                { label: "This Week", count: forecastCounts.thisWeek },
                { label: "Next Month", count: forecastCounts.nextMonth },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-xs p-2.5 rounded bg-background border border-border">
                  <span className="font-semibold text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-full">
                    {item.count} {item.count === 1 ? "problem" : "problems"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: REVISION STATISTICS (TINY STATS) */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <Typography variant="title" className="text-foreground">
                Recall Statistics
              </Typography>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Today's Accuracy</span>
                <span className="text-sm font-semibold text-foreground">{todayAccuracy}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Completed Solves</span>
                <span className="text-sm font-semibold text-foreground">{submissions.filter((s) => s.status === "Correct").length}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Current Streak</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-0.5">
                  <Flame className="size-3.5 text-amber-500 fill-amber-500/10" /> {activeStreak} Days
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Mastered Items</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-0.5">
                  <Sparkles className="size-3.5 text-purple-500 fill-purple-500/10" /> {masteredCount} Items
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Subcomponent for empty views
function XCircleWidget({ mode }: { mode: FilterMode }) {
  const configs = {
    Due: { title: "Spaced Queue Clear", desc: "No revisions scheduled for today. Maintain streak safety by solving new challenges." },
    Overdue: { title: "No Overdue Reviews", desc: "Fantastic recall timing! All overdue reviews are fully revised." },
    Completed: { title: "No Solves Tracked Today", desc: "Start practicing your due revision questions to track achievements here." },
    Bookmarked: { title: "No Bookmarked Revisions", desc: "Toggle bookmark stars on Problems Explorer page to categorize lists here." },
    Mastered: { title: "No Mastered Questions", desc: "Intervals update to Mastered status as you repeat correct recall reviews." },
    All: { title: "Revision Queue Empty", desc: "Solve questions in Problems explorer directory to schedule SM2 recall logs." },
  };

  const current = configs[mode] || configs.All;

  return (
    <div className="max-w-md mx-auto space-y-2 py-4">
      <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
      <p className="font-semibold text-foreground">{current.title}</p>
      <p className="text-xs text-muted-foreground">{current.desc}</p>
    </div>
  );
}
