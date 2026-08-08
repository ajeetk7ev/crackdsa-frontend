import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Dialog } from "@/components/ui/dialog";
import { PageLoader } from "@/components/ui/loader";
import {
  CheckCircle2,
  Bookmark,
  Award,
  Calendar,
  Mail,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UserDetailData {
  user: {
    id: string;
    name: string;
    username?: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    createdAt?: string;
  };
  stats: {
    totalSolved: number;
    totalAttempted: number;
    totalProblemsCount: number;
    bookmarkedCount: number;
    difficultyStats: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    topicBreakdown: Array<{ topic: string; solved: number }>;
  };
  recentActivities: Array<{
    id: string;
    problemId: string;
    title: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
    status: string;
    timeTaken?: string;
    totalAttempts: number;
    note?: string;
    updatedAt: string;
  }>;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "activities">("overview");

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      api
        .get(`/admin/users/${userId}/details`)
        .then((res) => {
          setData(res.data?.data || null);
        })
        .catch(() => {
          setData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setData(null);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const stats = data?.stats;
  const user = data?.user;

  const totalEasy = stats?.difficultyStats?.Easy || 0;
  const totalMedium = stats?.difficultyStats?.Medium || 0;
  const totalHard = stats?.difficultyStats?.Hard || 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-border"
    >
      {loading ? (
        <div className="py-12">
          <PageLoader message="Fetching candidate detailed metrics & progress..." />
        </div>
      ) : !data || !user ? (
        <div className="py-12 text-center text-muted-foreground">
          Unable to load user progress records.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header User Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div className="flex items-center gap-3.5">
              <div className="size-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider",
                      user.role === "ADMIN"
                        ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    )}
                  >
                    {user.role}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider",
                      user.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                    )}
                  >
                    {user.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  {user.username && (
                    <span className="flex items-center gap-1 font-mono">
                      @{user.username}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {user.email}
                  </span>
                  {user.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
                <span>Total Solved</span>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats?.totalSolved || 0}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Out of {stats?.totalProblemsCount || 0} catalog problems
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
                <span>Attempted</span>
                <Activity className="size-4 text-indigo-500" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats?.totalAttempted || 0}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Active problem attempts
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
                <span>Bookmarked</span>
                <Bookmark className="size-4 text-amber-500" />
              </div>
              <span className="text-2xl font-black text-foreground">{stats?.bookmarkedCount || 0}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Saved for revision
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
                <span>Completion</span>
                <Award className="size-4 text-purple-500" />
              </div>
              <span className="text-2xl font-black text-foreground">
                {stats?.totalProblemsCount ? Math.round(((stats?.totalSolved || 0) / stats.totalProblemsCount) * 100) : 0}%
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Platform catalog progress
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Difficulty & Distribution
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                activeTab === "topics"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Topic Mastery ({stats?.topicBreakdown?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer",
                activeTab === "activities"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Recent Submissions ({data.recentActivities.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Solved Difficulty Breakdown</h4>
              <div className="space-y-3">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-emerald-500">Easy ({totalEasy})</span>
                    <span className="text-muted-foreground">
                      {stats?.totalSolved ? Math.round((totalEasy / stats.totalSolved) * 100) : 0}% of solved
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${stats?.totalSolved ? (totalEasy / stats.totalSolved) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-amber-500">Medium ({totalMedium})</span>
                    <span className="text-muted-foreground">
                      {stats?.totalSolved ? Math.round((totalMedium / stats.totalSolved) * 100) : 0}% of solved
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${stats?.totalSolved ? (totalMedium / stats.totalSolved) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-rose-500">Hard ({totalHard})</span>
                    <span className="text-muted-foreground">
                      {stats?.totalSolved ? Math.round((totalHard / stats.totalSolved) * 100) : 0}% of solved
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${stats?.totalSolved ? (totalHard / stats.totalSolved) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "topics" && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Topics Solved Breakdown</h4>
              {!stats?.topicBreakdown?.length ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No solved topics recorded yet for this candidate.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {stats.topicBreakdown.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="size-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-foreground">{item.topic}</span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-500/10 text-indigo-600">
                        {item.solved} solved
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Recent Submissions & Revision Log</h4>
              {!data.recentActivities.length ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No activity history available.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {data.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg border border-border bg-card text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <span>{act.title}</span>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                              act.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : act.difficulty === "Medium"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-600"
                            )}
                          >
                            {act.difficulty}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase",
                            act.status === "Solved" || act.status.includes("Revised") || act.status === "Mastered"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          )}
                        >
                          {act.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Topic: {act.topic} • Attempts: {act.totalAttempts}</span>
                        <span>{new Date(act.updatedAt).toLocaleString()}</span>
                      </div>
                      {act.note && (
                        <div className="mt-1 p-2 rounded bg-muted/50 font-mono text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Note:</span> {act.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
