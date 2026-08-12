import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Plus,
  Edit2,
  Trash2,
  BarChart2,
  Clock,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react";

const difficultyBadge: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-500 border-red-500/20",
  Mixed: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export function AdminMockTestsPage() {
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  const fetchMockTests = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (difficultyFilter !== "all") params.difficulty = difficultyFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("/admin/mock-tests", { params });
      setMockTests(res.data.data);
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to load admin mock tests.", "error");
    } finally {
      setLoading(false);
    }
  }, [difficultyFilter, statusFilter, addToast]);

  useEffect(() => {
    fetchMockTests();
  }, [fetchMockTests]);

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await api.put(`/admin/mock-tests/${id}/publish`);
      addToast(`Mock test ${res.data.data.isPublished ? "published" : "unpublished"}.`, "success");
      setMockTests((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                isPublished: res.data.data.isPublished,
                status: res.data.data.status,
              }
            : t
        )
      );
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to update publish state.", "error");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to archive "${title}"?`)) return;
    try {
      await api.delete(`/admin/mock-tests/${id}`);
      addToast("Mock test archived successfully.", "success");
      fetchMockTests();
    } catch (err: any) {
      addToast(err?.response?.data?.message || "Failed to archive mock test.", "error");
    }
  };

  const filteredTests = mockTests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Typography variant="h2" className="font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="size-6 text-primary" />
            Mock Tests Management
          </Typography>
          <p className="text-sm text-muted-foreground mt-1">
            Create, configure, publish, and monitor timed mock assessments.
          </p>
        </div>

        <Button
          onClick={() => navigate("/admin/mock-tests/new")}
          className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> Create Mock Test
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mock tests by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            <span>Difficulty:</span>
          </div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Mixed">Mixed</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 rounded-xl border border-border bg-card animate-pulse space-y-4">
          <div className="h-6 w-1/4 rounded bg-muted/60" />
          <div className="h-48 rounded bg-muted/30" />
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-12 rounded-xl border border-border bg-card text-center space-y-3">
          <ClipboardCheck className="size-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No mock tests found matching your criteria.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/mock-tests/new")}
            className="text-xs cursor-pointer"
          >
            Create Your First Mock Test
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Title</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Difficulty</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Problems</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Duration</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Attempts</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Avg Score</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Published</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((test) => (
                  <tr key={test._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-foreground">{test.title}</p>
                        <div className="flex gap-1 mt-0.5">
                          {test.tags?.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.2 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          difficultyBadge[test.difficulty] || difficultyBadge.Mixed
                        }`}
                      >
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">
                      {test.problems?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {test.durationMinutes}m
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-foreground font-semibold">
                      {test.stats?.totalAttempts || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-emerald-500">
                        {test.stats?.avgScorePercent || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(test._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          test.isPublished
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {test.isPublished ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                        {test.isPublished ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/mock-tests/${test._id}/analytics`)}
                          title="View Analytics"
                          className="size-8 p-0 cursor-pointer text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10"
                        >
                          <BarChart2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/mock-tests/edit/${test._id}`)}
                          title="Edit Mock Test"
                          className="size-8 p-0 cursor-pointer"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(test._id, test.title)}
                          title="Archive Mock Test"
                          className="size-8 p-0 cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
