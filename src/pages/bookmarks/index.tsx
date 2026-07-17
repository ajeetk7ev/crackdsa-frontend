import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { StatusChangeModal } from "@/components/common/StatusChangeModal";
import { PomodoroPromptModal } from "@/components/common/PomodoroPromptModal";
import {
  Bookmark,
  FileText,
  Eye,
  Circle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Award,
} from "lucide-react";

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
}

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
  status: "todo" | "completed";
  interval: number;
}

export function BookmarksPage() {
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  // Modals state
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [statusModalProblem, setStatusModalProblem] = useState<{ id: string; title: string } | null>(null);
  const [pomodoroPromptProblem, setPomodoroPromptProblem] = useState<{ id: string; title: string; difficulty: string; leetcodeUrl: string } | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  const loadData = async () => {
    try {
      setLoading(true);
      const progRes = await api.get("/progress");
      setProgressList(progRes.data.data);
    } catch {
      addToast("Failed to fetch bookmarks workspace progress records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookmarkToggle = async (probId: string) => {
    try {
      await api.put(`/progress/${probId}`, { isBookmarked: false });
      addToast("Removed from bookmarks.", "info");
      loadData();
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
        icon: <Circle className="size-4 text-muted-foreground/60 mx-auto" />
      };
    }

    if (prog.status === "Mastered") {
      return {
        text: "Mastered",
        color: "text-purple-600 dark:text-purple-400",
        icon: <Award className="size-4 text-purple-500 mx-auto" />
      };
    }
    if (prog.status === "Needs Revision") {
      return {
        text: "Needs Revision",
        color: "text-amber-600 dark:text-amber-400",
        icon: <AlertCircle className="size-4 text-amber-500 mx-auto" />
      };
    }
    if (prog.status === "Revised Once") {
      return {
        text: "Revised Once",
        color: "text-blue-600 dark:text-blue-400",
        icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
      };
    }
    if (prog.status === "Solved") {
      return {
        text: "Solved",
        color: "text-emerald-600 dark:text-emerald-400",
        icon: <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
      };
    }
    if (prog.status === "Attempted") {
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

  const handleOpenNoteModal = (probId: string) => {
    setActiveNoteProblemId(probId);
    const prog = progressList.find((p) => p.problemId === probId);
    setActiveNoteText(prog?.note || "");
  };

  const handleSaveNote = async () => {
    if (!activeNoteProblemId) return;
    setSavingNote(true);
    try {
      await api.post(`/notes/${activeNoteProblemId}`, { note: activeNoteText });
      addToast("Notes saved successfully.", "success");
      setActiveNoteProblemId(null);
      loadData();
    } catch {
      addToast("Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  const handleOpenStatusModal = (id: string, title: string) => {
    setStatusModalProblem({ id, title });
  };

  const processedProblems = useMemo(() => {
    return progressList
      .filter((p) => p.isBookmarked && p.problem)
      .map((p) => p.problem)
      .filter((p) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (filterDifficulty !== "All" && p.difficulty !== filterDifficulty) {
          return false;
        }

        return true;
      });
  }, [progressList, searchQuery, filterDifficulty]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="flex flex-col gap-3 py-4 border-b border-border">
          <div className="flex gap-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="border border-border bg-card rounded-xl overflow-hidden h-96">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <div>
        <Typography variant="h1" className="font-semibold text-foreground">
          🔖 Bookmarked Challenges
        </Typography>
        <Typography variant="muted">
          Access and manage your curated coding problems checklist.
        </Typography>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 py-4 border-b border-border bg-background/95 backdrop-blur-md sticky top-14 z-20">
        <div className="flex-1">
          <SearchInput
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={[
              { value: "All", label: "Difficulty: All" },
              { value: "Easy", label: "Easy" },
              { value: "Medium", label: "Medium" },
              { value: "Hard", label: "Hard" },
            ]}
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-36"
          />
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setFilterDifficulty("All");
            }}
            className="text-xs shrink-0 cursor-pointer"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bookmarked List table with locked heights and sticky header */}
      {processedProblems.length === 0 ? (
        <div className="border border-border bg-card rounded-xl p-12 text-center text-muted-foreground shadow-sm">
          <div className="max-w-md mx-auto space-y-3">
            <Bookmark className="size-12 text-muted-foreground/40 mx-auto animate-bounce" />
            <p className="text-sm font-semibold">No bookmarked problems found</p>
            <p className="text-xs">
              Go to the <Link to="/problems" className="text-primary hover:underline font-semibold">Problems Directory</Link> and click the bookmark button on any problem to curate your list.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/95 backdrop-blur-sm text-xs font-semibold text-muted-foreground select-none">
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
                {processedProblems.map((prob) => {
                  const stat = getProblemStatus(prob.id);
                  const prog = progressList.find((p) => p.problemId === prob.id);
                  const hasNote = prog && prog.note && prog.note.trim().length > 0;
                  
                  let reviewDateStr = "-";
                  if (prog && prog.srs && prog.srs.nextReviewDate) {
                    if (prog.srs.status === "completed") {
                      reviewDateStr = "Done";
                    } else {
                      const d = new Date(prog.srs.nextReviewDate);
                      reviewDateStr = d.getTime() <= Date.now() ? "Due Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }
                  }

                  const difficultyColors: Record<string, string> = {
                    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
                    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
                    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20",
                  };

                  return (
                    <tr key={prob.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleOpenStatusModal(prob.id, prob.title)}
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
                            setPomodoroPromptProblem({
                              id: prob.id,
                              title: prob.title,
                              difficulty: prob.difficulty,
                              leetcodeUrl: `https://leetcode.com/problems/${slug}/`
                            });
                          }}
                          className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted hover:scale-105 transition-all cursor-pointer inline-flex items-center justify-center shadow-sm"
                        >
                          <img
                            src={leetcodeLogo}
                            alt="LeetCode"
                            className="size-4 dark:invert object-contain"
                          />
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
                          {/* Unbookmark */}
                          <button
                            onClick={() => handleBookmarkToggle(prob.id)}
                            className="p-1.5 rounded text-amber-500 hover:bg-muted cursor-pointer"
                            title="Remove Bookmark"
                          >
                            <Bookmark className="size-4 fill-amber-500 text-amber-500" />
                          </button>

                          {/* Notes */}
                          <button
                            onClick={() => handleOpenNoteModal(prob.id)}
                            className={cn(
                              "p-1.5 rounded cursor-pointer transition-colors",
                              hasNote 
                                ? "text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 animate-pulse" 
                                : "text-muted-foreground hover:bg-muted"
                            )}
                            title="Edit Notes"
                          >
                            <FileText className="size-4" />
                          </button>

                          <Link
                            to={`/problems/${prob.id}`}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer inline-flex items-center"
                            title="View Workspace"
                          >
                            <Eye className="size-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes Dialog */}
      <Dialog
        isOpen={activeNoteProblemId !== null}
        onClose={() => setActiveNoteProblemId(null)}
        title="Spaced Repetition Review Notes"
        description="Jot down hints, code snippets or logic gotchas for this bookmarked item."
      >
        <div className="space-y-4 text-left">
          <Textarea
            value={activeNoteText}
            onChange={(e) => setActiveNoteText(e.target.value)}
            className="text-xs h-36 font-mono"
            placeholder="e.g. Remember to use two pointers, or verify boundary check when index < 0..."
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setActiveNoteProblemId(null)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={savingNote}
              size="sm"
              className="text-xs cursor-pointer"
            >
              {savingNote ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Centralized Status Log Modal */}
      <StatusChangeModal
        isOpen={statusModalProblem !== null}
        onClose={() => setStatusModalProblem(null)}
        problemId={statusModalProblem?.id || null}
        problemTitle={statusModalProblem?.title || null}
        onStatusUpdated={() => {
          loadData(); // reload layout records
        }}
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
