import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
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

const AVAILABLE_COMPANIES = [
  "Amazon",
  "Google",
  "Meta",
  "Microsoft",
  "Netflix",
  "Adobe",
];

export function AdminProblemsPage() {
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Core Data States
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterTopic, setFilterTopic] = useState("All");
  const [filterCompany, setFilterCompany] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination Binds
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal Binds
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Editing Binds
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [formTopics, setFormTopics] = useState<string[]>([]);
  const [formCompanies, setFormCompanies] = useState<string[]>([]);
  const [formDesc, setFormDesc] = useState("");
  const [formExamples, setFormExamples] = useState("");
  const [formConstraints, setFormConstraints] = useState("");
  const [formBoilerplate, setFormBoilerplate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Bind
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Import State Binds
  const [csvPasteData, setCsvPasteData] = useState("");

  const loadAdminProblems = async () => {
    try {
      const res = await api.get("/problems");
      setProblems(res.data);
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
      // Search Binds
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        (p.companies && p.companies.some((c) => c.toLowerCase().includes(q)));

      // Difficulty Binds
      const matchDiff = filterDifficulty === "All" || p.difficulty === filterDifficulty;

      // Topic Binds
      const matchTopic =
        filterTopic === "All" ||
        p.topic.toLowerCase().includes(filterTopic.toLowerCase());

      // Company Binds
      const matchCompany =
        filterCompany === "All" ||
        (p.companies && p.companies.some((c) => c.toLowerCase() === filterCompany.toLowerCase()));

      // Status Binds
      const isActive = p.status !== "inactive";
      const matchStatus =
        filterStatus === "All" ||
        (filterStatus === "active" && isActive) ||
        (filterStatus === "inactive" && !isActive);

      return matchSearch && matchDiff && matchTopic && matchCompany && matchStatus;
    });
  }, [problems, searchQuery, filterDifficulty, filterTopic, filterCompany, filterStatus]);

  // Paginated List
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProblems.slice(start, start + itemsPerPage);
  }, [filteredProblems, currentPage]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDifficulty, filterTopic, filterCompany, filterStatus]);

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
    setFormTitle("");
    setFormUrl("");
    setFormDifficulty("Easy");
    setFormTopics([]);
    setFormCompanies([]);
    setFormDesc("");
    setFormExamples("");
    setFormConstraints("");
    setFormBoilerplate("");
    setFormIsActive(true);
    setIsAddEditOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (prob: Problem) => {
    setEditingProblem(prob);
    setFormTitle(prob.title);
    setFormUrl(prob.leetcodeUrl || "");
    setFormDifficulty((prob.difficulty as "Easy" | "Medium" | "Hard") || "Easy");
    
    // Topics parse (comma split or array check)
    const topicArr = prob.topic.split(",").map((t) => t.trim());
    setFormTopics(topicArr);
    
    setFormCompanies(prob.companies || []);
    setFormDesc(prob.description || "");
    setFormExamples(prob.examples || "");
    setFormConstraints(prob.constraints || "");
    setFormBoilerplate(prob.boilerplate || "");
    setFormIsActive(prob.status !== "inactive");
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

  // Toggle companies checkboxes
  const handleToggleCompany = (company: string) => {
    if (formCompanies.includes(company)) {
      setFormCompanies(formCompanies.filter((c) => c !== company));
    } else {
      setFormCompanies([...formCompanies, company]);
    }
  };

  // Save / Submit problem edits
  const handleSaveProblem = async () => {
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

    const payload: Partial<Problem> = {
      title: formTitle,
      difficulty: formDifficulty,
      topic: formTopics.join(", "),
      description: formDesc || `Given a set parameters, write an optimized algorithms loop.`,
      examples: formExamples || "Input: nums = [1]\nOutput: 1",
      constraints: formConstraints || "- 1 <= nums.length <= 10^5",
      boilerplate: formBoilerplate || "public void solve() {\n    // write code...\n}",
      leetcodeUrl: formUrl,
      companies: formCompanies,
      status: formIsActive ? "active" : "inactive",
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingProblem) {
        // Edit Action
        await api.put(`/problems/${editingProblem.id}`, payload);
        addToast(`Problem "${formTitle}" updated successfully.`, "success");
      } else {
        // Create Action
        payload.createdAt = new Date().toISOString();
        await api.post("/problems", payload);
        addToast(`Problem "${formTitle}" catalogued successfully.`, "success");
      }
      setIsAddEditOpen(false);
      loadAdminProblems();
    } catch {
      addToast("Failed to write problem parameters.", "error");
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
  const handleBulkImport = () => {
    if (!csvPasteData.trim()) {
      addToast("Pastable CSV data is empty.", "warning");
      return;
    }

    try {
      const rows = csvPasteData.split("\n");
      const currentDB = JSON.parse(localStorage.getItem("mock_problems") || "[]");
      let addedCount = 0;

      rows.forEach((row, idx) => {
        // Skip header or empty rows
        if (idx === 0 && row.toLowerCase().includes("title")) return;
        if (!row.trim()) return;

        const cols = row.split(",");
        if (cols.length < 3) return;

        const title = cols[0]?.trim();
        const leetcodeUrl = cols[1]?.trim();
        const difficulty = cols[2]?.trim() || "Medium";
        const topics = cols[3]?.replace(/;/g, ", ")?.trim() || "Array";
        const companies = cols[4]?.split(";")?.map((c) => c.trim())?.filter(Boolean) || [];

        const nextId = String(currentDB.length + 1).padStart(3, "0");
        const newProblem = {
          id: nextId,
          title,
          leetcodeUrl,
          difficulty,
          topic: topics,
          companies,
          description: "Given parameters, code an optimized algorithms loop.",
          examples: "Input: nums = [1]\nOutput: 1",
          constraints: "- 1 <= nums.length <= 100",
          boilerplate: "public void solve() {}",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          solvedCount: 0,
        };

        currentDB.push(newProblem);
        addedCount++;
      });

      localStorage.setItem("mock_problems", JSON.stringify(currentDB));
      addToast(`Bulk imported ${addedCount} problems successfully.`, "success");
      setIsImportOpen(false);
      setCsvPasteData("");
      loadAdminProblems();
    } catch {
      addToast("Failed to parse CSV string formats. Verify comma dividers.", "error");
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/20",
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground text-xs font-semibold">Loading problems repository database...</div>;
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
            placeholder="Search Title, Topic, or Company tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs h-9"
          />

          <div className="grid grid-cols-2 sm:flex gap-2 text-xs">
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

            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none"
            >
              <option value="All">All Topics</option>
              {AVAILABLE_TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none"
            >
              <option value="All">All Companies</option>
              {AVAILABLE_COMPANIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium select-none"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROBLEM DATA TABLE */}
      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground select-none">
                <th className="px-4 py-3 w-12 text-center">Status</th>
                <th className="px-4 py-3">Problem Name</th>
                <th className="px-4 py-3 w-28">Difficulty</th>
                <th className="px-4 py-3 w-36">Topics</th>
                <th className="px-4 py-3 w-36">Companies</th>
                <th className="px-4 py-3 w-24 text-center">Outlink</th>
                <th className="px-4 py-3 w-32">Created At</th>
                <th className="px-4 py-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {paginatedProblems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-2">
                      <Database className="size-8 text-muted-foreground/60 mx-auto" />
                      <p className="font-semibold text-foreground">No Problems Found</p>
                      <p className="text-xs">Configure filters or add new problems to seed this catalog.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProblems.map((prob) => {
                  const isActive = prob.status !== "inactive";
                  const createdDate = prob.createdAt ? new Date(prob.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Jul 12";

                  return (
                    <tr key={prob.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 text-center" title={isActive ? "Active" : "Inactive"}>
                        {isActive ? (
                          <CheckCircle2 className="size-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="size-4 text-rose-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-foreground block">{prob.title}</span>
                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">ID: {prob.id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5", difficultyColors[prob.difficulty])}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium max-w-[150px] truncate" title={prob.topic}>
                        {prob.topic}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {prob.companies && prob.companies.length > 0 ? (
                            prob.companies.map((c) => (
                              <span key={c} className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs font-medium">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {prob.leetcodeUrl ? (
                          <a
                            href={prob.leetcodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-muted-foreground hover:bg-muted inline-flex items-center"
                            title="Open in LeetCode"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
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

          {/* Companies selection multi-select */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Company Tags:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-border p-3 rounded-lg bg-background/50">
              {AVAILABLE_COMPANIES.map((comp) => {
                const isSelected = formCompanies.includes(comp);
                return (
                  <div
                    key={comp}
                    onClick={() => handleToggleCompany(comp)}
                    className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground p-1 hover:bg-muted/30 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by click wrapper
                      className="size-3.5 accent-indigo-500 cursor-pointer"
                    />
                    <span>{comp}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Boilerplate Code (Optional):
            </label>
            <Textarea
              value={formBoilerplate}
              onChange={(e) => setFormBoilerplate(e.target.value)}
              className="text-xs h-24 font-mono font-medium"
              placeholder="e.g. public void solve() {}"
            />
          </div>

          {/* Status Checkbox Binds */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="form_status_active"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="size-4 accent-indigo-500 cursor-pointer"
            />
            <label htmlFor="form_status_active" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Publish Status: Active (Checked makes this problem visible to students)
            </label>
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
