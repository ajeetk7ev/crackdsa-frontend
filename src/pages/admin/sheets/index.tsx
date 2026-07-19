import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Sheet {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  author: string;
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
      const res = await api.get("/sheets");
      setSheets(res.data.data);
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
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="h-7 w-1/3 rounded bg-muted/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="font-bold text-foreground">
            Manage DSA Sheets
          </Typography>
          <p className="text-xs text-muted-foreground mt-1">
            Create, update, and manage the curated sheets and their problems.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/admin/sheets/new")}
          className="text-xs font-semibold flex items-center gap-1 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-3.5" /> Create Sheet
        </Button>
      </div>

      {sheets.length === 0 ? (
        <div className="p-12 border border-border rounded-xl bg-card text-center">
          <BookOpen className="size-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No sheets created yet. Click "Create Sheet" to start.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground">
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Author</th>
                <th className="py-3 px-4 text-left">Estimated Time</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sheets.map((sheet) => (
                <tr key={sheet.id} className="hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground text-sm">{sheet.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sheet.author}</td>
                  <td className="py-3 px-4 text-muted-foreground">{sheet.estimatedTime}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/sheets/edit/${sheet.id}`)}
                        className="p-1.5 h-8 w-8 cursor-pointer"
                        title="Edit Sheet"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteSheetId(sheet.id)}
                        className="p-1.5 h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete Sheet"
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
      )}

      <ConfirmDialog
        isOpen={deleteSheetId !== null}
        onClose={() => setDeleteSheetId(null)}
        onConfirm={handleDelete}
        title="Delete DSA Sheet"
        description="Are you sure you want to delete this sheet? Associated problems will remain intact but will be detached from this sheet."
        isLoading={deleting}
      />
    </div>
  );
}
