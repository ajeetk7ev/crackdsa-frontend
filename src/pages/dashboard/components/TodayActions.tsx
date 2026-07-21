import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { Spinner } from "@/components/ui/loader";
import { 
  RefreshCw, 
  Target, 
  ArrowUpRight, 
  CheckCircle2, 
  ExternalLink,
  Link2Off,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
}

interface ProblemItem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
}

interface TodayRevisionProps {
  revisions: RevisionItem[];
  problems: ProblemItem[];
  progressList: any[];
  onReviewSelect: (problemId: string) => void;
  onRevisionStatusChange?: () => void;
}

// 1. Today's Revision Card
export function TodayRevisionCard({ 
  revisions, 
  problems, 
  progressList,
  onReviewSelect, 
  onRevisionStatusChange 
}: TodayRevisionProps) {
  const addToast = useNotificationStore((state: any) => state.addToast);

  const getProblemTitle = (probId: string) => {
    const found = problems.find((p) => p.id === probId);
    return found ? found.title : "Algorithm Problem";
  };

  const getProblemDifficulty = (probId: string) => {
    const found = problems.find((p) => p.id === probId);
    return found ? found.difficulty : "Easy";
  };

  const handleToggleRevision = async (probId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find the current status in progressList
    const prog = progressList.find((p) => p.problemId === probId);
    const currentStatus = prog ? prog.status : "Solved";
    
    let nextStatus = "Revised Once";
    if (currentStatus === "Solved") {
      nextStatus = "Revised Once";
    } else if (currentStatus === "Revised Once") {
      nextStatus = "Revised Twice";
    } else if (currentStatus === "Revised Twice") {
      nextStatus = "Mastered";
    } else {
      nextStatus = "Revised Once";
    }

    try {
      await api.put(`/progress/${probId}`, { status: nextStatus });
      addToast(`Problem marked as ${nextStatus}!`, "success");
      if (onRevisionStatusChange) {
        onRevisionStatusChange();
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || "Failed to update revision status.";
      addToast(serverMsg, "error");
    }
  };

  const difficultyColors = {
    Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    Hard: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <RefreshCw className="size-4 text-amber-500" />
          1. Today's Revision
        </Typography>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
          {revisions.length} Due
        </span>
      </div>

      <div className="flex-1">
        {revisions.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="size-6 text-emerald-500 mx-auto" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              All caught up! No scheduled revisions for today. Solve new patterns to populate lists.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mt-2 max-h-[185px] overflow-y-auto pr-1">
            {revisions.map((rev) => {
              const diff = getProblemDifficulty(rev.problemId) as "Easy" | "Medium" | "Hard";
              return (
                <div
                  key={rev.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border hover:border-border-hover hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Checkbox Icon */}
                    <button
                      onClick={(e) => handleToggleRevision(rev.problemId, e)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                      title="Mark as Completed"
                    >
                      <div className="size-4 rounded-full border border-muted-foreground/60 hover:border-foreground" />
                    </button>

                    <button
                      onClick={() => onReviewSelect(rev.problemId)}
                      className="min-w-0 text-left cursor-pointer flex-1"
                      title="Review Problem"
                    >
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary-hover transition-colors">
                        {getProblemTitle(rev.problemId)}
                      </p>
                    </button>
                  </div>

                  <span
                    className={cn(
                      "text-[9px] font-semibold border rounded-full px-2 py-0.5 ml-2",
                      difficultyColors[diff]
                    )}
                  >
                    {diff}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link to="/revision" className="block">
          <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
            Manage Revision Queue
            <ArrowUpRight className="size-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// 2. LeetCode Profile Card
interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  ranking: number;
  contributionPoint: number;
}

export function LeetcodeProfileCard() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const addToast = useNotificationStore((state: any) => state.addToast);

  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [inputUsername, setInputUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  const fetchLeetcodeStats = async (username: string) => {
    setLoadingStats(true);
    setFetchError(null);
    try {
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/profile`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile stats");
      }
      const data = await response.json();
      if (data.errors || data.message || typeof data.totalSolved !== "number") {
        throw new Error(data.errors || data.message || "Invalid LeetCode profile response");
      }
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setFetchError("Unable to load LeetCode data. Make sure the username is correct.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user?.leetcodeUsername) {
      fetchLeetcodeStats(user.leetcodeUsername);
    } else {
      setStats(null);
      setFetchError(null);
    }
  }, [user?.leetcodeUsername]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = inputUsername.trim();
    if (!cleanUsername) {
      addToast("LeetCode username cannot be empty.", "warning");
      return;
    }
    setSavingUsername(true);
    try {
      await updateProfile({
        leetcodeUsername: cleanUsername
      });
      addToast(`LeetCode username set to: ${cleanUsername}`, "success");
      setInputUsername("");
    } catch (err) {
      addToast("Failed to connect LeetCode profile.", "error");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleDisconnect = async () => {
    setSavingUsername(true);
    try {
      await updateProfile({
        leetcodeUsername: ""
      });
      addToast("LeetCode profile disconnected.", "info");
    } catch (err) {
      addToast("Failed to disconnect LeetCode profile.", "error");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleOpenLeetCodeProfile = () => {
    if (user?.leetcodeUsername) {
      window.open(`https://leetcode.com/u/${user.leetcodeUsername}/`, "_blank");
    }
  };

  const getPercent = (solved: number, total: number) => {
    if (!total) return 0;
    return Math.min(100, Math.ceil((solved / total) * 100));
  };

  // Render State 1: Connecting / Saving Username to backend
  if (savingUsername) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs text-muted-foreground mt-3 font-medium">Updating account settings...</p>
      </div>
    );
  }

  // Render State 2: Not connected yet
  if (!user?.leetcodeUsername) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left min-h-[300px]">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <img src={leetcodeLogo} alt="LeetCode" className="size-4 object-contain dark:invert" />
            LeetCode Profile
          </Typography>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
            Disconnected
          </span>
        </div>

        <div className="flex-1 py-1 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Link your LeetCode profile to pull solved difficulty statistics, current global ranking, and track consistency analytics directly inside CrackDSA.
          </p>
          <form onSubmit={handleConnect} className="space-y-2">
            <div className="space-y-1">
              <label htmlFor="leetcode-user-input" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                LeetCode Username:
              </label>
              <Input
                id="leetcode-user-input"
                type="text"
                placeholder="Enter LeetCode username"
                value={inputUsername}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputUsername(e.target.value)}
                className="text-xs"
              />
            </div>
            <Button type="submit" size="sm" className="w-full text-xs cursor-pointer">
              Connect Profile
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Render State 3: Loading stats from render API
  if (loadingStats) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs text-muted-foreground mt-3 font-medium animate-pulse">Syncing LeetCode statistics...</p>
      </div>
    );
  }

  // Render State 4: Error loading stats
  if (fetchError) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left min-h-[300px]">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <img src={leetcodeLogo} alt="LeetCode" className="size-4 object-contain dark:invert animate-pulse" />
            LeetCode Profile
          </Typography>
          <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">
            Error
          </span>
        </div>

        <div className="flex-1 py-4 flex flex-col justify-center space-y-3">
          <p className="text-xs text-rose-500/90 font-medium bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg leading-relaxed">
            {fetchError}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="xs" 
              onClick={() => fetchLeetcodeStats(user.leetcodeUsername!)} 
              className="flex-1 text-xs cursor-pointer"
            >
              Retry Sync
            </Button>
            <Button 
              variant="outline" 
              size="xs" 
              onClick={handleDisconnect}
              className="flex-1 text-xs cursor-pointer text-muted-foreground hover:text-destructive flex items-center justify-center gap-1"
            >
              <Link2Off className="size-3" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render State 5: Stats loaded successfully
  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left min-h-[300px]">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <img src={leetcodeLogo} alt="LeetCode" className="size-4 object-contain dark:invert" />
          LeetCode Profile
        </Typography>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
          <UserCheck className="size-3" />
          Connected
        </span>
      </div>

      {stats && (
        <div className="flex-1 space-y-3 py-1">
          <div className="flex justify-between items-center bg-background/50 border border-border/60 p-2.5 rounded-lg">
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">@{user.leetcodeUsername}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Rank: {stats.ranking ? stats.ranking.toLocaleString() : "N/A"}
              </p>
            </div>
            <button 
              onClick={handleDisconnect} 
              className="text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors px-2 py-0.5 rounded border border-border bg-background cursor-pointer"
              title="Disconnect Leetcode username"
            >
              Disconnect
            </button>
          </div>

          {/* Stats metrics distribution */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">Easy Solves</span>
                <span className="text-foreground">{stats.easySolved} / {stats.totalEasy}</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/40 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
                  style={{ width: `${getPercent(stats.easySolved, stats.totalEasy)}%` }}
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-amber-600 dark:text-amber-400">Medium Solves</span>
                <span className="text-foreground">{stats.mediumSolved} / {stats.totalMedium}</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/40 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500 ease-out" 
                  style={{ width: `${getPercent(stats.mediumSolved, stats.totalMedium)}%` }}
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-rose-600 dark:text-rose-400">Hard Solves</span>
                <span className="text-foreground">{stats.hardSolved} / {stats.totalHard}</span>
              </div>
              <div className="w-full bg-muted dark:bg-muted/40 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full transition-all duration-500 ease-out" 
                  style={{ width: `${getPercent(stats.hardSolved, stats.totalHard)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenLeetCodeProfile}
          className="w-full text-xs cursor-pointer flex items-center justify-center gap-1"
        >
          View Profile Page
          <ExternalLink className="size-3" />
        </Button>
      </div>
    </div>
  );
}

// 3. Redesigned Today's Goal Card
export function TodayGoalCard({ 
  problems, 
  solvedProblemIds, 
  onGoalStatusChange 
}: { 
  problems: ProblemItem[]; 
  solvedProblemIds: string[]; 
  onGoalStatusChange?: () => void; 
}) {
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Load goals from backend
  const loadGoals = async () => {
    try {
      const res = await api.get("/goals/today");
      setGoalIds(res.data.data.problemIds);
    } catch {
      // Keep list empty if fetch fails
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);



  const clearGoals = async () => {
    try {
      await api.delete("/goals/today");
      setGoalIds([]);
      addToast("Today's goals cleared.", "info");
    } catch {
      addToast("Failed to clear today's goals.", "error");
    }
  };

  // Determine if a problem ID is solved
  const isProblemSolved = (probId: string) => {
    return solvedProblemIds.includes(probId);
  };

  // Resolve problem metadata
  const getProblemDetails = (probId: string) => {
    return problems.find((p) => p.id === probId);
  };

  const handleToggleSolved = async (probId: string, currentSolved: boolean) => {
    try {
      const newStatus = currentSolved ? "Needs Revision" : "Solved";
      await api.put(`/progress/${probId}`, { status: newStatus });
      addToast(currentSolved ? "Goal marked as pending." : "Goal marked as completed!", "success");
      if (onGoalStatusChange) {
        onGoalStatusChange();
      }
    } catch (err) {
      addToast("Failed to update goal status.", "error");
    }
  };



  const handleRedirectToLeetcode = (probTitle: string) => {
    const slug = probTitle.toLowerCase().replace(/ /g, "-");
    window.open(`https://leetcode.com/problems/${slug}/`, "_blank");
    addToast(`Redirecting to LeetCode for "${probTitle}"...`, "info");
  };

  const solvedCount = goalIds.filter(isProblemSolved).length;
  const totalCount = goalIds.length;

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full text-left relative">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
          <Target className="size-4 text-rose-500" />
          3. Today's Goal
        </Typography>
        <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">
          {goalIds.length > 0 ? `${solvedCount} / ${totalCount} Solved` : "Daily Targets"}
        </span>
      </div>

      {/* Card Body content */}
      <div className="flex-1 flex flex-col justify-center">
        {goalIds.length === 0 ? (
          /* State A: No Goal Set */
          <div className="py-6 text-center space-y-3">
            <Typography variant="muted" className="text-xs block leading-relaxed px-2">
              No target problems set for today. Choose up to 4 high-yield goals.
            </Typography>
            <Link to="/problems" className="mx-auto block">
              <Button
                variant="default"
                size="sm"
                className="cursor-pointer shadow-sm text-xs font-semibold"
              >
                Set Today's Goal
              </Button>
            </Link>
          </div>
        ) : (
          /* State B: Goals Checklist */
          <div className="space-y-2 mt-1 max-h-[185px] overflow-y-auto pr-1">
            {goalIds.map((id) => {
              const prob = getProblemDetails(id);
              if (!prob) return null;
              const solved = isProblemSolved(id);
              const diff = (prob.difficulty || "Easy") as "Easy" | "Medium" | "Hard";
              
              const difficultyColors = {
                Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
                Hard: "text-rose-600 bg-rose-500/10 border-rose-500/20",
              };

              return (
                <div 
                  key={id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border hover:border-border-hover hover:bg-muted/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Checkbox Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSolved(id, solved);
                      }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
                      title={solved ? "Mark as Pending" : "Mark as Completed"}
                    >
                      {solved ? (
                        <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <div className="size-4 rounded-full border border-muted-foreground/60 hover:border-foreground" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRedirectToLeetcode(prob.title)}
                      className="min-w-0 text-left cursor-pointer flex-1 flex items-center gap-1.5"
                      title="Solve on LeetCode"
                    >
                      <img src={leetcodeLogo} alt="LeetCode" className="size-3.5 object-contain shrink-0 dark:invert" />
                      <p className={cn(
                        "text-xs font-semibold text-foreground truncate group-hover:text-primary-hover transition-colors",
                        solved ? "line-through text-muted-foreground font-normal" : ""
                      )}>
                        {prob.title}
                      </p>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className={cn(
                      "text-[9px] font-semibold border rounded-full px-2 py-0.5",
                      difficultyColors[diff]
                    )}>
                      {diff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer controls */}
      {goalIds.length > 0 && (
        <div className="pt-2">
          <Button
            onClick={clearGoals}
            variant="ghost"
            size="sm"
            className="w-full text-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border border-dashed cursor-pointer"
          >
            Reset Goals
          </Button>
        </div>
      )}
    </div>
  );
}

