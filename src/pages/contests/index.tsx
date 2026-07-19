import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { ContestCard } from "./components/ContestCard";
import { ContestStats } from "./components/ContestStats";
import { ParticipationModal } from "./components/ParticipationModal";
import {
  Trophy,
  History,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  Target,
  ExternalLink,
} from "lucide-react";

interface Contest {
  id: string;
  platform: string;
  name: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  cardImg?: string;
}

interface Participation {
  _id: string;
  user: string;
  contest: Contest | any;
  participated: boolean;
  totalTimeSpent: number;
  totalQuestions: number;
  questionsSolved: number;
  questionsAttempted: number;
  questionsToUpsolve: number;
  upsolvedCount: number;
  rank: number | null;
  ratingChange: number | null;
  problemNumbers: string;
  notes: string;
}

interface ContestStats {
  totalContests: number;
  totalSolved: number;
  totalAttempted: number;
  totalUpsolveTarget: number;
  totalUpsolved: number;
  averageRank: number | null;
  platformBreakdown: Record<string, { contests: number; solved: number }>;
}

type Tab = "upcoming" | "history";
type PlatformFilter = "all" | "leetcode" | "codeforces";

export function ContestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [historyData, setHistoryData] = useState<Participation[]>([]);
  const [stats, setStats] = useState<ContestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // Participation modal
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [existingParticipation, setExistingParticipation] = useState<Participation | null>(null);
  const [participationModalOpen, setParticipationModalOpen] = useState(false);

  const addToast = useNotificationStore((state: any) => state.addToast);

  const fetchUpcoming = useCallback(async () => {
    try {
      const params: any = {};
      if (platformFilter !== "all") params.platform = platformFilter;
      const res = await api.get("/contests/upcoming", { params });
      setUpcomingContests(res.data.data);
    } catch {
      addToast("Failed to fetch upcoming contests.", "error");
    }
  }, [platformFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/contests/my-stats");
      setStats(res.data.data);
    } catch {
      // Stats are optional, don't block
    }
  }, []);

  const fetchHistory = useCallback(async (page: number) => {
    try {
      const res = await api.get("/contests/my-history", {
        params: { page, limit: 10 },
      });
      setHistoryData(res.data.data.participations);
      setHistoryTotalPages(res.data.data.pagination.totalPages);
    } catch {
      addToast("Failed to fetch contest history.", "error");
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUpcoming(), fetchStats(), fetchHistory(1)]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading) fetchUpcoming();
  }, [platformFilter]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post("/contests/sync");
      await fetchUpcoming();
      addToast("Contests synced from external APIs!", "success");
    } catch {
      addToast("Failed to sync contests.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenParticipation = async (contest: Contest) => {
    setSelectedContest(contest);
    try {
      const res = await api.get(`/contests/${contest.id}/participation`);
      setExistingParticipation(res.data.data);
    } catch {
      setExistingParticipation(null);
    }
    setParticipationModalOpen(true);
  };

  const handleSaveParticipation = async (data: any) => {
    if (!selectedContest) return;
    try {
      await api.post(`/contests/${selectedContest.id}/participate`, data);
      addToast("Participation logged successfully!", "success");
      setParticipationModalOpen(false);
      setSelectedContest(null);
      setExistingParticipation(null);
      // Refresh stats and history
      await Promise.all([fetchStats(), fetchHistory(historyPage)]);
    } catch {
      addToast("Failed to save participation.", "error");
    }
  };

  const handleHistoryPageChange = async (newPage: number) => {
    setHistoryPage(newPage);
    await fetchHistory(newPage);
  };

  // Skeleton loading state
  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="h-7 w-1/3 rounded bg-muted/60" />
          <div className="h-4 w-2/3 rounded bg-muted/40" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-xl border border-border bg-card h-52" />
          ))}
        </div>
      </div>
    );
  }

  const platformColors: Record<string, string> = {
    codeforces: "text-blue-500",
    leetcode: "text-amber-500",
  };

  const platformBgColors: Record<string, string> = {
    codeforces: "bg-blue-500/10 border-blue-500/20",
    leetcode: "bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Typography variant="h2" className="font-bold text-foreground flex items-center gap-2">
            <Trophy className="size-6 text-primary" />
            Contests
          </Typography>
          <p className="text-sm text-muted-foreground mt-1">
            Track upcoming contests and log your performance across platforms.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Contests"}
        </Button>
      </div>

      {/* Stats Banner */}
      {stats && <ContestStats stats={stats} />}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border w-fit">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy className="size-3.5" />
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="size-3.5" />
          My History
        </button>
      </div>

      {/* Upcoming Contests Tab */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {/* Platform Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="size-3.5 text-muted-foreground" />
            {(["all", "leetcode", "codeforces"] as PlatformFilter[]).map((pf) => (
              <button
                key={pf}
                onClick={() => setPlatformFilter(pf)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  platformFilter === pf
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                }`}
              >
                {pf === "all" ? "All Platforms" : pf.charAt(0).toUpperCase() + pf.slice(1)}
              </button>
            ))}
          </div>

          {/* Contest Cards Grid */}
          {upcomingContests.length === 0 ? (
            <div className="p-12 rounded-xl border border-border bg-card/50 text-center">
              <Trophy className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No upcoming contests found.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Click "Sync Contests" to refresh from external APIs.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  onLogParticipation={() => handleOpenParticipation(contest)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {historyData.length === 0 ? (
            <div className="p-12 rounded-xl border border-border bg-card/50 text-center">
              <History className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No contest history yet.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Log your first participation from an upcoming or past contest.
              </p>
            </div>
          ) : (
            <>
              {/* History Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Contest</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Platform</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Solved</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Attempted</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Upsolve</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Rank</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Time</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((p) => {
                        const contest = p.contest;
                        return (
                          <tr key={p._id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{contest?.name || "Unknown"}</span>
                                {contest?.url && (
                                  <a
                                    href={contest.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <ExternalLink className="size-3" />
                                  </a>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {contest?.startTime
                                  ? new Date(contest.startTime).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : ""}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                                  platformBgColors[contest?.platform] || "bg-muted/30 border-border"
                                } ${platformColors[contest?.platform] || "text-muted-foreground"}`}
                              >
                                {contest?.platform || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-semibold text-emerald-500">{p.questionsSolved}</span>
                              <span className="text-muted-foreground">/{p.totalQuestions}</span>
                            </td>
                            <td className="px-4 py-3 text-center text-foreground">{p.questionsAttempted}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-amber-500 font-medium">{p.upsolvedCount}</span>
                              <span className="text-muted-foreground">/{p.questionsToUpsolve}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {p.rank ? (
                                <span className="font-semibold text-indigo-500">#{p.rank}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-muted-foreground">
                              {p.totalTimeSpent ? `${p.totalTimeSpent}m` : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (contest) {
                                    const c: Contest = {
                                      id: contest._id,
                                      platform: contest.platform,
                                      name: contest.name,
                                      url: contest.url,
                                      startTime: contest.startTime,
                                      endTime: contest.endTime,
                                      duration: contest.duration,
                                      status: contest.status,
                                    };
                                    setSelectedContest(c);
                                    setExistingParticipation(p);
                                    setParticipationModalOpen(true);
                                  }
                                }}
                                className="text-xs cursor-pointer"
                              >
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {historyTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
                    <span className="text-xs text-muted-foreground">
                      Page {historyPage} of {historyTotalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPage <= 1}
                        onClick={() => handleHistoryPageChange(historyPage - 1)}
                        className="cursor-pointer"
                      >
                        <ChevronLeft className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPage >= historyTotalPages}
                        onClick={() => handleHistoryPageChange(historyPage + 1)}
                        className="cursor-pointer"
                      >
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Participation Modal */}
      <ParticipationModal
        isOpen={participationModalOpen}
        onClose={() => {
          setParticipationModalOpen(false);
          setSelectedContest(null);
          setExistingParticipation(null);
        }}
        contest={selectedContest}
        existingData={existingParticipation}
        onSave={handleSaveParticipation}
      />
    </div>
  );
}
