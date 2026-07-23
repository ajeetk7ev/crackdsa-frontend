import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  User,
  Compass,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  Zap,
  Grid,
  GitMerge
} from "lucide-react";

interface Sheet {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  author: string;
  totalProblems: number;
  solvedProblems: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function SheetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  // URL state params
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "9", 10);
  const searchQuery = searchParams.get("search") || "";

  // Local state
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search query update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== (searchParams.get("search") || "")) {
        const newParams = new URLSearchParams(searchParams);
        if (localSearch) {
          newParams.set("search", localSearch);
        } else {
          newParams.delete("search");
        }
        newParams.delete("page");
        setSearchParams(newParams);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "1") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key !== "page") {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const loadSheets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sheets", {
        params: {
          page: currentPage,
          limit: pageSize,
          search: searchQuery
        }
      });

      const data = res.data.data;
      if (data && data.sheets) {
        setSheets(data.sheets);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setSheets(data);
        setPagination({
          total: data.length,
          page: 1,
          limit: data.length || 9,
          totalPages: 1
        });
      }
    } catch {
      addToast("Failed to fetch DSA sheets metadata.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheets();
  }, [currentPage, pageSize, searchQuery]);

  // Dynamic theme icon & styling per topic sheet title
  const getSheetTheme = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("sde")) {
      return {
        icon: Award,
        gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
        iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        badge: "Crown Choice",
        borderHover: "hover:border-amber-500/50 hover:shadow-amber-500/10"
      };
    } else if (lower.includes("dp") || lower.includes("dynamic")) {
      return {
        icon: Sparkles,
        gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
        iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        badge: "Core Master",
        borderHover: "hover:border-purple-500/50 hover:shadow-purple-500/10"
      };
    } else if (lower.includes("graph")) {
      return {
        icon: GitMerge,
        gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
        iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        badge: "Advanced Graph",
        borderHover: "hover:border-indigo-500/50 hover:shadow-indigo-500/10"
      };
    } else if (lower.includes("tree") || lower.includes("bst")) {
      return {
        icon: Layers,
        gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
        iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        badge: "Tree Structures",
        borderHover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
      };
    } else if (lower.includes("heap")) {
      return {
        icon: Flame,
        gradient: "from-yellow-500/20 via-orange-500/10 to-transparent",
        iconBg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        badge: "Priority Queue",
        borderHover: "hover:border-yellow-500/50 hover:shadow-yellow-500/10"
      };
    } else if (lower.includes("array") || lower.includes("matrix")) {
      return {
        icon: Grid,
        gradient: "from-sky-500/20 via-cyan-500/10 to-transparent",
        iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
        badge: "Foundational",
        borderHover: "hover:border-sky-500/50 hover:shadow-sky-500/10"
      };
    }
    return {
      icon: Zap,
      gradient: "from-primary/20 via-primary/5 to-transparent",
      iconBg: "bg-primary/10 text-primary border-primary/30",
      badge: "Handpicked",
      borderHover: "hover:border-primary/50 hover:shadow-primary/10"
    };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              <Compass className="size-3.5" />
              SDE Curriculum & Master Sheets
            </div>
            <Typography variant="h2" className="font-bold tracking-tight text-foreground">
              DSA Master Practice Sheets
            </Typography>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Curated topic-wise sheets and the Ultimate SDE 280 sheet to systematically conquer technical interviews at Tier-1 companies.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/60 backdrop-blur-xs">
            <div className="size-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {pagination.total}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Available Sheets</p>
              <p className="text-[11px] text-muted-foreground">Updated for SDE Preparation</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchInput
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search sheets by title or author..."
              className="bg-background/80"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
            <span className="text-muted-foreground whitespace-nowrap">Sheets per page:</span>
            <Select
              value={pageSize.toString()}
              onChange={(e) => updateParam("limit", e.target.value)}
              className="w-24 h-9 bg-background/80"
            >
              <option value="6">6</option>
              <option value="9">9</option>
              <option value="12">12</option>
              <option value="18">18</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Sheet Cards Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 h-72 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-muted/60" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-muted/60 rounded" />
                  <div className="h-3 w-1/2 bg-muted/40 rounded" />
                </div>
              </div>
              <div className="h-16 w-full bg-muted/30 rounded-lg" />
              <div className="h-10 w-full bg-muted/50 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : sheets.length === 0 ? (
        <div className="p-16 rounded-2xl border border-border bg-card/60 text-center space-y-3">
          <BookOpen className="size-12 text-muted-foreground/40 mx-auto" />
          <p className="text-base font-semibold text-foreground">No DSA sheets found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or clear filters to view available master sheets.
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalSearch("");
                setSearchParams(new URLSearchParams());
              }}
              className="mt-2 text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sheets.map((sheet) => {
            const theme = getSheetTheme(sheet.title);
            const ThemeIcon = theme.icon;
            const pct =
              sheet.totalProblems > 0
                ? Math.round((sheet.solvedProblems / sheet.totalProblems) * 100)
                : 0;

            return (
              <div
                key={sheet.id}
                onClick={() => navigate(`/sheets/${sheet.id}`)}
                className={`group relative rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${theme.borderHover} overflow-hidden`}
              >
                {/* Background ambient gradient glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10 space-y-4">
                  {/* Top Row: Icon + Title + Theme Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-11 rounded-xl border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${theme.iconBg}`}
                      >
                        <ThemeIcon className="size-5" />
                      </div>
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {theme.badge}
                        </span>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {sheet.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Row: Author & Time */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="size-3.5 text-primary/70" />
                      {sheet.author}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="size-3.5 text-amber-400/80" />
                      {sheet.estimatedTime}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pt-1">
                    {sheet.description}
                  </p>
                </div>

                {/* Bottom Progress & Practice CTA */}
                <div className="relative z-10 space-y-4 pt-6 mt-6 border-t border-border/60">
                  {/* Stats Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        Completion Progress
                      </span>
                      <span className="font-bold text-foreground">
                        {sheet.solvedProblems}/{sheet.totalProblems} ({pct}%)
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-xs"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sheets/${sheet.id}`);
                    }}
                    className="w-full text-xs font-semibold cursor-pointer bg-primary/90 text-primary-foreground hover:bg-primary shadow-xs group-hover:shadow-md transition-all flex items-center justify-center gap-2 h-10 rounded-xl"
                  >
                    <span>Practice Problems</span>
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/80">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{pagination.total}</span> sheets
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => updateParam("page", (pagination.page - 1).toString())}
              className="text-xs gap-1.5 h-9"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            {/* Page Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => {
                // Show smart ellipsis logic for large page counts
                if (
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
                ) {
                  return (
                    <Button
                      key={p}
                      variant={p === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateParam("page", p.toString())}
                      className={`size-9 text-xs p-0 font-medium ${
                        p === pagination.page
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p}
                    </Button>
                  );
                } else if (
                  (p === 2 && pagination.page > 3) ||
                  (p === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                ) {
                  return (
                    <span key={p} className="px-1 text-xs text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateParam("page", (pagination.page + 1).toString())}
              className="text-xs gap-1.5 h-9"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
