import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  CheckCircle2,
  ExternalLink,
  Target,
} from "lucide-react";

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
};

interface SelectedProblem {
  problemId: string;
  problemDoc: any;
  order: number;
  points: number;
}

export function AdminMockTestFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [tagsInput, setTagsInput] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Problem Selection
  const [allProblems, setAllProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([]);
  const [searchProblemQuery, setSearchProblemQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all problems for picker
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const res = await api.get("/problems?limit=1000");
        setAllProblems(res.data.data.problems || []);
      } catch (err: any) {
        addToast(err?.response?.data?.message || "Failed to load problems library.", "error");
      }
    };
    loadProblems();
  }, [addToast]);

  // Load existing test if edit mode
  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    const loadTest = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/mock-tests/${id}`);
        const test = res.data.data;
        setTitle(test.title || "");
        setDescription(test.description || "");
        setDifficulty(test.difficulty || "Mixed");
        setDurationMinutes(test.durationMinutes || 45);
        setTagsInput(test.tags?.join(", ") || "");
        setIsPublished(test.isPublished ?? true);

        const loadedSelected: SelectedProblem[] = (test.problems || []).map((p: any, idx: number) => ({
          problemId: (p.problem?._id || p.problem).toString(),
          problemDoc: p.problem,
          order: p.order || idx + 1,
          points: p.points || 100,
        }));
        setSelectedProblems(loadedSelected);
      } catch (err: any) {
        addToast(err?.response?.data?.message || "Failed to load mock test for editing.", "error");
        navigate("/admin/mock-tests");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id, isEdit, navigate, addToast]);

  const handleAddProblem = (problem: any) => {
    if (selectedProblems.some((sp) => sp.problemId === problem._id)) {
      addToast("Problem is already added to this mock test.", "info");
      return;
    }

    const defaultPoints =
      problem.difficulty === "Easy" ? 100 : problem.difficulty === "Medium" ? 150 : 200;

    setSelectedProblems((prev) => [
      ...prev,
      {
        problemId: problem._id,
        problemDoc: problem,
        order: prev.length + 1,
        points: defaultPoints,
      },
    ]);
  };

  const handleRemoveProblem = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev
        .filter((sp) => sp.problemId !== problemId)
        .map((sp, idx) => ({ ...sp, order: idx + 1 }))
    );
  };

  const handleMoveProblem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedProblems.length) return;

    const list = [...selectedProblems];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setSelectedProblems(list.map((sp, idx) => ({ ...sp, order: idx + 1 })));
  };

  const handlePointsChange = (problemId: string, points: number) => {
    setSelectedProblems((prev) =>
      prev.map((sp) => (sp.problemId === problemId ? { ...sp, points } : sp))
    );
  };

  const totalPoints = selectedProblems.reduce((sum, sp) => sum + (sp.points || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast("Please enter a title for the mock test.", "error");
      return;
    }

    if (selectedProblems.length < 2) {
      addToast("A mock test must contain at least 2 problems.", "error");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      durationMinutes: Number(durationMinutes),
      tags,
      isPublished,
      problems: selectedProblems.map((sp, idx) => ({
        problem: sp.problemId,
        order: idx + 1,
        points: Number(sp.points) || 100,
      })),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/admin/mock-tests/${id}`, payload);
        addToast("Mock test updated successfully!", "success");
      } else {
        await api.post("/admin/mock-tests", payload);
        addToast("Mock test created successfully!", "success");
      }
      navigate("/admin/mock-tests");
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to save mock test.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const availableFilteredProblems = allProblems
    .filter((p) => {
      const q = searchProblemQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.topic?.toLowerCase().includes(q) ||
        p.difficulty?.toLowerCase().includes(q)
      );
    })
    .filter((p) => !selectedProblems.some((sp) => sp.problemId === p._id))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="p-8 rounded-xl border border-border bg-card h-48" />
        <div className="p-8 rounded-xl border border-border bg-card h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/mock-tests")}
            className="flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Button>
          <div>
            <Typography variant="h2" className="font-bold text-foreground text-xl">
              {isEdit ? "Edit Mock Test" : "Create New Mock Test"}
            </Typography>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set title, timing, and select 2 to 10 LeetCode problems.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Configuration */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
            1. Test Details & Settings
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">Test Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dynamic Programming Sprint #1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                placeholder="Brief summary of topics or patterns covered in this test..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Overall Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Duration (Minutes) *</label>
              <input
                type="number"
                min={5}
                max={180}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="dp, array, google, binary-search"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="size-4 rounded border-border text-primary cursor-pointer"
              />
              <label htmlFor="isPublished" className="text-xs font-medium text-foreground cursor-pointer">
                Publish immediately (make visible to all candidates)
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Problem Selection */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-bold text-foreground">
              2. Selected Problems ({selectedProblems.length})
            </h3>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
              <Target className="size-3.5" /> Total: {totalPoints} pts
            </span>
          </div>

          {/* Selected problem list */}
          {selectedProblems.length === 0 ? (
            <div className="p-6 border border-dashed border-border rounded-xl text-center">
              <p className="text-xs text-muted-foreground">
                No problems selected yet. Use the search box below to add 2 to 10 problems.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedProblems.map((sp, idx) => {
                const doc = sp.problemDoc || {};
                return (
                  <div
                    key={sp.problemId}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-6 rounded bg-muted/60 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">
                        {doc.title || "Problem"}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                          difficultyBadge[doc.difficulty] || difficultyBadge.Medium
                        }`}
                      >
                        {doc.difficulty}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                        {doc.topic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={10}
                          max={500}
                          value={sp.points}
                          onChange={(e) => handlePointsChange(sp.problemId, Number(e.target.value))}
                          className="w-16 h-7 px-1.5 rounded border border-border bg-background text-xs text-center font-mono"
                          title="Point value"
                        />
                        <span className="text-[10px] text-muted-foreground">pts</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveProblem(idx, "up")}
                          className="size-7 rounded hover:bg-muted flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === selectedProblems.length - 1}
                          onClick={() => handleMoveProblem(idx, "down")}
                          className="size-7 rounded hover:bg-muted flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveProblem(sp.problemId)}
                        className="size-7 rounded hover:bg-rose-500/10 text-rose-500 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Problem Search & Picker */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="text-xs font-semibold text-foreground block">
              Search & Add Problems
            </label>
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by problem title, topic, or difficulty..."
                value={searchProblemQuery}
                onChange={(e) => setSearchProblemQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {searchProblemQuery && (
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-card divide-y divide-border/60">
                {availableFilteredProblems.length === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground text-center">
                    No matching problems found.
                  </p>
                ) : (
                  availableFilteredProblems.map((prob) => (
                    <div
                      key={prob._id}
                      className="flex items-center justify-between p-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium text-foreground truncate">
                          {prob.title}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            difficultyBadge[prob.difficulty] || difficultyBadge.Medium
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {prob.topic}
                        </span>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddProblem(prob)}
                        className="h-7 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3" /> Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/mock-tests")}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="size-4" />
            {submitting ? "Saving..." : isEdit ? "Update Mock Test" : "Create Mock Test"}
          </Button>
        </div>
      </form>
    </div>
  );
}
