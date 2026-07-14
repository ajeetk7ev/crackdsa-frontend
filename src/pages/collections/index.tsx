import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  Library,
  Plus,
  Trash2,
  Edit,
  Bookmark,
  FileText,
  Eye,
  ExternalLink,
  Circle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Award,
  ArrowLeft,
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

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
  status: string;
  interval: number;
}

export function CollectionsPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Core Data States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
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

  // Status Modal state (reused from explorer page)
  const [activeStatusProblemId, setActiveStatusProblemId] = useState<string | null>(null);

  // Load Database values
  const loadCollectionsData = async () => {
    try {
      const probRes = await api.get("/problems");
      const revRes = await api.get("/revisions");
      
      const rawCol = localStorage.getItem("mock_collections") || "[]";
      const rawSub = localStorage.getItem("mock_submissions") || "[]";
      const rawBookmarks = localStorage.getItem("crackdsa_bookmarks") || "[]";
      const rawNotes = localStorage.getItem("mock_notes") || "{}";

      setProblems(probRes.data);
      setCollections(JSON.parse(rawCol));
      setRevisions(revRes.data);
      setSubmissions(JSON.parse(rawSub));
      setBookmarks(JSON.parse(rawBookmarks));
      setNotes(JSON.parse(rawNotes));
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
    return submissions.some((s) => s.problemId === probId && s.status === "Correct");
  };



  // 1. Create Playlist Collection
  const handleCreateCollection = () => {
    if (!newColName.trim()) {
      addToast("Collection name is required.", "warning");
      return;
    }

    const newCol: Collection = {
      id: `col-${Math.random().toString(36).substring(2, 9)}`,
      name: newColName,
      description: newColDesc,
      problemIds: [],
      isPublic: newColPublic,
    };

    const updated = [...collections, newCol];
    setCollections(updated);
    localStorage.setItem("mock_collections", JSON.stringify(updated));

    addToast(`Playlist "${newColName}" created successfully!`, "success");
    setNewColName("");
    setNewColDesc("");
    setNewColPublic(false);
    setIsCreateOpen(false);
  };

  // 2. Rename Collection
  const handleRenameCollection = () => {
    if (!renameName.trim() || !activeCollectionId) return;

    const updated = collections.map((c) => {
      if (c.id === activeCollectionId) {
        return { ...c, name: renameName };
      }
      return c;
    });

    setCollections(updated);
    localStorage.setItem("mock_collections", JSON.stringify(updated));
    addToast("Collection renamed successfully.", "success");
    setIsRenameOpen(false);
  };

  // 3. Delete Collection
  const handleDeleteCollection = () => {
    if (!activeCollectionId) return;

    const updated = collections.filter((c) => c.id !== activeCollectionId);
    setCollections(updated);
    localStorage.setItem("mock_collections", JSON.stringify(updated));
    addToast("Collection deleted.", "info");
    setActiveCollectionId(null);
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
  const handleSaveProblemsToCollection = () => {
    if (!activeCollectionId) return;

    const updated = collections.map((c) => {
      if (c.id === activeCollectionId) {
        return { ...c, problemIds: tempCheckedIds };
      }
      return c;
    });

    setCollections(updated);
    localStorage.setItem("mock_collections", JSON.stringify(updated));
    addToast("Playlist questions updated.", "success");
    setIsAddProblemsOpen(false);
  };

  // Inline remove action
  const handleRemoveProblemFromCollection = (probId: string) => {
    if (!activeCollectionId || !activeCollection) return;

    const updatedIds = activeCollection.problemIds.filter((id) => id !== probId);
    const updated = collections.map((c) => {
      if (c.id === activeCollectionId) {
        return { ...c, problemIds: updatedIds };
      }
      return c;
    });

    setCollections(updated);
    localStorage.setItem("mock_collections", JSON.stringify(updated));
    addToast("Problem removed from this playlist.", "info");
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
  }, [activePlaylistProblems, submissions]);

  // Filtered problems list inside dialog
  const filteredProblemsForAdd = useMemo(() => {
    if (!addSearchQuery) return problems;
    const q = addSearchQuery.toLowerCase();
    return problems.filter(
      (p) => p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q)
    );
  }, [problems, addSearchQuery]);

  // Bookmark Toggle
  const handleBookmarkToggle = (probId: string) => {
    const bmarks = [...bookmarks];
    if (bmarks.includes(probId)) {
      const updated = bmarks.filter((id) => id !== probId);
      localStorage.setItem("crackdsa_bookmarks", JSON.stringify(updated));
      setBookmarks(updated);
      addToast("Bookmark removed.", "info");
    } else {
      const updated = [...bmarks, probId];
      localStorage.setItem("crackdsa_bookmarks", JSON.stringify(updated));
      setBookmarks(updated);
      addToast("Bookmark added.", "success");
    }
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
          icon: <Award className="size-4 text-purple-500 mx-auto" />
        };
      }
      if (revision.status === "todo") {
        const isDue = new Date(revision.nextReviewDate).getTime() <= Date.now();
        return isDue 
          ? {
              text: "Needs Revision",
              icon: <AlertCircle className="size-4 text-amber-500 mx-auto" />
            }
          : {
              text: "Revised Once",
              icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
            };
      }
      return {
        text: "Revised Once",
        icon: <RefreshCw className="size-4 text-blue-500 mx-auto" />
      };
    }

    if (correctSub.length > 0) {
      return {
        text: "Solved",
        icon: <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
      };
    }

    if (hasFailed) {
      return {
        text: "Attempted",
        icon: <AlertCircle className="size-4 text-amber-400 mx-auto" />
      };
    }

    return {
      text: "Not Started",
      icon: <Circle className="size-4 text-muted-foreground/60 mx-auto" />
    };
  };

  // Open Notes Dialog
  const handleOpenNoteModal = (probId: string) => {
    setActiveNoteProblemId(probId);
    const noteKey = `usr-2_${probId}`;
    setActiveNoteText(notes[noteKey] || "");
  };

  // Inline Note Editor Save
  const handleSaveNotes = async () => {
    if (!activeNoteProblemId) return;
    setSavingNote(true);
    try {
      await api.post(`/notes/${activeNoteProblemId}`, { note: activeNoteText });
      const rawNotes = JSON.parse(localStorage.getItem("mock_notes") || "{}");
      rawNotes[`usr-2_${activeNoteProblemId}`] = activeNoteText;
      localStorage.setItem("mock_notes", JSON.stringify(rawNotes));
      setNotes(rawNotes);
      addToast("Recall note saved successfully.", "success");
      setActiveNoteProblemId(null);
    } catch {
      addToast("Failed to save note.", "error");
    } finally {
      setSavingNote(false);
    }
  };

  // Inline Status Selector Save
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

      addToast("Problem status updated.", "success");
      setActiveStatusProblemId(null);
      loadCollectionsData();
    } catch {
      addToast("Failed to update status.", "error");
    }
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
                    <th className="px-4 py-3 text-center w-12">S</th>
                    <th className="px-4 py-3 w-16">ID</th>
                    <th className="px-4 py-3">Problem Title</th>
                    <th className="px-4 py-3 w-28">Difficulty</th>
                    <th className="px-4 py-3 w-32">Topic</th>
                    <th className="px-4 py-3 w-36">Next Revision</th>
                    <th className="px-4 py-3 text-center w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {activePlaylistProblems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
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
                      const isBookmarked = bookmarks.includes(prob.id);
                      const noteKey = `usr-2_${prob.id}`;
                      const hasNote = notes[noteKey] && notes[noteKey].trim().length > 0;

                      // Next review dates
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
                        <tr key={prob.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => {
                                setActiveStatusProblemId(prob.id);
                              }}
                              className="p-1 rounded hover:bg-muted cursor-pointer inline-flex items-center justify-center animate-none"
                            >
                              {stat.icon}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                            {prob.id}
                          </td>
                          <td className="px-4 py-3.5">
                            <a
                              href={`https://leetcode.com/problems/${prob.title.toLowerCase().replace(/ /g, "-")}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-foreground hover:underline inline-flex items-center gap-1"
                            >
                              {prob.title}
                              <ExternalLink className="size-3 text-muted-foreground inline" />
                            </a>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5", difficultyColors[prob.difficulty])}>
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-text-secondary font-medium">
                            {prob.topic}
                          </td>
                          <td className="px-4 py-3.5 text-xs">
                            <span className={cn(
                              "font-medium",
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
                                <Bookmark className={cn("size-4", isBookmarked ? "text-amber-500 fill-amber-500 border-amber-500" : "")} />
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
              Playlist Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Blind 75, Graph Master"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
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
              className="text-xs h-20"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="col_is_public"
              checked={newColPublic}
              onChange={(e) => setNewColPublic(e.target.checked)}
              className="size-3.5 accent-indigo-500 cursor-pointer"
            />
            <label htmlFor="col_is_public" className="text-xs text-muted-foreground cursor-pointer select-none">
              Make this playlist public (Future share link features)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} size="sm" className="text-xs cursor-pointer shadow-sm">
              Create Collection
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
              New Playlist Name:
            </label>
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRenameOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleRenameCollection} size="sm" className="text-xs cursor-pointer shadow-sm">
              Save Changes
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

      {/* 5. Status Changer Modal (Inline details) */}
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
