import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/loader";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";

import {
  Plus,
  Trash2,
  Edit,
  Copy,
  Database,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  topic: string;
  solvedCount?: number;
  description?: string;
  examples?: string;
  constraints?: string;
  boilerplate?: string;
  leetcodeUrl?: string;
  companies?: string[];
  status?: "active" | "inactive" | string;
  createdAt?: string;
  updatedAt?: string;
}

const AVAILABLE_TOPICS = [
  "Array",
  "HashMap",
  "Sliding Window",
  "Graph",
  "DP",
  "String",
  "Linked List",
  "Tree",
  "Binary Search",
  "Heap",
];


export function AdminProblemsPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Core Data States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  // Pagination Binds
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal Binds
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Editing Binds
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [formTopics, setFormTopics] = useState<string[]>([]);

  // Delete Bind
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Import State Binds
  const [csvPasteData, setCsvPasteData] = useState("");

  const loadAdminProblems = async () => {
    try {
      const res = await api.get("/problems?limit=1000");
      setProblems(res.data?.data?.problems || []);
    } catch {
      addToast("Failed to fetch admin problems database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminProblems();
  }, []);

  // Compute Statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const easy = problems.filter((p) => p.difficulty === "Easy").length;
    const medium = problems.filter((p) => p.difficulty === "Medium").length;
    const hard = problems.filter((p) => p.difficulty === "Hard").length;
    return { total, easy, medium, hard };
  }, [problems]);

  // Filtered List
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Search Binds (Match title)
      const q = searchQuery.toLowerCase();
      const matchSearch = p.title.toLowerCase().includes(q);

      // Difficulty Binds
      const matchDiff = filterDifficulty === "All" || p.difficulty === filterDifficulty;

      return matchSearch && matchDiff;
    });
  }, [problems, searchQuery, filterDifficulty]);

  // Paginated List
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, currentPage]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDifficulty]);

  // Copy Link action
  const handleCopyUrl = (url?: string) => {
    if (!url) {
      addToast("No URL defined for this problem.", "warning");
      return;
    }
    navigator.clipboard.writeText(url);
    addToast("Copied LeetCode URL to clipboard.", "success");
  };

  // Open creation modal
  const handleOpenAdd = () => {
    setEditingProblem(null);
    setFormId("");
    setFormTitle("");
    setFormUrl("");
    setFormDifficulty("Easy");
    setFormTopics([]);
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (prob: Problem) => {
    setEditingProblem(prob);
    setFormId(prob.id);
    setFormTitle(prob.title);
    setFormUrl(prob.leetcodeUrl || "");
    setFormDifficulty((prob.difficulty as "Easy" | "Medium" | "Hard") || "Easy");
    
    // Topics parse (comma split or array check)
    const topicArr = prob.topic.split(",").map((t) => t.trim()).filter(Boolean);
    setFormTopics(topicArr);
    setIsAddEditOpen(true);
  };

  // Toggle topics checkboxes
  const handleToggleTopic = (topic: string) => {
    if (formTopics.includes(topic)) {
      setFormTopics(formTopics.filter((t) => t !== topic));
    } else {
      setFormTopics([...formTopics, topic]);
    }
  };

  // Save / Submit problem edits
  const handleSaveProblem = async () => {
    if (!formId.trim()) {
      addToast("Problem ID (LeetCode ID) is required.", "warning");
      return;
    }
    if (!formTitle.trim()) {
      addToast("Problem Title is required.", "warning");
      return;
    }
    if (!formUrl.trim()) {
      addToast("LeetCode URL is required.", "warning");
      return;
    }
    if (formTopics.length === 0) {
      addToast("Please select at least one Topic tag.", "warning");
      return;
    }

    const payload = {
      id: formId,
      title: formTitle,
      difficulty: formDifficulty,
      topic: formTopics.join(", "),
      leetcodeUrl: formUrl,
    };

    try {
      if (editingProblem) {
        // Edit Action
        await api.put(`/problems/${editingProblem.id}`, payload);
        addToast(`Problem "${formTitle}" updated successfully.`, "success");
      } else {
        // Create Action
        await api.post("/problems", payload);
        addToast(`Problem "${formTitle}" catalogued successfully.`, "success");
      }
      setIsAddEditOpen(false);
      loadAdminProblems();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to write problem parameters.";
      addToast(errMsg, "error");
    }
  };

  // Open delete dialog modal
  const handleOpenDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/problems/${deleteTargetId}`);
      addToast("Problem removed from candidate lists.", "info");
      setIsDeleteOpen(false);
      setDeleteTargetId(null);
      loadAdminProblems();
    } catch {
      addToast("Failed to delete problem.", "error");
    }
  };

  // Handle CSV pastes file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvPasteData(text);
      addToast("CSV file read successful. Pastebox populated.", "info");
    };
    reader.readAsText(file);
  };

  // Bulk Import logic Binds
  const handleBulkImport = async () => {
    if (!csvPasteData.trim()) {
      addToast("Pastable CSV data is empty.", "warning");
      return;
    }

    try {
      const rows = csvPasteData.split("\n");
      let addedCount = 0;

      let maxId = 0;
      problems.forEach((p) => {
        const num = parseInt(p.id, 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      });

      for (let idx = 0; idx < rows.length; idx++) {
        const row = rows[idx];
        if (idx === 0 && (row.toLowerCase().includes("title") || row.toLowerCase().includes("id"))) continue;
        if (!row.trim()) continue;

        const cols = row.split(",");
        if (cols.length < 3) continue;

        let id = "";
        let title = "";
        let leetcodeUrl = "";
        let difficulty = "";
        let topics = "";

        if (cols.length >= 5) {
          id = cols[0]?.trim();
          title = cols[1]?.trim();
          leetcodeUrl = cols[2]?.trim();
          difficulty = cols[3]?.trim() || "Medium";
          topics = cols[4]?.replace(/;/g, ", ")?.trim() || "Array";
        } else {
          title = cols[0]?.trim();
          leetcodeUrl = cols[1]?.trim();
          difficulty = cols[2]?.trim() || "Medium";
          topics = cols[3]?.replace(/;/g, ", ")?.trim() || "Array";
          maxId++;
          id = String(maxId).padStart(3, "0");
        }

        const payload = {
          id,
          title,
          difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase(),
          topic: topics,
          leetcodeUrl,
        };

        await api.post("/problems", payload);
        addedCount++;
      }

      addToast(`Bulk imported ${addedCount} problems successfully.`, "success");
      setIsImportOpen(false);
      setCsvPasteData("");
      loadAdminProblems();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to parse and import CSV string formats.";
      addToast(errMsg, "error");
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20",
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto text-left animate-pulse">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border bg-card space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </div>

        {/* Search filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-9 flex-1" />
            <div className="flex gap-2 w-72">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="border border-border bg-card rounded-xl overflow-hidden h-96">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Typography variant="h1" className="font-semibold text-foreground">
            Problem Management CMS
          </Typography>
          <Typography variant="muted">
            Manage public challenge templates, tags, and connections.
          </Typography>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsImportOpen(true)}
            className="h-9 px-4 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted/50 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="size-3.5" /> Bulk Import
          </button>
          
          <Button
            onClick={handleOpenAdd}
            className="h-9 text-xs cursor-pointer shadow-sm flex items-center gap-1"
          >
            <Plus className="size-4" /> Add Problem
          </Button>
        </div>
      </div>

      {/* STATISTICS CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Total Problems</span>
          <span className="text-xl font-bold text-foreground">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Easy Problems</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.easy}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Medium Problems</span>
          <span className="text-xl font-bold text-amber-500">{stats.medium}</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm text-left">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Hard Problems</span>
          <span className="text-xl font-bold text-rose-500">{stats.hard}</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <SearchInput
            placeholder="Search Title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs h-9"
          />

          <div className="grid grid-cols-1 sm:flex gap-2 text-xs">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROBLEM DATA TABLE */}
      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-320px)] overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground select-none">
                <th className="px-4 py-3 bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Problem Name</th>
                <th className="px-4 py-3 w-28 text-center bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Practice</th>
                <th className="px-4 py-3 w-28 bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Difficulty</th>
                <th className="px-4 py-3 w-32 bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-left">Created At</th>
                <th className="px-4 py-3 text-center w-28 bg-muted/95 backdrop-blur-sm sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-2">
                      <Database className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="font-semibold text-foreground">No Problems Found</p>
                      <p className="text-xs">Configure filters or add new problems to seed this catalog.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((prob) => {
                  const createdDate = prob.createdAt ? new Date(prob.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Jul 12";

                  return (
                    <tr key={prob.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 text-left">
                        <span className="font-semibold text-foreground block">{prob.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">ID: {prob.id}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {prob.leetcodeUrl ? (
                          <a
                            href={prob.leetcodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex p-1.5 rounded-lg border border-border bg-background hover:bg-muted hover:scale-105 transition-all shadow-sm cursor-pointer justify-center items-center"
                            title="Open in LeetCode"
                          >
                            <img
                              src={leetcodeLogo}
                              alt="LeetCode"
                              className="size-6  object-contain"
                            />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-left">
                        <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5 border", difficultyColors[prob.difficulty])}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground text-left">
                        {createdDate}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          
                          <button
                            onClick={() => handleCopyUrl(prob.leetcodeUrl)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
                            title="Copy URL"
                          >
                            <Copy className="size-3.5" />
                          </button>


                          <button
                            onClick={() => handleOpenEdit(prob)}
                            className="p-1.5 rounded text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 cursor-pointer"
                            title="Edit Problem"
                          >
                            <Edit className="size-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(prob.id)}
                            className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Delete Problem"
                          >
                            <Trash2 className="size-3.5" />
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

      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <span>Showing page {currentPage} of {totalPages} ({filteredProblems.length} results)</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            <ChevronLeft className="size-3.5" /> Previous
          </button>
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-3 rounded-lg border border-border bg-background text-foreground hover:bg-muted/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ===================================================
          MODAL INTERFACES
          =================================================== */}

      {/* 1. Add / Edit Problem Form Dialog */}
      <Dialog
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingProblem ? "Edit DSA Problem Template" : "Catalogue New DSA Problem"}
        description="Configure difficulty scales, topic labels, and company tags for students."
      >
        <div className="space-y-4 text-left max-h-[500px] overflow-y-auto pr-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Problem ID (LeetCode ID): *
              </label>
              <input
                type="text"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="e.g. 001"
                disabled={!!editingProblem}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Problem Title: *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                LeetCode URL: *
              </label>
              <input
                type="text"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Difficulty:
              </label>
              <select
                value={formDifficulty}
                onChange={(e: any) => setFormDifficulty(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none w-full"
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>
          </div>

          {/* Topics selection multi-select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Topic Selection: *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-border p-3 rounded-lg bg-background/50">
              {AVAILABLE_TOPICS.map((topic) => {
                const isSelected = formTopics.includes(topic);
                return (
                  <div
                    key={topic}
                    onClick={() => handleToggleTopic(topic)}
                    className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground p-1 hover:bg-muted/30 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by click wrapper
                      className="size-3.5 accent-indigo-500 cursor-pointer"
                    />
                    <span>{topic}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsAddEditOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveProblem} size="sm" className="text-xs cursor-pointer shadow-sm">
              {editingProblem ? "Save Changes" : "Create Problem"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 2. Delete Problem Confirm Dialog */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Problem Deletion"
        description="This action cannot be undone. Are you sure you want to delete this template?"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-muted-foreground">
            Deleting this problem will hide it from the problems directory and cancel scheduled revision timelines.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              size="sm"
              className="text-xs bg-destructive text-white hover:bg-destructive-hover cursor-pointer"
            >
              Delete Problem
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 3. CSV Bulk Import Dialog */}
      <Dialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Bulk Import Problems via CSV"
        description="Select a .csv file or paste comma-separated problem specifications directly."
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Choose CSV File:
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Paste CSV Data:
            </label>
            <Textarea
              value={csvPasteData}
              onChange={(e) => setCsvPasteData(e.target.value)}
              placeholder="Title,URL,Difficulty,Topics,Companies&#10;Two Sum,https://leetcode.com/problems/two-sum,Easy,Array;HashMap,Amazon;Google&#10;LRU Cache,https://leetcode.com/problems/lru-cache,Medium,Design,Amazon"
              className="text-xs h-36 font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleBulkImport} size="sm" className="text-xs cursor-pointer shadow-sm">
              Import Problems
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
