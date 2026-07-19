import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Save, Eye } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  leetcodeUrl: string;
  companies: string[];
}

export function AdminSheetsFormPage() {
  const { id: sheetId } = useParams();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  const isEdit = !!sheetId;
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Sheet Form State
  const [sheetForm, setSheetForm] = useState({
    title: "",
    description: "",
    estimatedTime: "",
    author: ""
  });

  // Step 2: Problems State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemsPage, setProblemsPage] = useState(1);
  const [problemsTotalPages, setProblemsTotalPages] = useState(1);
  const [problemsLoading, setProblemsLoading] = useState(false);

  // Add/Edit Problem Modal State
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [problemForm, setProblemForm] = useState({
    id: "",
    title: "",
    difficulty: "Easy",
    topic: "",
    leetcodeUrl: "",
    companies: ""
  });
  const [savingProblem, setSavingProblem] = useState(false);
  const [deleteProblemId, setDeleteProblemId] = useState<string | null>(null);
  const [deletingProblem, setDeletingProblem] = useState(false);

  // Fetch sheet metadata
  useEffect(() => {
    if (isEdit && sheetId) {
      const fetchSheet = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/sheets/${sheetId}`);
          const { title, description, estimatedTime, author } = res.data.data;
          setSheetForm({ title, description, estimatedTime, author });
        } catch {
          addToast("Failed to load sheet metadata.", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchSheet();
    }
  }, [sheetId, isEdit]);

  // Fetch sheet problems
  const fetchProblems = async (page: number) => {
    if (!sheetId) return;
    try {
      setProblemsLoading(true);
      const res = await api.get(`/sheets/${sheetId}/problems`, {
        params: { page, limit: 5 }
      });
      setProblems(res.data.data.problems);
      setProblemsTotalPages(res.data.data.pagination.totalPages);
    } catch {
      addToast("Failed to fetch sheet problems.", "error");
    } finally {
      setProblemsLoading(false);
    }
  };

  useEffect(() => {
    if (sheetId && activeStep === 2) {
      fetchProblems(problemsPage);
    }
  }, [sheetId, activeStep, problemsPage]);

  // Step 1 Submit
  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/sheets/${sheetId}`, sheetForm);
        addToast("Sheet updated successfully.", "success");
        setActiveStep(2);
      } else {
        const res = await api.post("/sheets", sheetForm);
        addToast("Sheet created successfully. Now add problems.", "success");
        navigate(`/admin/sheets/edit/${res.data.data.id}`);
        setActiveStep(2);
      }
    } catch {
      addToast("Failed to save DSA Sheet metadata.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open problem modal
  const handleOpenProblemModal = (prob: Problem | null = null) => {
    if (prob) {
      setEditingProblem(prob);
      setProblemForm({
        id: prob.id,
        title: prob.title,
        difficulty: prob.difficulty,
        topic: prob.topic,
        leetcodeUrl: prob.leetcodeUrl,
        companies: prob.companies.join(", ")
      });
    } else {
      setEditingProblem(null);
      setProblemForm({
        id: "",
        title: "",
        difficulty: "Easy",
        topic: "",
        leetcodeUrl: "",
        companies: ""
      });
    }
    setProblemModalOpen(true);
  };

  // Create/Update problem
  const handleProblemSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetId) return;

    setSavingProblem(true);
    const comps = problemForm.companies
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const payload = {
      id: problemForm.id,
      title: problemForm.title,
      difficulty: problemForm.difficulty,
      topic: problemForm.topic,
      leetcodeUrl: problemForm.leetcodeUrl,
      companies: comps,
      sheet: sheetId
    };

    try {
      if (editingProblem) {
        await api.put(`/problems/${editingProblem.id}`, payload);
        addToast("Problem updated successfully.", "success");
      } else {
        await api.post("/problems", payload);
        addToast("Problem added to sheet successfully.", "success");
      }
      setProblemModalOpen(false);
      fetchProblems(problemsPage);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to save problem.";
      addToast(msg, "error");
    } finally {
      setSavingProblem(false);
    }
  };

  // Delete problem
  const handleProblemDelete = async () => {
    if (!deleteProblemId) return;
    setDeletingProblem(true);
    try {
      await api.delete(`/problems/${deleteProblemId}`);
      addToast("Problem deleted successfully.", "success");
      setDeleteProblemId(null);
      fetchProblems(problemsPage);
    } catch {
      addToast("Failed to delete problem.", "error");
    } finally {
      setDeletingProblem(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      <div className="flex items-center gap-2">
        <Link to="/admin/sheets" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
          <ChevronLeft className="size-3" /> Back to DSA Sheets
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <Typography variant="h2" className="font-bold text-foreground">
          {isEdit ? "Edit DSA Sheet" : "Create New DSA Sheet"}
        </Typography>
      </div>

      {/* Steps indicator bar */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveStep(1)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            activeStep === 1
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
          }`}
        >
          1. Sheet Metadata
        </button>
        <ChevronRight className="size-4 text-muted-foreground/60" />
        <button
          onClick={() => {
            if (isEdit) setActiveStep(2);
            else addToast("Save sheet details first to unlock step 2.", "warning");
          }}
          disabled={!isEdit}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            activeStep === 2
              ? "bg-primary border-primary text-primary-foreground"
              : isEdit
              ? "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
              : "bg-muted/10 border-border/40 text-muted-foreground/40 cursor-not-allowed"
          }`}
        >
          2. Sheet Problems
        </button>
      </div>

      {/* Step 1 Content: Sheet Form */}
      {activeStep === 1 && (
        <form onSubmit={handleSheetSubmit} className="space-y-4 bg-card border border-border rounded-xl p-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Sheet Title</label>
            <Input
              required
              placeholder="e.g. Striver SDE Sheet"
              value={sheetForm.title}
              onChange={e => setSheetForm({ ...sheetForm, title: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Author</label>
            <Input
              required
              placeholder="e.g. Striver"
              value={sheetForm.author}
              onChange={e => setSheetForm({ ...sheetForm, author: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Estimated Time (e.g. 60 days, 3 months)</label>
            <Input
              required
              placeholder="e.g. 60 days"
              value={sheetForm.estimatedTime}
              onChange={e => setSheetForm({ ...sheetForm, estimatedTime: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <Textarea
              required
              placeholder="Provide a detailed description of this sheet..."
              value={sheetForm.description}
              onChange={e => setSheetForm({ ...sheetForm, description: e.target.value })}
              className="text-xs h-24"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border/50">
            <Button
              type="submit"
              disabled={loading}
              className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-3.5" /> {isEdit ? "Update and Continue" : "Save and Continue"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 2 Content: Problems Manager */}
      {activeStep === 2 && isEdit && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Typography variant="subtitle" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Problems in this sheet
            </Typography>
            <Button
              size="sm"
              onClick={() => handleOpenProblemModal()}
              className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" /> Add Problem
            </Button>
          </div>

          {problemsLoading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">Loading problems...</div>
          ) : problems.length === 0 ? (
            <div className="p-12 border border-border rounded-xl bg-card text-center text-xs text-muted-foreground">
              No problems added to this sheet yet. Click "Add Problem" to populate.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                    <th className="py-2.5 px-4 text-left w-16">ID</th>
                    <th className="py-2.5 px-4 text-left">Title</th>
                    <th className="py-2.5 px-4 text-left w-24">Difficulty</th>
                    <th className="py-2.5 px-4 text-left">Company Tags</th>
                    <th className="py-2.5 px-4 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {problems.map(prob => (
                    <tr key={prob.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-muted-foreground">{prob.id}</td>
                      <td className="py-2.5 px-4 font-semibold text-foreground">{prob.title}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          prob.difficulty === "Easy" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        } ${
                          prob.difficulty === "Medium" && "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        } ${
                          prob.difficulty === "Hard" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{prob.companies.join(", ")}</td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenProblemModal(prob)}
                            className="p-1 h-7 w-7 cursor-pointer"
                          >
                            <Edit2 className="size-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteProblemId(prob.id)}
                            className="p-1 h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Problems Pagination */}
              {problemsTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10">
                  <span className="text-[11px] text-muted-foreground">
                    Page {problemsPage} of {problemsTotalPages}
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={problemsPage <= 1}
                      onClick={() => setProblemsPage(problemsPage - 1)}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="size-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={problemsPage >= problemsTotalPages}
                      onClick={() => setProblemsPage(problemsPage + 1)}
                      className="cursor-pointer"
                    >
                      <ChevronRight className="size-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Problem Modal */}
      <ConfirmDialog
        isOpen={problemModalOpen}
        onClose={() => setProblemModalOpen(false)}
        onConfirm={() => {}} // Form handles submit
        title={editingProblem ? "Edit Problem" : "Add Problem to Sheet"}
        description=""
      >
        <form onSubmit={handleProblemSave} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Problem ID</label>
              <Input
                required
                disabled={!!editingProblem}
                placeholder="e.g. 001 or 104"
                value={problemForm.id}
                onChange={e => setProblemForm({ ...problemForm, id: e.target.value })}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Topic / Category</label>
              <Input
                required
                placeholder="e.g. Array, Dynamic Programming"
                value={problemForm.topic}
                onChange={e => setProblemForm({ ...problemForm, topic: e.target.value })}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Title</label>
            <Input
              required
              placeholder="e.g. Two Sum"
              value={problemForm.title}
              onChange={e => setProblemForm({ ...problemForm, title: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Difficulty</label>
              <Select
                value={problemForm.difficulty}
                onChange={val => setProblemForm({ ...problemForm, difficulty: val })}
                options={[
                  { label: "Easy", value: "Easy" },
                  { label: "Medium", value: "Medium" },
                  { label: "Hard", value: "Hard" }
                ]}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">LeetCode URL</label>
              <Input
                required
                placeholder="https://leetcode.com/problems/..."
                value={problemForm.leetcodeUrl}
                onChange={e => setProblemForm({ ...problemForm, leetcodeUrl: e.target.value })}
                className="text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Company Tags (Comma separated)</label>
            <Input
              placeholder="e.g. Google, Microsoft, Meta"
              value={problemForm.companies}
              onChange={e => setProblemForm({ ...problemForm, companies: e.target.value })}
              className="text-xs h-9"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProblemModalOpen(false)}
              disabled={savingProblem}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={savingProblem}
              className="text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingProblem ? "Saving..." : "Save Problem"}
            </Button>
          </div>
        </form>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={deleteProblemId !== null}
        onClose={() => setDeleteProblemId(null)}
        onConfirm={handleProblemDelete}
        title="Delete Problem"
        description="Are you sure you want to delete this problem from the database?"
        isLoading={deletingProblem}
      />
    </div>
  );
}
