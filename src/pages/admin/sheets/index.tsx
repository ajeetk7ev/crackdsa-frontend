import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, BookOpen, Clock, User, Layers } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Sheet {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  author: string;
  totalProblems?: number;
}

export function AdminSheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSheetId, setDeleteSheetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);
  const navigate = useNavigate();

  const loadSheets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sheets", { params: { limit: 100 } });
      const sheetsData = Array.isArray(res.data.data) ? res.data.data : (res.data.data?.sheets || []);
      setSheets(sheetsData);
    } catch {
      addToast("Failed to fetch DSA sheets list for admin.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheets();
  }, []);

  const handleDelete = async () => {
    if (!deleteSheetId) return;
    setDeleting(true);
    try {
      await api.delete(`/sheets/${deleteSheetId}`);
      addToast("DSA Sheet deleted successfully.", "success");
      setDeleteSheetId(null);
      loadSheets();
    } catch {
      addToast("Failed to delete DSA Sheet.", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse text-left">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded bg-muted/60" />
          <div className="h-9 w-32 rounded bg-muted/60" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-xl border border-border bg-card p-5 space-y-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Typography variant="h1" className="font-bold text-foreground">
            Manage DSA Sheets
          </Typography>
          <Typography variant="muted" className="text-xs mt-1">
            Curate coding roadmap sheets, attach problems, and monitor overall sheet structures.
          </Typography>
        </div>
        <Button 
          onClick={() => navigate("/admin/sheets/new")}
          className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Plus className="size-4" /> Create Sheet
        </Button>
      </div>

      {/* Sheets Card Grid View */}
      {sheets.length === 0 ? (
        <div className="p-12 border border-border rounded-xl bg-card text-center space-y-3">
          <BookOpen className="size-12 text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-semibold text-foreground">No DSA Sheets Available</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Get started by creating your first DSA sheet metadata and attaching problems.
          </p>
          <Button 
            onClick={() => navigate("/admin/sheets/new")}
            size="sm"
            className="text-xs cursor-pointer mt-2"
          >
            <Plus className="size-3.5 mr-1" /> Create Sheet Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sheets.map((sheet) => (
            <div 
              key={sheet.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <BookOpen className="size-4" />
                    </div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {sheet.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {sheet.description || "No description provided for this sheet."}
                </p>

                {/* Metadata Badges Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
                  {/* Author */}
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/40">
                    <User className="size-3 text-indigo-500 shrink-0" />
                    <span className="truncate font-medium">{sheet.author || "Admin"}</span>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/40">
                    <Clock className="size-3 text-amber-500 shrink-0" />
                    <span className="truncate font-medium">{sheet.estimatedTime || "N/A"}</span>
                  </div>

                  {/* Total Attached Problems */}
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/40">
                    <Layers className="size-3 text-emerald-500 shrink-0" />
                    <span className="truncate font-semibold text-foreground">
                      {sheet.totalProblems ?? 0} {sheet.totalProblems === 1 ? "Prob" : "Probs"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/sheets/edit/${sheet.id}`)}
                  className="text-xs h-8 px-3 cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="size-3.5" /> Edit Sheet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteSheetId(sheet.id)}
                  className="text-xs h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer border-rose-500/20"
                  title="Delete Sheet"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteSheetId !== null}
        onClose={() => setDeleteSheetId(null)}
        onConfirm={handleDelete}
        title="Delete DSA Sheet"
        description="Are you sure you want to delete this sheet? Associated problems will remain intact in the repository."
        isLoading={deleting}
      />
    </div>
  );
}

