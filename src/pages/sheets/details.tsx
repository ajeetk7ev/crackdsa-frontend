import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loader";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatusChangeModal } from "@/components/common/StatusChangeModal";
import { PomodoroPromptModal } from "@/components/common/PomodoroPromptModal";
import { CompanyBadge, TopicBadge } from "@/components/common/BadgeUtils";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";
import {
  Bookmark,
  FileText,
  XCircle,
  RotateCcw,
  RefreshCw,
  CircleDashed,
  Zap,
  Sparkles,
  Crown,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  Target,
  Compass
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  dbId: string;
  title: string;
  difficulty: string;
  topic: string;
  leetcodeUrl: string;
  companies: string[];
}

interface Sheet {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  author: string;
}

export function SheetDetailsPage() {
  const { id: sheetId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data State
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Modals state
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [statusModalProblem, setStatusModalProblem] = useState<{ id: string; title: string } | null>(null);
  const [pomodoroPromptProblem, setPomodoroPromptProblem] = useState<{ id: string; title: string; difficulty: string; leetcodeUrl: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  // URL State values
  const searchQuery = searchParams.get("search") || "";
  const filterDifficulty = searchParams.get("difficulty") || "All";
  const filterStatus = searchParams.get("status") || "All";
  const filterCompany = searchParams.get("company") || "All";
  const sortBy = searchParams.get("sort") || "id";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 8;

  // Local search state for non-blocking typing
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

  const loadData = async () => {
    if (!sheetId) return;
    try {
      setLoading(true);
      const [sheetRes, probRes, progRes, goalRes] = await Promise.all([
        api.get(`/sheets/${sheetId}`),
        api.get(`/sheets/${sheetId}/problems`, {
          params: {
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

      setSheet(sheetRes.data.data);
      setProblems(probRes.data.data.problems);
      setTotalItems(probRes.data.data.pagination.total);
      setTotalPages(probRes.data.data.pagination.totalPages);
      setProgressList(progRes.data.data);
      if (goalRes) {
        setGoalIds(goalRes.data.data.problemIds);
      }
    } catch {
      addToast("Failed to fetch sheet practice records.", "error");
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sheetId, currentPage, filterDifficulty, filterStatus, filterCompany, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    addToast("All sheet filters cleared.", "info");
  };

  const handleRandomProblem = () => {
    if (problems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * problems.length);
    const randomProb = problems[randomIndex];
    addToast(`Selected random problem: "${randomProb.title}"`, "info");
    navigate(`/problems/${randomProb.id}`);
  };

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

  const handleBookmarkToggle = async (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    const currentlyBookmarked = prog ? prog.isBookmarked : false;
    try {
      await api.put(`/progress/${probId}`, { isBookmarked: !currentlyBookmarked });
      addToast(
        currentlyBookmarked ? "Removed from bookmarks." : "Problem bookmarked.",
        currentlyBookmarked ? "info" : "success"
      );
      loadData();
    } catch {
      addToast("Failed to toggle bookmark.", "error");
    }
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
      addToast("Notes saved.", "success");
      setActiveNoteProblemId(null);
      loadData();
    } catch {
      addToast("Failed to save note.", "error");
    } finally {
      setSavingNote(false);
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
    return {
      text: "Attempted",
      color: "text-amber-500",
      icon: <Zap className="size-4 text-amber-400 mx-auto" />
    };
  };

  const getLastRevisedLabel = (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    if (!prog) return "Never";
    const dateVal = prog.lastSolved || prog.updatedAt;
    if (!dateVal) return "Never";
    const latest = new Date(dateVal);
    if (isNaN(latest.getTime())) return "Never";
    return latest.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const solvedCount = progressList.filter((p) =>
    ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(p.status) &&
    problems.some(prob => prob.id === p.problemId)
  ).length;
  const percentComplete = totalItems > 0 ? Math.ceil((solvedCount / totalItems) * 100) : 0;

  if (isFirstLoad || !sheet) {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Page Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4 text-left">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/sheets" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              <ChevronLeft className="size-3" /> Back to Sheets
            </Link>
          </div>
          <Typography variant="h1" className="font-semibold text-foreground flex items-center gap-2">
            <Compass className="size-6 text-primary" />
            {sheet.title}
          </Typography>
          <Typography variant="muted">
            {sheet.description} · <span className="font-medium text-foreground">By {sheet.author} ({sheet.estimatedTime})</span>
          </Typography>
        </div>

        <div className="flex items-center gap-6 p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="text-center">
            <p className="text-xl font-light text-foreground">{totalItems}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</p>
          </div>
          <div className="w-[1px] h-8 bg-border" />
          <div className="text-center">
            <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{solvedCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved</p>
          </div>
          <div className="w-[1px] h-8 bg-border" />
          <div className="text-center">
            <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">{percentComplete}%</p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Percent</p>
          </div>
        </div>
      </div>

      {/* 2. Search and Filters Sticky Toolbar */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-md py-4 border-b border-border flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Search sheet problems by title... (e.g. Array, Two Sum)"
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
            className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm h-9 sm:col-span-2 sm:col-start-4 md:col-span-1"
          >
            🎲 Pick Random
          </Button>
        </div>
      </div>

      {/* 3. Problems Table Block */}
      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden text-left">
        <div className="overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground select-none">
                <th className="px-4 py-3 text-center w-16 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Status</th>
                <th className="px-4 py-3 w-20 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] font-mono text-center">ID</th>
                <th className="px-4 py-3 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Problem</th>
                <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Topic</th>
                <th className="px-4 py-3 w-40 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Company Tags</th>
                <th className="px-4 py-3 text-center w-24 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] font-medium">Practice</th>
                <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Difficulty</th>
                <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Last Solved</th>
                <th className="px-4 py-3 w-36 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Next Revision</th>
                <th className="px-4 py-3 text-center w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
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
                    <td className="px-4 py-4"><div className="h-4.5 w-32 bg-muted rounded" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-6 w-6 bg-muted rounded mx-auto" /></td>
                    <td className="px-4 py-4"><div className="h-4.5 w-16 bg-muted rounded-full" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-4 py-4"><div className="h-8 w-20 bg-muted rounded mx-auto" /></td>
                  </tr>
                ))
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-2">
                      <XCircle className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="font-semibold text-foreground">No matches found</p>
                      <p className="text-xs">Adjust your keywords or reset filters to explore other questions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                problems.map((prob) => {
                  const stat = getProblemStatus(prob.id);
                  const isBook = progressList.find((p) => p.problemId === prob.id)?.isBookmarked || false;
                  const hasNote = !!progressList.find((p) => p.problemId === prob.id)?.note;

                  const prog = progressList.find((p) => p.problemId === prob.id);
                  let reviewDateStr = "-";
                  if (prog) {
                    if (prog.status === "Mastered") {
                      reviewDateStr = "👑 Mastered";
                    } else if (prog.srs && prog.srs.nextReviewDate) {
                      if (prog.srs.status === "completed") {
                        reviewDateStr = "Done";
                      } else {
                        const d = new Date(prog.srs.nextReviewDate);
                        reviewDateStr = d.getTime() <= Date.now() ? "Due Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }
                    }
                  }

                  const difficultyColors: Record<string, string> = {
                    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
                    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
                    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20",
                  };

                  return (
                    <tr
                      key={prob.id}
                      className="hover:bg-muted/10 transition-colors group"
                    >
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
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/problems/${prob.id}`}
                            className="font-semibold text-foreground hover:text-primary-hover hover:underline transition-colors text-sm"
                          >
                            {prob.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <TopicBadge topic={prob.topic} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {prob.companies.slice(0, 3).map((comp) => (
                            <CompanyBadge key={comp} company={comp} />
                          ))}
                          {prob.companies.length > 3 && (
                            <span className="text-[10px] text-muted-foreground font-semibold px-1">
                              +{prob.companies.length - 3}
                            </span>
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
                        <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5 border", difficultyColors[prob.difficulty])}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {getLastRevisedLabel(prob.id)}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium">
                        <span className={cn(
                          "font-medium",
                          reviewDateStr === "👑 Mastered" ? "text-purple-600 dark:text-purple-400 font-bold" :
                          reviewDateStr === "Due Today" ? "text-amber-500 font-semibold animate-pulse" : "text-muted-foreground"
                        )}>
                          {reviewDateStr}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          {/* Bookmark */}
                          <button
                            onClick={() => handleBookmarkToggle(prob.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title={isBook ? "Remove Bookmark" : "Add Bookmark"}
                          >
                            <Bookmark className={cn("size-4", isBook ? "text-amber-500 fill-amber-500 border-amber-500" : "")} />
                          </button>

                          {/* Goal Target */}
                          <button
                            onClick={() => handleGoalToggle(prob.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title={goalIds.includes(prob.id) ? "Remove from Today's Goals" : "Add to Today's Goals"}
                          >
                            <Target className={cn("size-4", goalIds.includes(prob.id) ? "text-rose-500 fill-rose-500/10" : "")} />
                          </button>
                          
                          {/* Add Note */}
                          <button
                            onClick={() => handleOpenNoteModal(prob.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title="Recall Notes"
                          >
                            <FileText className={cn("size-4", hasNote ? "text-primary" : "")} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateQueryParam("page", String(currentPage - 1))}
                className="cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateQueryParam("page", String(currentPage + 1))}
                className="cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Note dialog */}
      <Dialog
        isOpen={activeNoteProblemId !== null}
        onClose={() => setActiveNoteProblemId(null)}
        title="Recall Notes"
      >
        <div className="space-y-4">
          <Textarea
            value={activeNoteText}
            onChange={(e) => setActiveNoteText(e.target.value)}
            placeholder="Write key code snippets, tricks, or edge cases here..."
            className="text-xs h-32"
            disabled={savingNote}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveNoteProblemId(null)} disabled={savingNote}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveNotes} disabled={savingNote}>
              {savingNote ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Status Modal */}
      <StatusChangeModal
        isOpen={statusModalProblem !== null}
        onClose={() => setStatusModalProblem(null)}
        problemId={statusModalProblem?.id || null}
        problemTitle={statusModalProblem?.title || null}
        onStatusUpdated={loadData}
      />

      {/* Pomodoro Prompt Modal */}
      <PomodoroPromptModal
        isOpen={pomodoroPromptProblem !== null}
        onClose={() => setPomodoroPromptProblem(null)}
        problemId={pomodoroPromptProblem?.id || null}
        problemTitle={pomodoroPromptProblem?.title || null}
        difficulty={pomodoroPromptProblem?.difficulty || ""}
        leetcodeUrl={pomodoroPromptProblem?.leetcodeUrl || ""}
      />
    </div>
  );
}
