import { useState, useEffect, useMemo } from "react";
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
  ChevronDown,
  ChevronUp,
  Target,
  Compass,
  Layers,
  Table as TableIcon,
  FolderOpen,
  Folder
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  dbId: string;
  title: string;
  difficulty: string;
  topic: string;
  subtopic: string;
  pattern: string;
  order: number;
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

interface PatternGroup {
  patternName: string;
  problems: Problem[];
  solvedCount: number;
  totalCount: number;
}

interface SubtopicGroup {
  subtopicName: string;
  patterns: PatternGroup[];
  solvedCount: number;
  totalCount: number;
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

  // Accordion Expand/Collapse State
  const [collapsedSubtopics, setCollapsedSubtopics] = useState<Record<string, boolean>>({});
  const [collapsedPatterns, setCollapsedPatterns] = useState<Record<string, boolean>>({});

  // Modals state
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [statusModalProblem, setStatusModalProblem] = useState<{ id: string; title: string } | null>(null);
  const [pomodoroPromptProblem, setPomodoroPromptProblem] = useState<{ id: string; title: string; difficulty: string; leetcodeUrl: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  // URL State values
  const viewMode = searchParams.get("view") || "pattern"; // 'pattern' | 'table'
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
      const isPatternView = viewMode === "pattern";
      const [sheetRes, probRes, progRes, goalRes] = await Promise.all([
        api.get(`/sheets/${sheetId}`),
        api.get(`/sheets/${sheetId}/problems`, {
          params: {
            page: isPatternView ? 1 : currentPage,
            limit: isPatternView ? "all" : pageSize,
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
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to fetch sheet practice records.", "error");
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sheetId, currentPage, filterDifficulty, filterStatus, filterCompany, searchQuery, sortBy, viewMode]);

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
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to update today's goals.", "error");
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
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to toggle bookmark.", "error");
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
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const isProblemSolved = (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    return prog && ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(prog.status);
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

  const solvedCount = progressList.filter((p) =>
    ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(p.status) &&
    problems.some(prob => prob.id === p.problemId)
  ).length;
  const percentComplete = totalItems > 0 ? Math.ceil((solvedCount / totalItems) * 100) : 0;

  // Group problems by Subtopic and Pattern for Pattern Roadmap View
  const subtopicGroups = useMemo<SubtopicGroup[]>(() => {
    const subtopicMap: Record<string, Record<string, Problem[]>> = {};

    problems.forEach((prob) => {
      const sub = prob.subtopic || prob.topic || "General";
      const pat = prob.pattern || "Core Patterns";
      if (!subtopicMap[sub]) {
        subtopicMap[sub] = {};
      }
      if (!subtopicMap[sub][pat]) {
        subtopicMap[sub][pat] = [];
      }
      subtopicMap[sub][pat].push(prob);
    });

    const groups: SubtopicGroup[] = [];

    Object.keys(subtopicMap).forEach((subName) => {
      const patterns: PatternGroup[] = [];
      let subSolved = 0;
      let subTotal = 0;

      Object.keys(subtopicMap[subName]).forEach((patName) => {
        const probList = subtopicMap[subName][patName];
        let patSolved = 0;

        probList.forEach((p) => {
          if (isProblemSolved(p.id)) patSolved++;
        });

        subSolved += patSolved;
        subTotal += probList.length;

        patterns.push({
          patternName: patName,
          problems: probList,
          solvedCount: patSolved,
          totalCount: probList.length,
        });
      });

      groups.push({
        subtopicName: subName,
        patterns,
        solvedCount: subSolved,
        totalCount: subTotal,
      });
    });

    return groups;
  }, [problems, progressList]);

  const toggleSubtopic = (subName: string) => {
    setCollapsedSubtopics((prev) => ({
      ...prev,
      [subName]: !prev[subName],
    }));
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

  const getNextRevisionLabel = (probId: string) => {
    const prog = progressList.find((p) => p.problemId === probId);
    if (!prog || !prog.status || prog.status === "Not Started") {
      return {
        text: "Not Scheduled",
        color: "text-muted-foreground bg-muted/20 border-border/40 font-normal"
      };
    }

    if (prog.status === "Mastered") {
      return {
        text: "Mastered 👑",
        color: "text-purple-400 bg-purple-500/15 border-purple-500/30 font-semibold"
      };
    }

    const rawDate = prog.nextReviewDate || prog.srs?.nextReviewDate;
    if (rawDate) {
      const nextDate = new Date(rawDate);
      if (!isNaN(nextDate.getTime())) {
        const formattedDate = nextDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });

        const now = new Date();
        const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const revMid = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
        
        const diffTime = revMid.getTime() - todayMid.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          return {
            text: `Due Today ⚡ (${formattedDate})`,
            color: "text-rose-400 bg-rose-500/15 border-rose-500/40 font-bold animate-pulse"
          };
        } else if (diffDays === 1) {
          return {
            text: `Tomorrow (${formattedDate})`,
            color: "text-amber-400 bg-amber-500/15 border-amber-500/30 font-semibold"
          };
        } else {
          return {
            text: formattedDate,
            color: "text-indigo-400 bg-indigo-500/15 border-indigo-500/30 font-semibold"
          };
        }
      }
    }

    return {
      text: "Not Scheduled",
      color: "text-muted-foreground bg-muted/20 border-border/40 font-normal"
    };
  };

  const togglePattern = (patKey: string) => {
    setCollapsedPatterns((prev) => ({
      ...prev,
      [patKey]: !prev[patKey],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedSubtopics({});
    setCollapsedPatterns({});
  };

  const handleCollapseAll = () => {
    const subObj: Record<string, boolean> = {};
    const patObj: Record<string, boolean> = {};
    subtopicGroups.forEach((g) => {
      subObj[g.subtopicName] = true;
      g.patterns.forEach((p) => {
        patObj[`${g.subtopicName}__${p.patternName}`] = true;
      });
    });
    setCollapsedSubtopics(subObj);
    setCollapsedPatterns(patObj);
  };

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
      {/* Fixed Sticky Header Panel (Title + Stats + Search & Filters Toolbar) */}
      <div className="sticky -top-6 md:-top-8 z-30 bg-background/95 backdrop-blur-md pt-2 pb-4 -mx-6 md:-mx-10 px-6 md:px-10 border-b border-border space-y-4 shadow-xs">
        {/* 1. Page Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-2 gap-4 text-left border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link to="/sheets" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                <ChevronLeft className="size-3" /> Back to Sheets
              </Link>
            </div>
            <Typography variant="h1" className="font-semibold text-foreground flex items-center gap-2 text-xl md:text-2xl">
              <Compass className="size-5 md:size-6 text-primary" />
              {sheet.title}
            </Typography>
            <Typography variant="muted" className="text-xs md:text-sm">
              {sheet.description} · <span className="font-medium text-foreground">By {sheet.author} ({sheet.estimatedTime})</span>
            </Typography>
          </div>

          <div className="flex items-center gap-4 md:gap-6 p-3 md:p-4 rounded-xl bg-card border border-border shadow-xs shrink-0 self-start md:self-auto">
            <div className="text-center">
              <p className="text-lg md:text-xl font-light text-foreground">{totalItems}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</p>
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg md:text-xl font-semibold text-emerald-600 dark:text-emerald-400">{solvedCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved</p>
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg md:text-xl font-semibold text-indigo-600 dark:text-indigo-400">{percentComplete}%</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Percent</p>
            </div>
          </div>
        </div>

        {/* 2. Toolbar: Search, Filters & View Switcher */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex-1 flex gap-2">
              <SearchInput
                placeholder="Search sheet problems by title, subtopic or pattern..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-muted/30 rounded-lg border border-border shrink-0 self-start md:self-auto">
              <button
                onClick={() => updateQueryParam("view", "pattern")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "pattern"
                    ? "bg-background text-primary shadow-sm border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="size-3.5" />
                Pattern Roadmap
              </button>
              <button
                onClick={() => updateQueryParam("view", "table")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-background text-primary shadow-sm border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TableIcon className="size-3.5" />
                Flat Table
              </button>
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
      </div>

      {/* 3. PATTERN ROADMAP ACCORDION VIEW */}
      {viewMode === "pattern" ? (
        <div className="space-y-4 text-left">
          {/* Header controls for Pattern View */}
          <div className="flex items-center justify-between bg-card p-3.5 rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-5 text-primary" />
              <span className="font-semibold text-sm text-foreground">Pattern Roadmap View</span>
              <span className="text-xs text-muted-foreground font-normal">
                ({subtopicGroups.length} Subtopics · {problems.length} Problems)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="text-xs h-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Expand All
              </Button>
              <span className="text-border">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="text-xs h-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Collapse All
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-border bg-card rounded-xl p-5 space-y-3 animate-pulse">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : subtopicGroups.length === 0 ? (
            <div className="border border-border bg-card rounded-xl p-12 text-center text-muted-foreground">
              <XCircle className="size-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="font-semibold text-foreground text-base">No matching problems found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            subtopicGroups.map((subGroup) => {
              const isSubCollapsed = collapsedSubtopics[subGroup.subtopicName] || false;
              const subPct = subGroup.totalCount > 0 ? Math.ceil((subGroup.solvedCount / subGroup.totalCount) * 100) : 0;

              return (
                <div
                  key={subGroup.subtopicName}
                  className="border border-border bg-card rounded-xl shadow-sm overflow-hidden transition-all"
                >
                  {/* Subtopic Header Card */}
                  <div
                    onClick={() => toggleSubtopic(subGroup.subtopicName)}
                    className="p-4 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {isSubCollapsed ? <Folder className="size-5" /> : <FolderOpen className="size-5" />}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                          {subGroup.subtopicName}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {subGroup.patterns.length} Patterns · {subGroup.solvedCount} of {subGroup.totalCount} Solved ({subPct}%)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Subtopic Progress Bar */}
                      <div className="w-36 hidden sm:block">
                        <div className="flex justify-between text-[11px] font-semibold mb-1 text-muted-foreground">
                          <span>Progress</span>
                          <span>{subPct}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${subPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-1 rounded-md text-muted-foreground hover:text-foreground">
                        {isSubCollapsed ? <ChevronDown className="size-5" /> : <ChevronUp className="size-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Subtopic Content (List of Patterns) */}
                  {!isSubCollapsed && (
                    <div className="p-3 sm:p-4 space-y-4 bg-background/50">
                      {subGroup.patterns.map((patGroup) => {
                        const patKey = `${subGroup.subtopicName}__${patGroup.patternName}`;
                        const isPatCollapsed = collapsedPatterns[patKey] || false;
                        const patPct = patGroup.totalCount > 0 ? Math.ceil((patGroup.solvedCount / patGroup.totalCount) * 100) : 0;

                        return (
                          <div
                            key={patGroup.patternName}
                            className="border border-border/80 bg-card rounded-lg overflow-hidden shadow-2xs"
                          >
                            {/* Pattern Header */}
                            <div
                              onClick={() => togglePattern(patKey)}
                              className="px-4 py-3 bg-muted/20 dark:bg-muted/10 hover:bg-muted/40 transition-colors cursor-pointer flex items-center justify-between border-b border-border/40"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-1 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                                  <Layers className="size-4" />
                                </div>
                                <span className="font-semibold text-sm text-foreground">
                                  {patGroup.patternName}
                                </span>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                  {patGroup.solvedCount}/{patGroup.totalCount} Solved
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="w-24 hidden md:block">
                                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-indigo-500 transition-all duration-300"
                                      style={{ width: `${patPct}%` }}
                                    />
                                  </div>
                                </div>
                                {isPatCollapsed ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronUp className="size-4 text-muted-foreground" />}
                              </div>
                            </div>

                            {/* Pattern Problems List */}
                            {!isPatCollapsed && (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="border-b border-border/40 text-[11px] font-semibold text-muted-foreground select-none bg-muted/10">
                                      <th className="px-3 py-2 text-center w-14">Status</th>
                                      <th className="px-3 py-2 text-center w-16 font-mono">ID</th>
                                      <th className="px-3 py-2 text-left">Problem Title</th>
                                      <th className="px-3 py-2 text-left w-36">Company Tags</th>
                                      <th className="px-3 py-2 text-center w-20">Practice</th>
                                      <th className="px-3 py-2 text-center w-24">Difficulty</th>
                                      <th className="px-3 py-2 text-left w-28">Last Solved</th>
                                      <th className="px-3 py-2 text-center w-36">Next Revision</th>
                                      <th className="px-3 py-2 text-center w-28">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/40 text-xs">
                                    {patGroup.problems.map((prob) => {
                                      const stat = getProblemStatus(prob.id);
                                      const solved = isProblemSolved(prob.id);
                                      const nextRev = getNextRevisionLabel(prob.id);
                                      const lastRevLabel = getLastRevisedLabel(prob.id);
                                      const isBook = progressList.find((p) => p.problemId === prob.id)?.isBookmarked || false;
                                      const hasNote = !!progressList.find((p) => p.problemId === prob.id)?.note;

                                      const difficultyColors: Record<string, string> = {
                                        Easy: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
                                        Medium: "text-amber-400 bg-amber-500/15 border-amber-500/30",
                                        Hard: "text-rose-400 bg-rose-500/15 border-rose-500/30",
                                      };

                                      return (
                                        <tr
                                          key={prob.id}
                                          className={cn(
                                            "hover:bg-gradient-to-r hover:from-primary/5 hover:via-muted/15 hover:to-transparent transition-all group",
                                            solved && "bg-emerald-500/5 dark:bg-emerald-500/5"
                                          )}
                                        >
                                          {/* Status */}
                                          <td className="px-3 py-3 text-center">
                                            <button
                                              onClick={() => handleOpenStatusModal(prob.id, prob.title)}
                                              className="p-1 rounded hover:bg-muted transition-all cursor-pointer inline-flex items-center justify-center"
                                              title={`Status: ${stat.text} (Click to change)`}
                                            >
                                              {stat.icon}
                                            </button>
                                          </td>

                                          {/* ID */}
                                          <td className="px-3 py-3 font-mono text-[11px] text-muted-foreground text-center">
                                            #{prob.id}
                                          </td>

                                          {/* Title */}
                                          <td className="px-3 py-3">
                                            <Link
                                              to={`/problems/${prob.id}`}
                                              className={cn(
                                                "font-semibold text-sm hover:text-primary transition-colors",
                                                solved ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                                              )}
                                            >
                                              {prob.title}
                                            </Link>
                                          </td>

                                          {/* Companies */}
                                          <td className="px-3 py-3">
                                            <div className="flex gap-1 flex-wrap items-center">
                                              {prob.companies && prob.companies.length > 0 ? (
                                                prob.companies.slice(0, 2).map((comp) => (
                                                  <CompanyBadge key={comp} company={comp} />
                                                ))
                                              ) : (
                                                <span className="text-[11px] text-muted-foreground">General</span>
                                              )}
                                              {prob.companies && prob.companies.length > 2 && (
                                                <span className="text-[10px] text-muted-foreground font-semibold px-1 rounded bg-muted/40">
                                                  +{prob.companies.length - 2}
                                                </span>
                                              )}
                                            </div>
                                          </td>

                                          {/* Practice */}
                                          <td className="px-3 py-3 text-center">
                                            <button
                                              onClick={() => {
                                                setPomodoroPromptProblem({
                                                  id: prob.id,
                                                  title: prob.title,
                                                  difficulty: prob.difficulty,
                                                  leetcodeUrl: prob.leetcodeUrl
                                                });
                                              }}
                                              className="p-1 rounded-lg border border-border bg-background hover:bg-muted hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                                              title="Solve on LeetCode"
                                            >
                                              <img
                                                src={leetcodeLogo}
                                                alt="LeetCode"
                                                className="size-5 object-contain"
                                              />
                                            </button>
                                          </td>

                                          {/* Difficulty */}
                                          <td className="px-3 py-3 text-center">
                                            <span className={cn("text-[11px] font-semibold rounded-full px-2 py-0.5 border shadow-2xs inline-block", difficultyColors[prob.difficulty])}>
                                              {prob.difficulty}
                                            </span>
                                          </td>

                                          {/* Last Solved */}
                                          <td className="px-3 py-3 text-muted-foreground font-medium text-[11px]">
                                            {lastRevLabel}
                                          </td>

                                          {/* Next Revision */}
                                          <td className="px-3 py-3 text-center">
                                            <span className={cn("inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border text-[11px] transition-all", nextRev.color)}>
                                              {nextRev.text}
                                            </span>
                                          </td>

                                          {/* Actions */}
                                          <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                onClick={() => handleBookmarkToggle(prob.id)}
                                                className="p-1 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                                                title={isBook ? "Remove Bookmark" : "Add Bookmark"}
                                              >
                                                <Bookmark className={cn("size-3.5", isBook ? "text-amber-500 fill-amber-500" : "")} />
                                              </button>

                                              <button
                                                onClick={() => handleGoalToggle(prob.id)}
                                                className="p-1 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                                                title={goalIds.includes(prob.id) ? "Remove from Today's Goals" : "Add to Today's Goals"}
                                              >
                                                <Target className={cn("size-3.5", goalIds.includes(prob.id) ? "text-emerald-500 fill-emerald-500/20" : "")} />
                                              </button>

                                              <button
                                                onClick={() => handleOpenNoteModal(prob.id)}
                                                className="p-1 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                                                title={hasNote ? "Edit Notes" : "Add Notes"}
                                              >
                                                <FileText className={cn("size-3.5", hasNote ? "text-primary fill-primary/20" : "")} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* 4. FLAT TABLE VIEW */
        <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden text-left">
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground select-none">
                  <th className="px-4 py-3 text-center w-16 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Status</th>
                  <th className="px-4 py-3 w-20 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 font-mono text-center">ID</th>
                  <th className="px-4 py-3 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Problem Title</th>
                  <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Topic</th>
                  <th className="px-4 py-3 w-36 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Subtopic</th>
                  <th className="px-4 py-3 w-40 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Company Tags</th>
                  <th className="px-4 py-3 text-center w-24 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 font-medium">Practice</th>
                  <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Difficulty</th>
                  <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Last Solved</th>
                  <th className="px-4 py-3 w-36 text-center sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Next Revision</th>
                  <th className="px-4 py-3 text-center w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10">Actions</th>
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
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4.5 w-32 bg-muted rounded" /></td>
                      <td className="px-4 py-4 text-center"><div className="h-6 w-6 bg-muted rounded mx-auto" /></td>
                      <td className="px-4 py-4"><div className="h-4.5 w-16 bg-muted rounded-full" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                      <td className="px-4 py-4"><div className="h-4 w-20 bg-muted rounded mx-auto" /></td>
                      <td className="px-4 py-4"><div className="h-8 w-20 bg-muted rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-muted-foreground">
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
                    const nextRev = getNextRevisionLabel(prob.id);
                    const lastRevLabel = getLastRevisedLabel(prob.id);
                    const isBook = progressList.find((p) => p.problemId === prob.id)?.isBookmarked || false;
                    const hasNote = !!progressList.find((p) => p.problemId === prob.id)?.note;

                    const difficultyColors: Record<string, string> = {
                      Easy: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
                      Medium: "text-amber-400 bg-amber-500/15 border-amber-500/30",
                      Hard: "text-rose-400 bg-rose-500/15 border-rose-500/30",
                    };

                    return (
                      <tr
                        key={prob.id}
                        className="hover:bg-gradient-to-r hover:from-primary/5 hover:via-muted/15 hover:to-transparent transition-all group"
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
                          #{prob.id}
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
                        <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                          {prob.subtopic || prob.topic}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5 flex-wrap items-center">
                            {prob.companies && prob.companies.length > 0 ? (
                              prob.companies.slice(0, 2).map((comp) => (
                                <CompanyBadge key={comp} company={comp} />
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground">General</span>
                            )}
                            {prob.companies && prob.companies.length > 2 && (
                              <span className="text-[10px] text-muted-foreground font-semibold px-1 rounded bg-muted/40">
                                +{prob.companies.length - 2}
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
                        <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                          {lastRevLabel}
                        </td>
                        <td className="px-4 py-3.5 text-center text-xs">
                          <span className={cn("inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border text-[11px] transition-all", nextRev.color)}>
                            {nextRev.text}
                          </span>
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

          {/* Pagination for Table View */}
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
      )}

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
