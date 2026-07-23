import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loader";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";
import { StatusChangeModal } from "@/components/common/StatusChangeModal";
import { PomodoroPromptModal } from "@/components/common/PomodoroPromptModal";
import { CompanyBadge, TopicBadge } from "@/components/common/BadgeUtils";

import {
  Bookmark,
  FileText,
  Eye,
  XCircle,
  RotateCcw,
  RefreshCw,
  CircleDashed,
  Zap,
  Sparkles,
  Crown,
  Clock,
  Flame,
  Target,
  ChevronLeft,
  ChevronRight,
  Compass,
  Code2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  dbId?: string;
  title: string;
  difficulty: string;
  topic: string;
  leetcodeUrl: string;
  companies: string[];
}

interface StatsMeta {
  total: number;
  solved: number;
  percentage: number;
}

export function ProblemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<StatsMeta>({ total: 0, solved: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Modals state
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [statusModalProblem, setStatusModalProblem] = useState<{ id: string; title: string } | null>(null);
  const [pomodoroPromptProblem, setPomodoroPromptProblem] = useState<{ id: string; title: string; difficulty: string; leetcodeUrl: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [goalIds, setGoalIds] = useState<string[]>([]);

  const addToast = useNotificationStore((state: any) => state.addToast);

  // URL State values
  const searchQuery = searchParams.get("search") || "";
  const filterDifficulty = searchParams.get("difficulty") || "All";
  const filterStatus = searchParams.get("status") || "All";
  const filterCompany = searchParams.get("company") || "All";
  const sortBy = searchParams.get("sort") || "id";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  // Local search state for non-blocking input typing
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const updateQueryParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "All" || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key !== "page") {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  // Debounce search query updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== (searchParams.get("search") || "")) {
        updateQueryParam("search", localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const handleRandomProblem = () => {
    if (problems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * problems.length);
    const randomProb = problems[randomIndex];
    addToast(`Selected random problem: "${randomProb.title}"`, "info");
    navigate(`/problems/${randomProb.id}`);
  };

  // Load standalone problems data
  const loadExplorerData = async () => {
    try {
      setLoading(true);
      const [probRes, progRes, goalRes] = await Promise.all([
        api.get("/problems", {
          params: {
            standalone: "true", // Fetch ONLY problems not tied to any DSA sheet
            page: currentPage,
            limit: pageSize,
            difficulty: filterDifficulty,
            search: searchQuery,
            status: filterStatus,
            company: filterCompany,
            sort: sortBy
          }
        }),
        api.get("/progress"),
        api.get("/goals/today").catch(() => null)
      ]);

      const data = probRes.data.data;
      setProblems(data.problems || []);
      setTotalItems(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      
      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          total: data.pagination?.total || 0,
          solved: 0,
          percentage: 0
        });
      }

      setProgressList(progRes.data.data || []);
      if (goalRes) {
        setGoalIds(goalRes.data.data.problemIds);
      }
    } catch {
      addToast("Failed to fetch standalone problems directory records.", "error");
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    loadExplorerData();
  }, [currentPage, filterDifficulty, filterStatus, filterCompany, searchQuery, sortBy]);

  const handleGoalToggle = async (probId: string) => {
    let newGoals: string[];
    const isGoal = goalIds.includes(probId);
    if (isGoal) {
      newGoals = goalIds.filter((id) => id !== probId);
    } else {
      if (goalIds.length >= 8) {
        addToast("We recommend focusing on up to 8 goals per day.", "warning");
        return;
      }
      newGoals = [...goalIds, probId];
    }

    try {
      const res = await api.post("/goals/today", { problems: newGoals });
      setGoalIds(res.data.data.problemIds);
      addToast(isGoal ? "Removed from today's goals." : "Added to today's goals.", "success");
    } catch {
      addToast("Failed to update today's goals.", "error");
    }
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    addToast("All problem filters cleared.", "info");
  };

  const handleBookmarkToggle = async (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    const currentlyBookmarked = prog ? prog.isBookmarked : false;
    try {
      await api.put(`/progress/${probId}`, { isBookmarked: !currentlyBookmarked });
      addToast(
        currentlyBookmarked ? "Removed from bookmarks." : "Problem bookmarked.",
        currentlyBookmarked ? "info" : "success"
      );
      loadExplorerData();
    } catch {
      addToast("Failed to toggle bookmark.", "error");
    }
  };

  const getProblemStatus = (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    if (!prog) {
      return {
        text: "Not Started",
        color: "text-muted-foreground",
        icon: <CircleDashed className="size-4 text-muted-foreground/60 mx-auto" />
      };
    }

    if (prog.status === "Mastered") {
      return {
        text: "Mastered",
        color: "text-purple-600 dark:text-purple-400",
        icon: <Crown className="size-4 text-purple-500 mx-auto animate-pulse" />
      };
    }
    if (prog.status === "Needs Revision") {
      return {
        text: "Needs Revision",
        color: "text-amber-600 dark:text-amber-400",
        icon: <Clock className="size-4 text-amber-500 mx-auto" />
      };
    }
    if (prog.status === "Revised Once") {
      return {
        text: "Revised Once",
        color: "text-blue-600 dark:text-blue-400",
        icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
      };
    }
    if (prog.status === "Revised Twice") {
      return {
        text: "Revised Twice",
        color: "text-orange-600 dark:text-orange-400",
        icon: <Flame className="size-4 text-orange-500 mx-auto" />
      };
    }
    if (prog.status === "Solved") {
      return {
        text: "Solved",
        color: "text-emerald-600 dark:text-emerald-400",
        icon: <Sparkles className="size-4 text-emerald-500 mx-auto" />
      };
    }
    if (prog.status === "Attempted") {
      return {
        text: "Attempted",
        color: "text-amber-500",
        icon: <Zap className="size-4 text-amber-400 mx-auto" />
      };
    }

    return {
      text: "Not Started",
      color: "text-muted-foreground",
      icon: <CircleDashed className="size-4 text-muted-foreground/60 mx-auto" />
    };
  };

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
      year: "numeric"
    });
  };

  const handleOpenStatusModal = (id: string, title: string) => {
    setStatusModalProblem({ id, title });
  };

  const handleOpenNoteModal = (probId: string) => {
    setActiveNoteProblemId(probId);
    const prog = progressList.find((p) => p.problemId === probId);
    setActiveNoteText(prog?.note || "");
  };

  const handleSaveNotes = async () => {
    if (!activeNoteProblemId) return;
    setSavingNote(true);
    try {
      await api.post(`/notes/${activeNoteProblemId}`, { note: activeNoteText });
      addToast("Problem notes saved.", "success");
      setActiveNoteProblemId(null);
      loadExplorerData();
    } catch {
      addToast("Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  if (isFirstLoad) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header Banner Block */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm text-left">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
              <Code2 className="size-3.5" />
              LeetCode Miscellaneous & Custom Practice
            </div>
            <Typography variant="h1" className="font-bold tracking-tight text-foreground">
              Problems Explorer
            </Typography>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore standalone LeetCode practice problems and custom coding challenges not associated with any structured DSA sheet.
            </p>
          </div>

          {/* Stats Bar Header Card */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-card border border-border/80 shadow-xs shrink-0 backdrop-blur-xs">
            <div className="text-center">
              <p className="text-xl font-light text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</p>
            </div>
            <div className="w-[1px] h-8 bg-border/80" />
            <div className="text-center">
              <p className="text-xl font-semibold text-emerald-400">{stats.solved}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved</p>
            </div>
            <div className="w-[1px] h-8 bg-border/80" />
            <div className="text-center">
              <p className="text-xl font-semibold text-indigo-400">{stats.percentage}%</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved %</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search and Filters Toolbar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-md py-4 border-b border-border flex flex-col gap-3 text-left">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Search standalone problems by title or topic..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="text-xs shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset Filters
            </Button>
          </div>
        </div>

        {/* Filter selectors row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <Select
            options={[
              { value: "All", label: "Difficulty: All" },
              { value: "Easy", label: "Easy" },
              { value: "Medium", label: "Medium" },
              { value: "Hard", label: "Hard" },
            ]}
            value={filterDifficulty}
            onChange={(e) => updateQueryParam("difficulty", e.target.value)}
          />

          <Select
            options={[
              { value: "All", label: "Status: All" },
              { value: "Not Started", label: "Not Started" },
              { value: "Attempted", label: "Attempted" },
              { value: "Solved", label: "Solved" },
              { value: "Needs Revision", label: "Needs Revision" },
              { value: "Revised Once", label: "Revised Once" },
              { value: "Revised Twice", label: "Revised Twice" },
              { value: "Mastered", label: "Mastered" },
              { value: "Bookmarked", label: "Bookmarked Only" },
            ]}
            value={filterStatus}
            onChange={(e) => updateQueryParam("status", e.target.value)}
          />

          <Select
            options={[
              { value: "All", label: "Company: All" },
              { value: "Google", label: "Google" },
              { value: "Microsoft", label: "Microsoft" },
              { value: "Meta", label: "Meta" },
              { value: "Amazon", label: "Amazon" },
              { value: "Apple", label: "Apple" },
              { value: "Netflix", label: "Netflix" },
              { value: "Uber", label: "Uber" },
              { value: "Adobe", label: "Adobe" },
            ]}
            value={filterCompany}
            onChange={(e) => updateQueryParam("company", e.target.value)}
          />

          <Select
            options={[
              { value: "id", label: "Sort: ID" },
              { value: "title", label: "Sort: Name" },
              { value: "difficulty", label: "Sort: Difficulty" },
            ]}
            value={sortBy}
            onChange={(e) => updateQueryParam("sort", e.target.value)}
          />

          <Button
            onClick={handleRandomProblem}
            className="text-xs bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs h-9 sm:col-span-2 sm:col-start-4 md:col-span-1"
          >
            🎲 Pick Random
          </Button>
        </div>
      </div>

      {/* 3. Problems Table */}
      <div className="border border-border bg-card rounded-xl shadow-xs overflow-hidden text-left">
        <div className="overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground select-none">
                <th className="px-4 py-3 text-center w-16 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Status</th>
                <th className="px-4 py-3 w-20 sticky top-0 bg-muted/95 backdrop-blur-xs z-10 font-mono text-center">ID</th>
                <th className="px-4 py-3 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Problem Title</th>
                <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Topic</th>
                <th className="px-4 py-3 w-44 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Companies</th>
                <th className="px-4 py-3 text-center w-24 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Practice</th>
                <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Difficulty</th>
                <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Last Solved</th>
                <th className="px-4 py-3 text-center w-28 sticky top-0 bg-muted/95 backdrop-blur-xs z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 w-4 bg-muted rounded-full mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-8 bg-muted rounded font-mono" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-48 bg-muted rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-muted rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 bg-muted rounded" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-6 w-6 bg-muted rounded mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-16 bg-muted rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-20 bg-muted rounded mx-auto" /></td>
                  </tr>
                ))
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-2">
                      <XCircle className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="font-semibold text-foreground">No standalone problems found</p>
                      <p className="text-xs">Adjust your keywords or reset filters to explore other questions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                problems.map((prob) => {
                  const stat = getProblemStatus(prob.id);
                  const isBook = progressList.find((p) => p.problemId === prob.id)?.isBookmarked || false;
                  const hasNote = !!progressList.find((p) => p.problemId === prob.id)?.note;

                  const difficultyColors: Record<string, string> = {
                    Easy: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
                    Medium: "text-amber-400 bg-amber-500/15 border-amber-500/30",
                    Hard: "text-rose-400 bg-rose-500/15 border-rose-500/30",
                  };

                  return (
                    <tr key={prob.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleOpenStatusModal(prob.id, prob.title)}
                          className="p-1 rounded hover:bg-muted transition-all cursor-pointer inline-flex items-center justify-center"
                          title={`Click to adjust status (Current: ${stat.text})`}
                        >
                          {stat.icon}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs text-center">
                        {prob.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {prob.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <TopicBadge topic={prob.topic} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {prob.companies && prob.companies.length > 0 ? (
                            prob.companies.slice(0, 3).map((comp) => (
                              <CompanyBadge key={comp} company={comp} />
                            ))
                          ) : (
                            <span className="text-[11px] text-muted-foreground">General</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => {
                            setPomodoroPromptProblem({
                              id: prob.id,
                              title: prob.title,
                              difficulty: prob.difficulty,
                              leetcodeUrl: prob.leetcodeUrl
                            });
                          }}
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-xs"
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
                        <span className={cn("text-xs font-semibold rounded-full px-2.5 py-0.5 border shadow-xs", difficultyColors[prob.difficulty])}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {getLastRevisedLabel(prob.id)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleBookmarkToggle(prob.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title={isBook ? "Remove Bookmark" : "Add Bookmark"}
                          >
                            <Bookmark className={cn("size-4", isBook ? "text-amber-500 fill-amber-500" : "")} />
                          </button>

                          <button
                            onClick={() => handleGoalToggle(prob.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title={goalIds.includes(prob.id) ? "Remove from Today's Goals" : "Add to Today's Goals"}
                          >
                            <Target className={cn("size-4", goalIds.includes(prob.id) ? "text-emerald-500 fill-emerald-500/20" : "")} />
                          </button>

                          <button
                            onClick={() => handleOpenNoteModal(prob.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title={hasNote ? "Edit Notes" : "Add Notes"}
                          >
                            <FileText className={cn("size-4", hasNote ? "text-primary fill-primary/20" : "")} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-card">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalItems)}</span> of{" "}
              <span className="font-semibold text-foreground">{totalItems}</span> standalone problems
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateQueryParam("page", (currentPage - 1).toString())}
                className="text-xs gap-1.5 h-8"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                    return (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateQueryParam("page", p.toString())}
                        className={`size-8 text-xs p-0 font-medium ${
                          p === currentPage
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </Button>
                    );
                  } else if (
                    (p === 2 && currentPage > 3) ||
                    (p === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={p} className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateQueryParam("page", (currentPage + 1).toString())}
                className="text-xs gap-1.5 h-8"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {statusModalProblem && (
        <StatusChangeModal
          isOpen={!!statusModalProblem}
          onClose={() => setStatusModalProblem(null)}
          problemId={statusModalProblem.id}
          problemTitle={statusModalProblem.title}
          currentStatus={progressList.find((p) => p.problemId === statusModalProblem.id)?.status || "Not Started"}
          onSuccess={() => {
            loadExplorerData();
          }}
        />
      )}

      {pomodoroPromptProblem && (
        <PomodoroPromptModal
          isOpen={!!pomodoroPromptProblem}
          onClose={() => setPomodoroPromptProblem(null)}
          problem={pomodoroPromptProblem}
        />
      )}

      {activeNoteProblemId && (
        <Dialog isOpen={!!activeNoteProblemId} onClose={() => setActiveNoteProblemId(null)} title="Personal Notes">
          <div className="space-y-4 pt-2 text-left">
            <Textarea
              value={activeNoteText}
              onChange={(e) => setActiveNoteText(e.target.value)}
              placeholder="Write your approach notes, key learnings, or edge cases..."
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveNoteProblemId(null)} size="sm">
                Cancel
              </Button>

              <Button onClick={handleSaveNotes} disabled={savingNote} size="sm">
                {savingNote ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
