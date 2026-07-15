import { useState, useEffect, useMemo } from "react";
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

import {
  Bookmark,
  FileText,
  Eye,
  XCircle,
  RotateCcw,
  Circle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  solvedCount: number;
}

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
  status: string;
  interval: number;
}

export function ProblemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Data State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [activeStatusProblemId, setActiveStatusProblemId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  // URL State values
  const searchQuery = searchParams.get("search") || "";
  const filterDifficulty = searchParams.get("difficulty") || "All";
  const filterStatus = searchParams.get("status") || "All";
  const sortBy = searchParams.get("sort") || "id";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const pageSize = 8;

  // Select a random problem and redirect
  const handleRandomProblem = () => {
    if (problems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * problems.length);
    const randomProb = problems[randomIndex];
    addToast(`Selected random problem: "${randomProb.title}"`, "info");
    navigate(`/problems/${randomProb.id}`);
  };

  // Load Data
  const loadExplorerData = async () => {
    try {
      const probRes = await api.get("/problems");
      const revRes = await api.get("/revisions");
      
      const rawSub = localStorage.getItem("mock_submissions") || "[]";
      const rawBookmarks = localStorage.getItem("crackdsa_bookmarks") || "[]";
      const rawNotes = localStorage.getItem("mock_notes") || "{}";

      setProblems(probRes.data);
      setRevisions(revRes.data);
      setSubmissions(JSON.parse(rawSub));
      setBookmarks(JSON.parse(rawBookmarks));
      setNotes(JSON.parse(rawNotes));
    } catch {
      addToast("Failed to fetch problems directory records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplorerData();
  }, []);

  // Update query params helper
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

  // Reset all filters action
  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    addToast("All problem filters cleared.", "info");
  };

  // Toggle Bookmark logic
  const handleBookmarkToggle = (probId: string) => {
    let updatedBookmarks = [...bookmarks];
    const isBookmarked = bookmarks.includes(probId);

    if (isBookmarked) {
      updatedBookmarks = updatedBookmarks.filter((id) => id !== probId);
      addToast("Problem removed from bookmarks.", "info");
    } else {
      updatedBookmarks.push(probId);
      addToast("Problem bookmarked successfully.", "success");
    }

    setBookmarks(updatedBookmarks);
    localStorage.setItem("crackdsa_bookmarks", JSON.stringify(updatedBookmarks));
  };

  // Problem Status Resolver
  const getProblemStatus = (probId: string) => {
    const revision = revisions.find((r) => r.problemId === probId);
    const correctSub = submissions.filter((s) => s.problemId === probId && s.status === "Correct");
    const hasFailed = submissions.some((s) => s.problemId === probId && s.status !== "Correct");

    if (revision) {
      if (revision.interval >= 15) {
        return {
          text: "Mastered",
          color: "text-purple-600 dark:text-purple-400",
          icon: <Award className="size-4 text-purple-500 mx-auto" />
        };
      }
      if (revision.status === "todo") {
        const isDue = new Date(revision.nextReviewDate).getTime() <= Date.now();
        return isDue 
          ? {
              text: "Needs Revision",
              color: "text-amber-600 dark:text-amber-400",
              icon: <AlertCircle className="size-4 text-amber-500 mx-auto" />
            }
          : {
              text: "Revised Once",
              color: "text-blue-600 dark:text-blue-400",
              icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
            };
      }
      return {
        text: "Revised Once",
        color: "text-blue-600 dark:text-blue-400",
        icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
      };
    }

    if (correctSub.length > 0) {
      return {
        text: "Solved",
        color: "text-emerald-600 dark:text-emerald-400",
        icon: <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
      };
    }

    if (hasFailed) {
      return {
        text: "Attempted",
        color: "text-amber-500",
        icon: <AlertCircle className="size-4 text-amber-400 mx-auto" />
      };
    }

    return {
      text: "Not Started",
      color: "text-muted-foreground",
      icon: <Circle className="size-4 text-muted-foreground/60 mx-auto" />
    };
  };

  // Status updates in DB
  const handleStatusChange = async (newStatus: string) => {
    if (!activeStatusProblemId) return;

    try {
      let revs = JSON.parse(localStorage.getItem("mock_revisions") || "[]");
      let subs = JSON.parse(localStorage.getItem("mock_submissions") || "[]");
      const todayStr = new Date().toISOString();

      if (newStatus === "Not Started") {
        revs = revs.filter((r: any) => r.problemId !== activeStatusProblemId);
        subs = subs.filter((s: any) => s.problemId !== activeStatusProblemId);
      } 
      else if (newStatus === "Attempted") {
        revs = revs.filter((r: any) => r.problemId !== activeStatusProblemId);
        subs = subs.filter((s: any) => s.problemId !== activeStatusProblemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: activeStatusProblemId,
          status: "Wrong Answer",
          date: todayStr,
        });
      } 
      else if (newStatus === "Solved") {
        subs = subs.filter((s: any) => s.problemId !== activeStatusProblemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: activeStatusProblemId,
          status: "Correct",
          date: todayStr,
        });
        if (!revs.some((r: any) => r.problemId === activeStatusProblemId)) {
          revs.push({
            id: `rev-${Math.random()}`,
            userId: "usr-2",
            problemId: activeStatusProblemId,
            nextReviewDate: todayStr,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 1,
            status: "todo",
          });
        }
      } 
      else if (newStatus === "Revised Once") {
        subs = subs.filter((s: any) => s.problemId !== activeStatusProblemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: activeStatusProblemId,
          status: "Correct",
          date: todayStr,
        });
        revs = revs.filter((r: any) => r.problemId !== activeStatusProblemId);
        revs.push({
          id: `rev-${Math.random()}`,
          userId: "usr-2",
          problemId: activeStatusProblemId,
          nextReviewDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          interval: 3,
          easeFactor: 2.5,
          repetitions: 2,
          status: "todo",
        });
      } 
      else if (newStatus === "Mastered") {
        subs = subs.filter((s: any) => s.problemId !== activeStatusProblemId);
        subs.push({
          id: `sub-${Math.random()}`,
          userId: "usr-2",
          problemId: activeStatusProblemId,
          status: "Correct",
          date: todayStr,
        });
        revs = revs.filter((r: any) => r.problemId !== activeStatusProblemId);
        revs.push({
          id: `rev-${Math.random()}`,
          userId: "usr-2",
          problemId: activeStatusProblemId,
          nextReviewDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
          interval: 15,
          easeFactor: 2.7,
          repetitions: 4,
          status: "todo",
        });
      }

      localStorage.setItem("mock_revisions", JSON.stringify(revs));
      localStorage.setItem("mock_submissions", JSON.stringify(subs));

      if (["Solved", "Revised Once", "Mastered"].includes(newStatus)) {
        const streaks = JSON.parse(localStorage.getItem("mock_streaks") || "[]");
        const dStr = todayStr.split("T")[0];
        if (!streaks.includes(dStr)) {
          streaks.push(dStr);
          localStorage.setItem("mock_streaks", JSON.stringify(streaks));
        }
      }

      addToast(`Status updated to "${newStatus}"`, "success");
      setActiveStatusProblemId(null);
      loadExplorerData();
    } catch {
      addToast("Failed to update problem status.", "error");
    }
  };

  // Open Status Dialog
  const handleOpenStatusModal = (probId: string) => {
    setActiveStatusProblemId(probId);
  };

  // Open Notes Dialog
  const handleOpenNoteModal = (probId: string) => {
    setActiveNoteProblemId(probId);
    const noteKey = `usr-2_${probId}`;
    setActiveNoteText(notes[noteKey] || "");
  };

  // Save Notes Dialog
  const handleSaveNotes = async () => {
    if (!activeNoteProblemId) return;
    setSavingNote(true);
    try {
      await api.post(`/notes/${activeNoteProblemId}`, { note: activeNoteText });
      
      const rawNotes = JSON.parse(localStorage.getItem("mock_notes") || "{}");
      rawNotes[`usr-2_${activeNoteProblemId}`] = activeNoteText;
      localStorage.setItem("mock_notes", JSON.stringify(rawNotes));
      
      setNotes(rawNotes);
      addToast("Problem notes saved.", "success");
      setActiveNoteProblemId(null);
    } catch {
      addToast("Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  // Filter & Search & Sort Pipeline
  const processedProblems = useMemo(() => {
    let result = [...problems];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q)
        );
      });
    }

    if (filterDifficulty !== "All") {
      result = result.filter((p) => p.difficulty === filterDifficulty);
    }

    if (filterStatus !== "All") {
      result = result.filter((p) => {
        const stat = getProblemStatus(p.id);
        if (filterStatus === "Bookmarked") {
          return bookmarks.includes(p.id);
        }
        return stat.text === filterStatus;
      });
    }

    result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "difficulty") return a.difficulty.localeCompare(b.difficulty);
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [problems, revisions, submissions, bookmarks, searchQuery, filterDifficulty, filterStatus, sortBy]);

  // Pagination bounds
  const totalItems = processedProblems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedProblems.slice(start, start + pageSize);
  }, [processedProblems, currentPage, pageSize]);

  // Aggregate Header stats
  const solvedCount = problems.filter((p) => {
    return submissions.some((s) => s.problemId === p.id && s.status === "Correct");
  }).length;
  const percentComplete = problems.length > 0 ? Math.ceil((solvedCount / problems.length) * 100) : 0;



  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 animate-pulse" />
            <Skeleton className="h-4 w-96 animate-pulse" />
          </div>
          <div className="flex gap-4 p-4 bg-card border border-border rounded-xl shadow-sm shrink-0">
            <div className="space-y-2 w-16 text-center">
              <Skeleton className="h-6 w-10 mx-auto animate-pulse" />
              <Skeleton className="h-3 w-12 mx-auto animate-pulse" />
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="space-y-2 w-16 text-center">
              <Skeleton className="h-6 w-10 mx-auto animate-pulse" />
              <Skeleton className="h-3 w-12 mx-auto animate-pulse" />
            </div>
            <div className="w-[1px] h-8 bg-border" />
            <div className="space-y-2 w-16 text-center">
              <Skeleton className="h-6 w-10 mx-auto animate-pulse" />
              <Skeleton className="h-3.5 w-14 mx-auto rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filter bar Skeleton */}
        <div className="flex flex-col gap-3 py-4 border-b border-border">
          <div className="flex flex-col md:flex-row gap-3">
            <Skeleton className="h-9 flex-1 animate-pulse" />
            <Skeleton className="h-9 w-28 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Skeleton className="h-9 w-full animate-pulse" />
            <Skeleton className="h-9 w-full animate-pulse" />
            <Skeleton className="h-9 w-full animate-pulse" />
            <Skeleton className="h-9 w-full animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton matching the actual columns */}
        <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/40 p-4 border-b border-border flex justify-between gap-4">
            <Skeleton className="h-4 w-12 animate-pulse" />
            <Skeleton className="h-4 w-16 animate-pulse" />
            <Skeleton className="h-4 w-1/3 animate-pulse" />
            <Skeleton className="h-4 w-16 animate-pulse" />
            <Skeleton className="h-4 w-20 animate-pulse" />
            <Skeleton className="h-4 w-24 animate-pulse" />
            <Skeleton className="h-4 w-20 animate-pulse" />
          </div>
          <div className="divide-y divide-border p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-4 flex justify-between items-center gap-4">
                <Skeleton className="h-5 w-6 rounded-full animate-pulse" />
                <Skeleton className="h-4 w-12 animate-pulse" />
                <Skeleton className="h-4 w-1/3 animate-pulse" />
                <Skeleton className="h-6 w-10 rounded-lg animate-pulse" />
                <Skeleton className="h-5 w-16 rounded-full animate-pulse" />
                <Skeleton className="h-4 w-20 animate-pulse" />
                <Skeleton className="h-8 w-20 rounded animate-pulse" />
              </div>
            ))}
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
          <Typography variant="h1" className="font-semibold text-foreground">
            Problems Directory
          </Typography>
          <Typography variant="muted">
            Track spaced recall timelines and organize curation sheets.
          </Typography>
        </div>

        <div className="flex items-center gap-6 p-4 rounded-xl bg-card border border-border shadow-sm">
          <div className="text-center">
            <p className="text-xl font-light text-foreground">{problems.length}</p>
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
              placeholder="Search by problem name or topic... (e.g. LRU, Graph)"
              value={searchQuery}
              onChange={(e) => updateQueryParam("search", e.target.value)}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
              { value: "Revised Once", label: "Revised" },
              { value: "Mastered", label: "Mastered" },
              { value: "Bookmarked", label: "Bookmarked Only" },
            ]}
            value={filterStatus}
            onChange={(e) => updateQueryParam("status", e.target.value)}
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
            className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm h-9"
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
                <th className="px-4 py-3 w-20 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">ID</th>
                <th className="px-4 py-3 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Problem</th>
                <th className="px-4 py-3 text-center w-24 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Practice</th>
                <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Difficulty</th>
                <th className="px-4 py-3 w-36 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Next Revision</th>
                <th className="px-4 py-3 text-center w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-2">
                      <XCircle className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="font-semibold text-foreground">No matches found</p>
                      <p className="text-xs">Adjust your keywords or reset filters to explore other questions.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((prob) => {
                  const stat = getProblemStatus(prob.id);
                  const isBookmarked = bookmarks.includes(prob.id);
                  
                  // Check if note exists
                  const noteKey = `usr-2_${prob.id}`;
                  const hasNote = notes[noteKey] && notes[noteKey].trim().length > 0;

                  // Next review dates calculation
                  const rev = revisions.find((r) => r.problemId === prob.id);
                  let reviewDateStr = "-";
                  if (rev) {
                    if (rev.status === "completed") {
                      reviewDateStr = "Done";
                    } else {
                      const d = new Date(rev.nextReviewDate);
                      reviewDateStr = d.getTime() <= Date.now() ? "Due Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
                          onClick={() => handleOpenStatusModal(prob.id)}
                          className="p-1 rounded hover:bg-muted transition-all cursor-pointer inline-flex items-center justify-center"
                          title={`Click to adjust status (Current: ${stat.text})`}
                        >
                          {stat.icon}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                        {prob.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-semibold text-foreground hover:text-primary-hover hover:underline transition-colors"
                        >
                          {prob.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => {
                            const slug = prob.title.toLowerCase().replace(/ /g, "-");
                            window.open(`https://leetcode.com/problems/${slug}/`, "_blank");
                            addToast(`Opening LeetCode for "${prob.title}"...`, "info");
                          }}
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-sm text-amber-500"
                          title="Solve on LeetCode"
                        >
                          <svg className="size-4 fill-current" viewBox="0 0 24 24">
                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.055 9.063a1.503 1.503 0 0 0-.012 2.117l5.67 5.684a1.38 1.38 0 0 0 1.96 0L20.21 8.167a1.38 1.38 0 0 0 0-1.96l-5.677-5.69a1.37 1.37 0 0 0-.962-.417zM5.53 12.636a1.38 1.38 0 0 0 0 1.96l5.67 5.679a1.38 1.38 0 0 0 1.96 0l5.127-5.137a1.5 1.5 0 0 0-2.112-2.13l-4.01 4.02-3.606-3.606 2.116-2.126a1.5 1.5 0 0 0-2.112-2.13l-3.033 3.04z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5 border", difficultyColors[prob.difficulty])}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium">
                        <span className={cn(
                          "font-medium",
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
                            title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                          >
                            <Bookmark className={cn("size-4", isBookmarked ? "text-amber-500 fill-amber-500 border-amber-500" : "")} />
                          </button>
                          
                          {/* Add Note */}
                          <button
                            onClick={() => handleOpenNoteModal(prob.id)}
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
                            to={`/problems/${prob.id}`}
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

        {/* 4. Pagination Controls Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-muted/10 text-xs text-muted-foreground">
            <span>
              Showing Page <span className="font-semibold text-foreground">{currentPage}</span> of <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems} matching problems)
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateQueryParam("page", String(currentPage - 1))}
                className="h-8 text-xs cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateQueryParam("page", String(currentPage + 1))}
                className="h-8 text-xs cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Note Editor Overlay Modal */}
      <Dialog
        isOpen={activeNoteProblemId !== null}
        onClose={() => setActiveNoteProblemId(null)}
        title="Add/Edit Problem Notes"
        description="Write code notes, patterns, or constraints to review later."
      >
        <div className="space-y-4 text-left">
          <Textarea
            placeholder="Type patterns summaries (e.g. 'Uses left_max and right_max arrays, time complexity is O(N)...')"
            value={activeNoteText}
            onChange={(e) => setActiveNoteText(e.target.value)}
            className="text-xs h-32 leading-relaxed"
            disabled={savingNote}
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

      {/* Status Changer Dialog Modal */}
      <Dialog
        isOpen={activeStatusProblemId !== null}
        onClose={() => setActiveStatusProblemId(null)}
        title="Adjust Problem Solving Status"
        description="Select the current spaced-repetition tracking status for this problem."
      >
        <div className="space-y-3 text-left">
          <div className="grid grid-cols-1 gap-2">
            {[
              { status: "Not Started", desc: "⚪ Haven't solved or catalogued this question." },
              { status: "Attempted", desc: "🟡 Solved but failed test cases or had efficiency bugs." },
              { status: "Solved", desc: "🟢 Verified correct on LeetCode. Fresh memory scheduled." },
              { status: "Revised Once", desc: "🔵 Verified correct. Completed first review session successfully." },
              { status: "Mastered", desc: "🟣 Interval timeline exceeds 15 days of recall safety." },
            ].map((item) => (
              <button
                key={item.status}
                onClick={() => handleStatusChange(item.status)}
                className="w-full text-left p-2.5 rounded-lg border border-border hover:bg-muted/40 hover:border-border-hover transition-all cursor-pointer text-xs"
              >
                <p className="font-semibold text-foreground">{item.status}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStatusProblemId(null)}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
