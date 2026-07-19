import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, User, Compass } from "lucide-react";

interface Sheet {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  author: string;
  totalProblems: number;
  solvedProblems: number;
}

export function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const addToast = useNotificationStore((state: any) => state.addToast);
  const navigate = useNavigate();

  const loadSheets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sheets");
      setSheets(res.data.data);
    } catch {
      addToast("Failed to fetch DSA sheets list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheets();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="h-7 w-1/3 rounded bg-muted/60" />
          <div className="h-4 w-2/3 rounded bg-muted/40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Typography variant="h2" className="font-bold text-foreground flex items-center gap-2">
          <Compass className="size-6 text-primary" />
          DSA Sheets
        </Typography>
        <p className="text-sm text-muted-foreground mt-1">
          Pick a curated DSA sheet to systematically master algorithms and pass coding interviews.
        </p>
      </div>

      {/* Grid */}
      {sheets.length === 0 ? (
        <div className="p-12 rounded-xl border border-border bg-card/50 text-center">
          <BookOpen className="size-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No DSA sheets available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sheets.map((sheet) => {
            const pct = sheet.totalProblems > 0 
              ? Math.round((sheet.solvedProblems / sheet.totalProblems) * 100)
              : 0;

            return (
              <div 
                key={sheet.id}
                className="group relative rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {sheet.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3.5" />
                        By {sheet.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {sheet.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {sheet.description}
                  </p>
                </div>

                <div className="space-y-4 pt-6 mt-6 border-t border-border/50">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-foreground">
                        {sheet.solvedProblems}/{sheet.totalProblems} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate(`/sheets/${sheet.id}`)}
                    className="w-full text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Practice Problems
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
