import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/loader";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";
import { StatusChangeModal } from "@/components/common/StatusChangeModal";
import { PomodoroPromptModal } from "@/components/common/PomodoroPromptModal";
import { Select } from "@/components/ui/select";

import {
  CheckCircle2,
  Flame,
  Clock,
  Sparkles,
  CircleDashed,
  Zap,
  Crown,
  Bookmark,
  FileText,
  Eye,
  RefreshCw,
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


export function RevisionPage() {
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  // States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tableRevisions, setTableRevisions] = useState<RevisionItem[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    dueTodayCount: 0,
    completedTodayCount: 0,
    difficultyBreakdown: { Easy: 0, Medium: 0, Hard: 0 },
    forecast: { tomorrow: 0, thisWeek: 0, nextMonth: 0 },
    recallStats: { streak: 0, completedSolves: 0, masteredItems: 0 }
  });
  
  const [statusFilter, setStatusFilter] = useState<"Due" | "Completed" | "Overdue" | "Bookmarked" | "Mastered" | "All">("Due");
  const [timeframeFilter, setTimeframeFilter] = useState<"Today" | "Week" | "Month" | "All">("Today");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, _] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [statusModalProblem, setStatusModalProblem] = useState<{ id: string; title: string } | null>(null);
  const [pomodoroPromptProblem, setPomodoroPromptProblem] = useState<{ id: string; title: string; difficulty: string; leetcodeUrl: string } | null>(null);
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Load Data
  const loadRevisionData = async () => {
    try {
      const [probRes, statsRes, progRes] = await Promise.all([
        api.get("/problems?limit=1000"),
        api.get("/revisions/stats"),
        api.get("/progress")
      ]);
      
      setProblems(probRes.data.data.problems);
      setStats(statsRes.data.data);
      setProgressList(progRes.data.data);
    } catch (err:any) {
      addToast(err?.response?.data?.message || "Failed to fetch initial page metrics.", "error");
    }
  };

  // Fetch filtered revisions list for the table with pagination parameters
  const fetchTableRevisions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/revisions", {
        params: {
          status: statusFilter,
          timeframe: timeframeFilter,
          page: currentPage,
          limit: limitPerPage
        }
      });
      setTableRevisions(res.data.data.revisions);
      if (res.data.data.pagination) {
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalItems(res.data.data.pagination.total);
      }
    } catch(err:any) {
      addToast(err?.response?.data?.message || "Failed to fetch filtered revisions from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevisionData();
  }, []);

  // Reset pagination page to 1 whenever dropdown filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, timeframeFilter]);

  // Refetch table rows when filters or page settings change
  useEffect(() => {
    fetchTableRevisions();
  }, [statusFilter, timeframeFilter, currentPage, limitPerPage]);

  // Filter Helper Logic: Simply map problem meta-data to tableRevisions
  const processedQueue = useMemo(() => {
    return tableRevisions.map((rev) => {
      const prob = problems.find((p) => p.id === rev.problemId);
      const prog = progressList.find((p) => p.problemId === rev.problemId);
      
      return {
        ...rev,
        problemTitle: prob?.title || "Unknown Problem",
        topic: prob?.topic || "Arrays",
        difficulty: prob?.difficulty || "Medium",
        isBookmarked: prog?.isBookmarked || false,
        note: prog?.note || ""
      };
    });
  }, [tableRevisions, problems, progressList]);

  // Calculations for Hero / Progress Cards from backend stats
  const totalTodayTasks = stats.dueTodayCount + stats.completedTodayCount;
  const progressPercent = totalTodayTasks > 0 ? Math.ceil((stats.completedTodayCount / totalTodayTasks) * 100) : 0;

  // Estimated Time: 15 min per due problem
  const estMinutes = stats.dueTodayCount * 15;
  const estHours = Math.floor(estMinutes / 60);
  const estRemainingMins = estMinutes % 60;
  const estTimeStr = estHours > 0 ? `${estHours}h ${estRemainingMins}m` : `${estRemainingMins}m`;

  const difficultyBreakdown = stats.difficultyBreakdown;
  const forecastCounts = stats.forecast;

  // Dynamic status check resolver
  const getProblemStatusDot = (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    if (!prog) {
      return {
        text: "Not Started",
        icon: <CircleDashed className="size-4 text-muted-foreground/60 mx-auto" />
      };
    }

    if (prog.status === "Mastered") {
      return {
        text: "Mastered",
        icon: <Crown className="size-4 text-purple-500 mx-auto animate-pulse" />
      };
    }
    if (prog.status === "Needs Revision") {
      return {
        text: "Needs Revision",
        icon: <Clock className="size-4 text-amber-500 mx-auto" />
      };
    }
    if (prog.status === "Revised Once") {
      return {
        text: "Revised Once",
        icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
      };
    }
    if (prog.status === "Revised Twice") {
      return {
        text: "Revised Twice",
        icon: <Flame className="size-4 text-orange-500 mx-auto" />
      };
    }
    if (prog.status === "Solved") {
      return {
        text: "Solved",
        icon: <Sparkles className="size-4 text-emerald-500 mx-auto" />
      };
    }
    if (prog.status === "Attempted") {
      return {
        text: "Attempted",
        icon: <Zap className="size-4 text-amber-400 mx-auto" />
      };
    }

    return {
      text: "Not Started",
      icon: <CircleDashed className="size-4 text-muted-foreground/60 mx-auto" />
    };
  };

  // Last revised relative dates
  const getLastRevisedLabel = (problemId: string) => {
    const prog = progressList.find((p) => p.problemId === problemId);
    if (!prog) return "Never";
    
    const dateVal = prog.lastSolved || prog.updatedAt;
    if (!dateVal) return "Never";
    
    const latest = new Date(dateVal);
    if (isNaN(latest.getTime())) return "Never";
    
    return latest.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  
  const activeStreak = stats.recallStats.streak;

  // Solve accuracy today
  const todayAccuracy = "100%";

  // Mastered counts
  const masteredCount = stats.recallStats.masteredItems;

  // Trigger start review
  const handleStartRevising = () => {
    const due = tableRevisions.find((r) => r.status === "todo" && new Date(r.nextReviewDate).getTime() <= Date.now());
    if (due) {
      navigate(`/problems/${due.problemId}`);
    } else {
      addToast("Your revision queue is fully caught up!", "success");
    }
  };

  // Bookmark Toggle
  const handleBookmarkToggle = async (probId: string) => {
    try {
      const prog = progressList.find((p) => p.problemId === probId);
      const isBookmarked = prog ? prog.isBookmarked : false;
      await api.put(`/progress/${probId}`, { isBookmarked: !isBookmarked });
      addToast(isBookmarked ? "Bookmark removed." : "Problem bookmarked.", "success");
      loadRevisionData();
      fetchTableRevisions();
    } catch(err:any) {
      addToast(err?.response?.data?.message || "Failed to toggle bookmark.", "error");
    }
  };

  // Open Status Dialog
  const handleOpenStatusModal = (id: string, title: string) => {
    setStatusModalProblem({ id, title });
  };

  // Open Notes Dialog
  const handleOpenNoteModal = (probId: string) => {
    setActiveNoteProblemId(probId);
    const prog = progressList.find((p) => p.problemId === probId);
    setActiveNoteText(prog?.note || "");
  };

  // Save Notes Dialog
  const handleSaveNotes = async () => {
    if (!activeNoteProblemId) return;
    setSavingNote(true);
    try {
      await api.post(`/notes/${activeNoteProblemId}`, { note: activeNoteText });
      addToast("Problem notes saved.", "success");
      setActiveNoteProblemId(null);
      loadRevisionData();
      fetchTableRevisions();
    } catch(err:any) {
      addToast(err?.response?.data?.message || "Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const getRevisionBadge = (repetitions: number) => {
    if (repetitions === 1) return "1st Rev";
    if (repetitions === 2) return "2nd Rev";
    if (repetitions === 3) return "3rd Rev";
    return `${repetitions}th Rev`;
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

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* SECTION 1: TODAY'S MISSION HERO CARD */}
        <div className="col-span-full lg:col-span-2 order-1 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
              Today's Mission
            </span>
            <Typography variant="h2" className="font-semibold text-foreground">
              Today's Revision Queue
            </Typography>
            
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
              <span className="font-semibold text-foreground">{stats.dueTodayCount} Problems Due</span>
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
            disabled={stats.dueTodayCount === 0}
            variant="default"
            className="h-10 px-6 cursor-pointer shadow-sm shrink-0"
          >
            Start Revising
          </Button>
        </div>

        {/* SECTION 2: TODAY'S REVISION PROGRESS BAR & STATS CARD */}
        <div className="col-span-full lg:col-span-2 order-2 lg:order-3 p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
          {/* Progress bar info */}
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-muted-foreground uppercase">Today's Progress</span>
              <span className="font-semibold text-foreground">
                {stats.completedTodayCount} / {totalTodayTasks} Revised ({progressPercent}%)
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

          <div className="border-t border-border/40" />

          {/* Recall Statistics details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Today's Accuracy</span>
              <span className="text-sm font-semibold text-foreground">{todayAccuracy}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Completed Solves</span>
              <span className="text-sm font-semibold text-foreground">{stats.recallStats.completedSolves}</span>
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

        {/* SECTION 8: MOTIVATION ALERTS CARD */}
        <div className="col-span-full lg:col-span-1 order-3 lg:order-2 p-6 rounded-xl border border-border bg-card shadow-sm text-center space-y-3 relative overflow-hidden flex flex-col justify-center">
          <div className="size-10 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-xl">
            🔥
          </div>
          
          {stats.dueTodayCount > 0 ? (
            <div className="space-y-1">
              <Typography variant="title" className="text-foreground block font-semibold">
                Keep the Momentum Going!
              </Typography>
              <p className="text-xs text-muted-foreground">
                Only <span className="font-bold text-foreground">{stats.dueTodayCount} problems</span> left to revise today. Complete them to safeguard your consistency streak.
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
        <div className="col-span-full lg:col-span-1 order-4 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <Typography variant="title" className="text-foreground block font-semibold">
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

        {/* SECTION 4: SELECT DROPDOWN FILTERS & SECTION 3: REVISION QUEUE DATA TABLE (Unified into a single layout section) */}
        <div className="col-span-full order-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider shrink-0 select-none">
                Category:
              </span>
              <Select
                options={[
                  { value: "Due", label: "Due / Active Revisions" },
                  { value: "Completed", label: "Completed Revisions" },
                  { value: "Overdue", label: "Overdue Only" },
                  { value: "Bookmarked", label: "Bookmarked Only" },
                  { value: "Mastered", label: "Mastered Only" },
                  { value: "All", label: "Show All Statuses" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-56 text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider shrink-0 select-none">
                Timeframe:
              </span>
              <Select
                options={[
                  { value: "Today", label: "Today" },
                  { value: "Week", label: "This Week" },
                  { value: "Month", label: "This Month" },
                  { value: "All", label: "All Time" },
                ]}
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value as any)}
                className="w-40 text-xs font-semibold"
              />
            </div>

            {/* Reset button to default values if changed */}
            {(statusFilter !== "Due" || timeframeFilter !== "Today") && (
              <button
                onClick={() => {
                  setStatusFilter("Due");
                  setTimeframeFilter("Today");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold cursor-pointer transition-colors self-center sm:ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden text-left">
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground select-none">
                    <th className="px-4 py-3 text-center w-16 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Status</th>
                    <th className="px-4 py-3 w-20 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">ID</th>
                    <th className="px-4 py-3 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Problem</th>
                    <th className="px-4 py-3 text-center w-24 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Practice</th>
                    <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Difficulty</th>
                    <th className="px-4 py-3 w-28 text-center sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Revision</th>
                    <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Last Solved</th>
                    <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Due Date</th>
                    <th className="px-4 py-3 text-center w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {processedQueue.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        <XCircleWidget status={statusFilter} />
                      </td>
                    </tr>
                  ) : (
                    processedQueue.map((item) => {
                      const prog = progressList.find((p) => p.problemId === item.problemId);
                      const stat = getProblemStatusDot(item.problemId);
                      const isBook = item.isBookmarked;
                      const hasNote = item.note && item.note.trim().length > 0;
                      
                      const nextReviewTime = new Date(item.nextReviewDate).getTime();
                      const isDue = nextReviewTime <= Date.now();
                      const isOverdue = nextReviewTime < Date.now() - 24 * 3600 * 1000;
                      
                      let reviewDateStr = "-";
                      if (prog && prog.status === "Mastered") {
                        reviewDateStr = "👑 Mastered";
                      } else if (item.status === "completed") {
                        reviewDateStr = "Done";
                      } else if (isOverdue) {
                        reviewDateStr = "Overdue";
                      } else if (isDue) {
                        reviewDateStr = "Due Today";
                      } else {
                        reviewDateStr = new Date(item.nextReviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/10 transition-colors group"
                        >
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => handleOpenStatusModal(item.problemId, item.problemTitle)}
                              className="p-1 rounded hover:bg-muted transition-all cursor-pointer inline-flex items-center justify-center"
                              title={`Click to adjust status (Current: ${stat.text})`}
                            >
                              {stat.icon}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                            {item.problemId}
                          </td>
                          <td className="px-4 py-3.5">
                            <Link
                              to={`/problems/${item.problemId}`}
                              className="font-semibold text-foreground hover:text-primary-hover hover:underline transition-colors"
                            >
                              {item.problemTitle}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => {
                                const slug = item.problemTitle.toLowerCase().replace(/ /g, "-");
                                setPomodoroPromptProblem({
                                  id: item.problemId,
                                  title: item.problemTitle,
                                  difficulty: item.difficulty,
                                  leetcodeUrl: `https://leetcode.com/problems/${slug}/`
                                });
                              }}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-sm"
                              title="Solve on LeetCode"
                            >
                              <img
                                src={leetcodeLogo}
                                alt="LeetCode"
                                className="size-6 object-contain"
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5 border", difficultyColors[item.difficulty])}>
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-xs font-semibold">
                            {getRevisionBadge(item.repetitions)}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground">
                            {getLastRevisedLabel(item.problemId)}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium">
                            <span className={cn(
                              "font-medium",
                              reviewDateStr === "👑 Mastered" ? "text-purple-600 dark:text-purple-400 font-bold" :
                              reviewDateStr === "Overdue" ? "text-rose-500 font-semibold animate-pulse" :
                              reviewDateStr === "Due Today" ? "text-amber-500 font-semibold" :
                              reviewDateStr === "Done" ? "text-emerald-500 font-semibold" : "text-muted-foreground"
                            )}>
                              {reviewDateStr}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              {/* Bookmark */}
                              <button
                                onClick={() => handleBookmarkToggle(item.problemId)}
                                className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                                title={isBook ? "Remove Bookmark" : "Add Bookmark"}
                              >
                                <Bookmark className={cn("size-4", isBook ? "text-amber-500 fill-amber-500 border-amber-500" : "")} />
                              </button>
                              
                              {/* Add Note */}
                              <button
                                onClick={() => handleOpenNoteModal(item.problemId)}
                                className={cn(
                                  "p-1.5 rounded cursor-pointer transition-colors",
                                  hasNote 
                                    ? "text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 animate-pulse" 
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                                title={hasNote ? "Edit Notes (Contains entry)" : "Add Notes"}
                              >
                                <FileText className="size-4" />
                              </button>

                              {/* Redirect to Problem Details page */}
                              <Link
                                  to={`/problems/${item.problemId}`}
                                className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer inline-flex items-center"
                                title="Open Spaced Repetition Workspace"
                              >
                                <Eye className="size-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Cards List View */}
            <div className="lg:hidden divide-y divide-border overflow-y-auto max-h-[calc(100vh-320px)]">
              {processedQueue.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <XCircleWidget status={statusFilter} />
                </div>
              ) : (
                processedQueue.map((item) => {
                  const prog = progressList.find((p) => p.problemId === item.problemId);
                  const stat = getProblemStatusDot(item.problemId);
                  const isBook = item.isBookmarked;
                  const hasNote = item.note && item.note.trim().length > 0;
                  
                  const nextReviewTime = new Date(item.nextReviewDate).getTime();
                  const isDue = nextReviewTime <= Date.now();
                  const isOverdue = nextReviewTime < Date.now() - 24 * 3600 * 1000;
                  
                  let reviewDateStr = "-";
                  if (prog && prog.status === "Mastered") {
                    reviewDateStr = "👑 Mastered";
                  } else if (item.status === "completed") {
                    reviewDateStr = "Done";
                  } else if (isOverdue) {
                    reviewDateStr = "Overdue";
                  } else if (isDue) {
                    reviewDateStr = "Due Today";
                  } else {
                    reviewDateStr = new Date(item.nextReviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }

                  return (
                    <div key={item.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-left min-w-0">
                          <span className="text-[10px] text-muted-foreground font-mono">#{item.problemId}</span>
                          <Link
                            to={`/problems/${item.problemId}`}
                            className="font-semibold text-sm text-foreground hover:text-primary-hover hover:underline transition-colors truncate"
                          >
                            {item.problemTitle}
                          </Link>
                        </div>
                        <span className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 border shrink-0", difficultyColors[item.difficulty])}>
                          {item.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div>Topic: <span className="text-foreground font-medium">{item.topic}</span></div>
                        <div>Repetition: <span className="text-foreground font-semibold">{getRevisionBadge(item.repetitions)}</span></div>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-border/40 pt-2 text-left">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wider font-semibold">Last Solved</span>
                          <span className="text-foreground font-medium">{getLastRevisedLabel(item.problemId)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-muted-foreground block text-[9px] uppercase tracking-wider font-semibold">Due Date</span>
                          <span className={cn(
                            "font-semibold",
                            reviewDateStr === "👑 Mastered" ? "text-purple-600 dark:text-purple-400" :
                            reviewDateStr === "Overdue" ? "text-rose-500 animate-pulse font-semibold" :
                            reviewDateStr === "Due Today" ? "text-amber-500 font-semibold" :
                            reviewDateStr === "Done" ? "text-emerald-500 font-semibold" : "text-muted-foreground"
                          )}>
                            {reviewDateStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenStatusModal(item.problemId, item.problemTitle)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold cursor-pointer text-foreground shadow-sm transition-all"
                            title={`Status: ${stat.text}`}
                          >
                            {stat.icon}
                            <span>{stat.text}</span>
                          </button>

                          <button
                            onClick={() => {
                              const slug = item.problemTitle.toLowerCase().replace(/ /g, "-");
                              setPomodoroPromptProblem({
                                id: item.problemId,
                                title: item.problemTitle,
                                difficulty: item.difficulty,
                                leetcodeUrl: `https://leetcode.com/problems/${slug}/`
                              });
                            }}
                            className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted cursor-pointer shadow-sm flex items-center justify-center"
                            title="Solve on LeetCode"
                          >
                            <img
                              src={leetcodeLogo}
                              alt="LeetCode"
                              className="size-4 object-contain"
                            />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleBookmarkToggle(item.problemId)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title={isBook ? "Remove Bookmark" : "Add Bookmark"}
                          >
                            <Bookmark className={cn("size-4", isBook ? "text-amber-500 fill-amber-500" : "")} />
                          </button>
                          
                          <button
                            onClick={() => handleOpenNoteModal(item.problemId)}
                            className={cn(
                              "p-1.5 rounded cursor-pointer transition-colors",
                              hasNote 
                                ? "text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 animate-pulse" 
                                : "text-muted-foreground hover:bg-muted"
                            )}
                            title={hasNote ? "Edit Notes" : "Add Notes"}
                          >
                            <FileText className="size-4" />
                          </button>

                          <Link
                            to={`/problems/${item.problemId}`}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer inline-flex items-center"
                            title="Open Spaced Repetition Workspace"
                          >
                            <Eye className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                <span>
                  Showing Page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span> <span className="hidden sm:inline">({totalItems} matching revisions)</span>
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="h-8 text-xs cursor-pointer select-none"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="h-8 text-xs cursor-pointer select-none"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Centralized Status Log Modal */}
      <StatusChangeModal
        isOpen={statusModalProblem !== null}
        onClose={() => setStatusModalProblem(null)}
        problemId={statusModalProblem?.id || null}
        problemTitle={statusModalProblem?.title || null}
        onStatusUpdated={() => {
          loadRevisionData(); // reload layout records
          fetchTableRevisions();
        }}
      />

      {/* Pomodoro Prompt Modal */}
      <PomodoroPromptModal
        isOpen={pomodoroPromptProblem !== null}
        onClose={() => setPomodoroPromptProblem(null)}
        problemId={pomodoroPromptProblem?.id || null}
        problemTitle={pomodoroPromptProblem?.title || null}
        difficulty={pomodoroPromptProblem?.difficulty || "Medium"}
        leetcodeUrl={pomodoroPromptProblem?.leetcodeUrl || ""}
      />

      {/* Notes Dialog */}
      <Dialog
        isOpen={activeNoteProblemId !== null}
        onClose={() => setActiveNoteProblemId(null)}
        title="📝 Workspace Takeaway Journal"
        description="Jot down key intuition tips, constraints, or bug patterns learned while solving this question."
        className="sm:max-w-md"
      >
        <div className="space-y-4 pt-2 text-left">
          <Textarea
            placeholder="Write key code details here..."
            value={activeNoteText}
            onChange={(e) => setActiveNoteText(e.target.value)}
            className="min-h-[120px] text-xs font-semibold leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveNoteProblemId(null)}
              disabled={savingNote}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              size="sm"
              disabled={savingNote}
              className="text-xs cursor-pointer shadow-sm"
            >
              {savingNote ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}

// Subcomponent for empty views
function XCircleWidget({ status }: { status: string }) {
  const configs: Record<string, { title: string; desc: string }> = {
    Due: { title: "Spaced Queue Clear", desc: "No revisions scheduled for this period. Maintain streak safety by solving new challenges." },
    Overdue: { title: "No Overdue Reviews", desc: "Fantastic recall timing! All overdue reviews are fully revised." },
    Completed: { title: "No Solves Tracked", desc: "Start practicing your due revision questions to track achievements here." },
    Bookmarked: { title: "No Bookmarked Revisions", desc: "Toggle bookmark stars on Problems Explorer page to categorize lists here." },
    Mastered: { title: "No Mastered Questions", desc: "Intervals update to Mastered status as you repeat correct recall reviews." },
    All: { title: "Revision Queue Empty", desc: "Solve questions in Problems explorer directory to schedule SM2 recall logs." },
  };

  const current = configs[status] || configs.All;

  return (
    <div className="max-w-md mx-auto space-y-2 py-4">
      <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
      <p className="font-semibold text-foreground">{current.title}</p>
      <p className="text-xs text-muted-foreground">{current.desc}</p>
    </div>
  );
}
