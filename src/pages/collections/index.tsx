import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";
import { StatusChangeModal } from "@/components/common/StatusChangeModal";
import { PomodoroPromptModal } from "@/components/common/PomodoroPromptModal";

import {
  Library,
  Plus,
  Trash2,
  Edit,
  Bookmark,
  FileText,
  Eye,
  RefreshCw,
  ArrowLeft,
  CircleDashed,
  Zap,
  Sparkles,
  Crown,
  Clock,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

interface Collection {
  id: string;
  name: string;
  problemIds: string[];
  description?: string;
  isPublic?: boolean;
}



export function CollectionsPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Core Data States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active workspace states
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  // Modals visibility states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [newColPublic, setNewColPublic] = useState(false);

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");

  const [isAddProblemsOpen, setIsAddProblemsOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [tempCheckedIds, setTempCheckedIds] = useState<string[]>([]);

  // Note Modal state (reused from explorer page)
  const [activeNoteProblemId, setActiveNoteProblemId] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);

  // Status Modal & Pomodoro state
  const [statusModalProblem, setStatusModalProblem] = useState<{ id: string; title: string } | null>(null);
  const [pomodoroPromptProblem, setPomodoroPromptProblem] = useState<{ id: string; title: string; difficulty: string; leetcodeUrl: string } | null>(null);

  // Load Database values
  const loadCollectionsData = async () => {
    try {
      const [probRes, colRes, progRes] = await Promise.all([
        api.get("/problems?limit=1000"),
        api.get("/collections"),
        api.get("/progress")
      ]);

      setProblems(probRes.data.data.problems);
      setCollections(colRes.data.data);
      setProgressList(progRes.data.data);
    } catch {
      addToast("Failed to fetch collections records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollectionsData();
  }, []);

  const activeCollection = useMemo(() => {
    return collections.find((c) => c.id === activeCollectionId) || null;
  }, [collections, activeCollectionId]);

  // Check if problem is solved
  const isProblemSolved = (probId: string) => {
    return progressList.some(
      (p) => p.problemId === probId && ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(p.status)
    );
  };

  const isProblemBookmarked = (probId: string) => {
    return progressList.find((p) => p.problemId === probId)?.isBookmarked || false;
  };

  // 1. Create Playlist Collection
  const handleCreateCollection = async () => {
    if (!newColName.trim()) {
      addToast("Collection name is required.", "warning");
      return;
    }

    setSavingCollection(true);
    try {
      await api.post("/collections", {
        name: newColName,
        description: newColDesc,
        isPublic: newColPublic,
      });

      addToast(`Playlist "${newColName}" created successfully!`, "success");
      setNewColName("");
      setNewColDesc("");
      setNewColPublic(false);
      setIsCreateOpen(false);
      loadCollectionsData();
    } catch {
      addToast("Failed to create collection.", "error");
    } finally {
      setSavingCollection(false);
    }
  };

  // 2. Rename Collection
  const handleRenameCollection = async () => {
    if (!renameName.trim() || !activeCollectionId) return;

    setSavingCollection(true);
    try {
      await api.put(`/collections/${activeCollectionId}`, { name: renameName });
      addToast("Collection renamed successfully.", "success");
      setIsRenameOpen(false);
      loadCollectionsData();
    } catch {
      addToast("Failed to rename collection.", "error");
    } finally {
      setSavingCollection(false);
    }
  };

  // 3. Delete Collection
  const handleDeleteCollection = async () => {
    if (!activeCollectionId) return;

    try {
      await api.delete(`/collections/${activeCollectionId}`);
      addToast("Collection deleted.", "info");
      setActiveCollectionId(null);
      loadCollectionsData();
    } catch {
      addToast("Failed to delete collection.", "error");
    }
  };

  // 4. Open Add problems panel
  const handleOpenAddProblems = () => {
    if (!activeCollection) return;
    setTempCheckedIds([...activeCollection.problemIds]);
    setAddSearchQuery("");
    setIsAddProblemsOpen(true);
  };

  // Toggle problem select inside dialog checkbox
  const handleToggleProblemInAddDialog = (probId: string) => {
    if (tempCheckedIds.includes(probId)) {
      setTempCheckedIds(tempCheckedIds.filter((id) => id !== probId));
    } else {
      setTempCheckedIds([...tempCheckedIds, probId]);
    }
  };

  // Save selection inside playlist
  const handleSaveProblemsToCollection = async () => {
    if (!activeCollectionId) return;

    try {
      await api.put(`/collections/${activeCollectionId}`, { problems: tempCheckedIds });
      addToast("Playlist questions updated.", "success");
      setIsAddProblemsOpen(false);
      loadCollectionsData();
    } catch {
      addToast("Failed to update playlist questions.", "error");
    }
  };

  // Inline remove action
  const handleRemoveProblemFromCollection = async (probId: string) => {
    if (!activeCollectionId || !activeCollection) return;

    const updatedIds = activeCollection.problemIds.filter((id) => id !== probId);
    try {
      await api.put(`/collections/${activeCollectionId}`, { problems: updatedIds });
      addToast("Problem removed from this playlist.", "info");
      loadCollectionsData();
    } catch {
      addToast("Failed to remove problem.", "error");
    }
  };

  // Resolve problems list for active playlist
  const activePlaylistProblems = useMemo(() => {
    if (!activeCollection) return [];
    return activeCollection.problemIds
      .map((id) => problems.find((p) => p.id === id))
      .filter((p): p is Problem => !!p);
  }, [activeCollection, problems]);

  // Statistics calculations for active playlist card
  const activePlaylistStats = useMemo(() => {
    const total = activePlaylistProblems.length;
    const solved = activePlaylistProblems.filter((p) => isProblemSolved(p.id)).length;
    const remaining = total - solved;
    const percent = total > 0 ? Math.ceil((solved / total) * 100) : 0;

    const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
    activePlaylistProblems.forEach((p) => {
      const diff = p.difficulty as "Easy" | "Medium" | "Hard";
      if (difficulties[diff] !== undefined) {
        difficulties[diff]++;
      }
    });

    return { total, solved, remaining, percent, difficulties };
  }, [activePlaylistProblems, progressList]);

  // Filtered problems list inside dialog
  const filteredProblemsForAdd = useMemo(() => {
    if (!addSearchQuery) return problems;
    const q = addSearchQuery.toLowerCase();
    return problems.filter(
      (p) => p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q)
    );
  }, [problems, addSearchQuery]);

  // Bookmark Toggle
  const handleBookmarkToggle = async (probId: string) => {
    const currentlyBookmarked = isProblemBookmarked(probId);
    try {
      await api.put(`/progress/${probId}`, { isBookmarked: !currentlyBookmarked });
      addToast(currentlyBookmarked ? "Bookmark removed." : "Bookmark added.", currentlyBookmarked ? "info" : "success");
      loadCollectionsData();
    } catch {
      addToast("Failed to toggle bookmark.", "error");
    }
  };

  // Problem Status Resolver
  const getProblemStatus = (probId: string) => {
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

  // Open Notes Dialog
  const handleOpenNoteModal = (probId: string) => {
    setActiveNoteProblemId(probId);
    const prog = progressList.find((p) => p.problemId === probId);
    setActiveNoteText(prog?.note || "");
  };

  // Inline Note Editor Save
  const handleSaveNotes = async () => {
    if (!activeNoteProblemId) return;
    setSavingNote(true);
    try {
      await api.post(`/notes/${activeNoteProblemId}`, { note: activeNoteText });
      addToast("Recall note saved successfully.", "success");
      setActiveNoteProblemId(null);
      loadCollectionsData();
    } catch {
      addToast("Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  // Open Status Dialog
  const handleOpenStatusModal = (id: string, title: string) => {
    setStatusModalProblem({ id, title });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted/60 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-32 bg-muted/40 rounded animate-pulse" />
          <div className="h-32 bg-muted/40 rounded animate-pulse" />
          <div className="h-32 bg-muted/40 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      
      {/* ===================================================
          MODE A: Curated Playlist Workspace Detail view
          =================================================== */}
      {activeCollectionId && activeCollection ? (
        <div className="space-y-6">
          
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <button
              onClick={() => setActiveCollectionId(null)}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" /> Back to Playlists
            </button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRenameName(activeCollection.name);
                  setIsRenameOpen(true);
                }}
                className="text-xs cursor-pointer"
              >
                <Edit className="size-3.5 mr-1" /> Rename
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteCollection}
                className="text-xs text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 className="size-3.5 mr-1" /> Delete Playlist
              </Button>
            </div>
          </div>

          {/* Playlist Title & Meta */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="size-12 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Library className="size-6" />
              </div>
              <div className="space-y-1">
                <Typography variant="h1" className="font-semibold text-foreground">
                  {activeCollection.name}
                </Typography>
                <p className="text-xs text-muted-foreground">
                  {activeCollection.description || "No description set. Curate problems for focused placement prep."}
                </p>
              </div>
            </div>

            {/* Numbers metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <div>
                <span className="font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">Total</span>
                <span className="text-base font-semibold text-foreground">{activePlaylistStats.total} Problems</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">Solved</span>
                <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">{activePlaylistStats.solved}</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">Remaining</span>
                <span className="text-base font-semibold text-foreground">{activePlaylistStats.remaining}</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground uppercase block text-[9px] tracking-wider">Completions</span>
                <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400">{activePlaylistStats.percent}%</span>
              </div>
            </div>

            {/* Progress bar and difficulties */}
            <div className="space-y-3 pt-2">
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${activePlaylistStats.percent}%` }}
                />
              </div>
              
              <div className="flex gap-4 text-[10px] text-muted-foreground font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">Easy {activePlaylistStats.difficulties.Easy}</span>
                <span className="text-amber-600 dark:text-amber-400">Medium {activePlaylistStats.difficulties.Medium}</span>
                <span className="text-rose-600 dark:text-rose-400">Hard {activePlaylistStats.difficulties.Hard}</span>
              </div>
            </div>
          </div>

          {/* Quick actions toolbar */}
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
            <Typography variant="title" className="text-xs text-muted-foreground">
              Curated Playlist Queue
            </Typography>
            
            <Button
              onClick={handleOpenAddProblems}
              variant="default"
              size="sm"
              className="text-xs cursor-pointer shadow-sm"
            >
              <Plus className="size-3.5 mr-1" /> Add Problems
            </Button>
          </div>

          {/* Playlist Problems Table */}
          <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground select-none">
                    <th className="px-4 py-3 text-center w-16 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Status</th>
                    <th className="px-4 py-3 w-20 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">ID</th>
                    <th className="px-4 py-3 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Problem</th>
                    <th className="px-4 py-3 text-center w-24 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Practice</th>
                    <th className="px-4 py-3 w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Difficulty</th>
                    <th className="px-4 py-3 w-32 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Last Solved</th>
                    <th className="px-4 py-3 w-36 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Next Revision</th>
                    <th className="px-4 py-3 text-center w-28 sticky top-0 bg-muted/95 backdrop-blur-sm z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {activePlaylistProblems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <div className="max-w-md mx-auto space-y-2">
                          <Library className="size-8 text-muted-foreground/60 mx-auto" />
                          <p className="font-semibold text-foreground">Playlist is empty</p>
                          <p className="text-xs">Curate this sheet by clicking 'Add Problems' to attach relevant challenges.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activePlaylistProblems.map((prob) => {
                      const stat = getProblemStatus(prob.id);
                      const isBook = isProblemBookmarked(prob.id);
                      const prog = progressList.find((p) => p.problemId === prob.id);
                      const hasNote = prog && prog.note && prog.note.trim().length > 0;

                      // Next review dates
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
                        <tr key={prob.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => {
                                handleOpenStatusModal(prob.id, prob.title);
                              }}
                              className="p-1 rounded hover:bg-muted cursor-pointer inline-flex items-center justify-center animate-none"
                            >
                              {stat.icon}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                            {prob.id}
                          </td>
                          <td className="px-4 py-3.5 text-left">
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
                              title="Solve on LeetCode"
                            >
                              <img
                                src={leetcodeLogo}
                                alt="LeetCode"
                                className="size-6 object-contain"
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-left">
                            <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5 border", difficultyColors[prob.difficulty])}>
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-foreground text-left">
                            {getLastRevisedLabel(prob.id)}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-left">
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
                              
                              {/* Bookmark star */}
                              <button
                                onClick={() => handleBookmarkToggle(prob.id)}
                                className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                                title="Bookmark Problem"
                              >
                                <Bookmark className={cn("size-4", isBook ? "text-amber-500 fill-amber-500 border-amber-500" : "")} />
                              </button>

                              {/* Edit recall notes */}
                              <button
                                onClick={() => handleOpenNoteModal(prob.id)}
                                className={cn(
                                  "p-1.5 rounded cursor-pointer",
                                  hasNote 
                                    ? "text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400"
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                                title="Add/Edit Notes"
                              >
                                <FileText className="size-4" />
                              </button>

                              {/* Detail workspace outlink */}
                              <Link
                                  to={`/problems/${prob.id}`}
                                  className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer inline-flex items-center"
                                  title="Open Workspace"
                              >
                                <Eye className="size-4" />
                              </Link>

                              {/* Remove from playlist */}
                              <button
                                onClick={() => handleRemoveProblemFromCollection(prob.id)}
                                className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                title="Remove from Playlist"
                              >
                                <Trash2 className="size-4" />
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
          </div>

        </div>
      ) : (
        /* ===================================================
            MODE B: Collections Grid Dashboard Lists
            =================================================== */
        <div className="space-y-6">
          
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
            <div>
              <Typography variant="h1" className="font-semibold text-foreground">
                Learning Playlists
              </Typography>
              <Typography variant="muted">
                Group DSA patterns into structured, personalized interview roadmaps.
              </Typography>
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="default"
              className="h-10 px-5 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Plus className="size-4" /> Create Collection
            </Button>
          </div>

          {/* Playlist Cards Grid */}
          {collections.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-border rounded-xl space-y-3 bg-card/20">
              <Library className="size-10 text-muted-foreground/60 mx-auto" />
              <Typography variant="title" className="text-foreground font-semibold block">
                No Collections Yet
              </Typography>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Organize your interview preparation by playlist sheets (e.g. Blind 75, Amazon High Frequencies, Graph Master).
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  size="sm"
                  className="text-xs cursor-pointer shadow-sm"
                >
                  Create Collection
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((col) => {
                // Calculate card statistics
                const total = col.problemIds.length;
                const colProblems = col.problemIds.map(id => problems.find(p => p.id === id)).filter(p => !!p);
                const solved = colProblems.filter(p => isProblemSolved(p.id)).length;
                const percent = total > 0 ? Math.ceil((solved / total) * 100) : 0;

                return (
                  <div
                    key={col.id}
                    onClick={() => setActiveCollectionId(col.id)}
                    className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-border-hover transition-all hover:shadow-md cursor-pointer flex flex-col justify-between h-44 text-left group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Library className="size-4.5 text-indigo-500 shrink-0" />
                        <Typography variant="title" className="font-semibold text-foreground group-hover:text-primary-hover transition-colors">
                          {col.name}
                        </Typography>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {col.description || "Custom study playlist roadmap"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Progress</span>
                        <span className="text-foreground">{percent}%</span>
                      </div>
                      {/* Progress bar line */}
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/30 pt-2.5">
                      <span>{total} Problems ({solved} solved)</span>
                      <span>Updated recently</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ===================================================
          DIALOG OVERLAYS
          =================================================== */}

      {/* 1. Create Playlist Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Study Playlist"
        description="Bundle specific DSA patterns to curate placement roadmaps."
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Playlist Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Blind 75, Graph Master"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              disabled={savingCollection}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Description:
            </label>
            <Textarea
              placeholder="Write target roadmap descriptions..."
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              disabled={savingCollection}
              className="text-xs h-20"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="col_is_public"
              checked={newColPublic}
              onChange={(e) => setNewColPublic(e.target.checked)}
              disabled={savingCollection}
              className="size-3.5 accent-indigo-500 cursor-pointer"
            />
            <label htmlFor="col_is_public" className="text-xs text-muted-foreground cursor-pointer select-none">
              Make this playlist public (Future share link features)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} disabled={savingCollection} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={savingCollection} size="sm" className="text-xs cursor-pointer shadow-sm">
              {savingCollection ? "Creating..." : "Create Collection"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 2. Rename Playlist Dialog */}
      <Dialog
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Playlist"
        description="Rename this learning playlist roadmap."
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              New Playlist Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              disabled={savingCollection}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRenameOpen(false)} disabled={savingCollection} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleRenameCollection} disabled={savingCollection} size="sm" className="text-xs cursor-pointer shadow-sm">
              {savingCollection ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 3. Add Problems selector Dialog */}
      <Dialog
        isOpen={isAddProblemsOpen}
        onClose={() => setIsAddProblemsOpen(false)}
        title="Add Problems to Playlist"
        description="Search problems from the directory directory and toggle checkboxes to include them."
      >
        <div className="space-y-4 text-left">
          <SearchInput
            placeholder="Search problems or topics to append..."
            value={addSearchQuery}
            onChange={(e) => setAddSearchQuery(e.target.value)}
            className="w-full text-xs"
          />

          <div className="max-h-60 overflow-y-auto divide-y divide-border border border-border rounded-lg bg-background">
            {filteredProblemsForAdd.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No matching problems found.</p>
            ) : (
              filteredProblemsForAdd.map((prob) => {
                const isChecked = tempCheckedIds.includes(prob.id);
                return (
                  <div
                    key={prob.id}
                    onClick={() => handleToggleProblemInAddDialog(prob.id)}
                    className="flex items-center gap-3 p-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by click wrapper
                      className="size-4 accent-indigo-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{prob.title}</p>
                      <p className="text-[10px] text-muted-foreground">{prob.topic} • {prob.difficulty}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <span>{tempCheckedIds.length} problems selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddProblemsOpen(false)} className="text-xs cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSaveProblemsToCollection} size="sm" className="text-xs cursor-pointer shadow-sm">
                Done
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* 4. Notes Modal (Inline details) */}
      <Dialog
        isOpen={activeNoteProblemId !== null}
        onClose={() => setActiveNoteProblemId(null)}
        title="Add/Edit Problem Notes"
        description="Write code notes, patterns, or constraints to review later."
      >
        <div className="space-y-4 text-left">
          <Textarea
            placeholder="Type patterns summaries (e.g. 'Uses two-pointer boundary check, time complexity is O(N)...')"
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

      {/* Centralized Status Log Modal */}
      <StatusChangeModal
        isOpen={statusModalProblem !== null}
        onClose={() => setStatusModalProblem(null)}
        problemId={statusModalProblem?.id || null}
        problemTitle={statusModalProblem?.title || null}
        onStatusUpdated={() => {
          loadCollectionsData(); // reload layout records
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
