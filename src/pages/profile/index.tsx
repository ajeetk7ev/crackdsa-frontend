import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/loader";

import {
  Flame,
  Sparkles,
  Activity,
  Calendar,
  ExternalLink,
  Share2,
  Edit2,
  Code,
  Link2Off
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
}

interface Revision {
  id: string;
  problemId: string;
  status: string;
  interval: number;
  repetitions: number;
}

export function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const addToast = useNotificationStore((state: any) => state.addToast);

  // Core Data State
  const [problems, setProblems] = useState<Problem[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState<any>({
    readinessScore: 10,
    percentile: "Top 25%",
    heatmapMap: {},
    monthlySummary: {
      solvedThisMonth: 0,
      revisionsThisMonth: 0,
      studyHoursThisMonth: 0,
      longestStreak: 0
    },
    recentActivities: []
  });

  // Profile Customization States
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  
  // LeetCode API Stats States
  const [leetcodeStats, setLeetcodeStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Modals Visibility
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLeetcodeOpen, setIsLeetcodeOpen] = useState(false);

  // Temporary edit binds
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLeetcodeUser, setEditLeetcodeUser] = useState("");

  const fetchLeetcodeStats = async (username: string) => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/profile`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile stats");
      }
      const data = await response.json();
      if (data.errors || data.message || typeof data.totalSolved !== "number") {
        throw new Error(data.errors || data.message || "Invalid LeetCode response");
      }
      setLeetcodeStats(data);
    } catch (err: any) {
      console.error(err);
      setStatsError("Failed to load statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (leetcodeUsername) {
      fetchLeetcodeStats(leetcodeUsername);
    } else {
      setLeetcodeStats(null);
      setStatsError(null);
    }
  }, [leetcodeUsername]);

  const loadProfileData = async () => {
    try {
      const [probRes, revRes, progRes, colRes, diagRes] = await Promise.all([
        api.get("/problems?limit=1000"),
        api.get("/revisions"),
        api.get("/progress"),
        api.get("/collections"),
        api.get("/progress/diagnostics")
      ]);

      setProblems(probRes.data.data.problems);
      setRevisions(revRes.data.data);
      setProgressList(progRes.data.data);
      setCollections(colRes.data.data);
      setDiagnostics(diagRes.data.data);

      const firstname = authUser?.firstname || "";
      const lastname = authUser?.lastname || "";
      const name = firstname || lastname ? `${firstname} ${lastname}`.trim() : "Alex Miller";
      const username = authUser?.username || "alex_miller";
      const bio = authUser?.bio || "";
      const lcUser = authUser?.leetcodeUsername || "";

      setProfileName(name);
      setProfileUsername(username);
      setProfileBio(bio);
      setLeetcodeUsername(lcUser);

      setEditName(name);
      setEditUsername(username);
      setEditBio(bio);
      setEditLeetcodeUser(lcUser);
    } catch {
      addToast("Failed to fetch profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [authUser]);

  // 1. Save Profile Details
  const handleSaveProfile = async () => {
    if (!editName.trim() || !editUsername.trim()) {
      addToast("Name and Username are required.", "warning");
      return;
    }

    try {
      await updateProfile({
        firstname: editName.split(" ")[0] || "",
        lastname: editName.split(" ").slice(1).join(" ") || "",
        username: editUsername,
        bio: editBio
      });

      setProfileName(editName);
      setProfileUsername(editUsername);
      setProfileBio(editBio);

      addToast("Profile details updated successfully.", "success");
      setIsEditOpen(false);
    } catch {
      addToast("Failed to update profile settings.", "error");
    }
  };

  // 2. Save Leetcode username
  const handleSaveLeetcodeUser = async () => {
    const cleanUser = editLeetcodeUser.trim();
    try {
      await updateProfile({
        leetcodeUsername: cleanUser
      });
      setLeetcodeUsername(cleanUser);
      addToast(cleanUser ? `LeetCode profile connected: ${cleanUser}` : "LeetCode profile disconnected", "success");
      setIsLeetcodeOpen(false);
    } catch {
      addToast("Failed to save Leetcode username.", "error");
    }
  };

  // 2.5 Disconnect Leetcode username
  const handleDisconnectLeetcode = async () => {
    try {
      await updateProfile({
        leetcodeUsername: ""
      });
      setLeetcodeUsername("");
      setEditLeetcodeUser("");
      addToast("LeetCode profile disconnected.", "info");
    } catch {
      addToast("Failed to disconnect LeetCode username.", "error");
    }
  };

  // 3. Copy share link
  const handleCopyProfileUrl = () => {
    const shareUrl = `crackdsa.co.in/u/${profileUsername}`;
    navigator.clipboard.writeText(shareUrl);
    addToast(`Copied LinkedIn profile link: ${shareUrl}`, "success");
  };

  // Stats Calculations
  const solvedCount = useMemo(() => {
    return progressList.filter(
      (p) => ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(p.status)
    ).length;
  }, [progressList]);

  const progressPercent = problems.length > 0 ? Math.ceil((solvedCount / problems.length) * 100) : 0;
  const revisionsCount = useMemo(() => {
    return revisions.reduce((sum, item) => sum + (item.repetitions || 0), 0);
  }, [revisions]);

  const masteredCount = useMemo(() => {
    return progressList.filter((p) => p.status === "Mastered").length;
  }, [progressList]);

  const currentStreakVal = authUser?.streak?.current || 0;
  const longestStreakVal = authUser?.streak?.longest || 0;

  // Interview Readiness Score calculations
  const readinessPercent = diagnostics.readinessScore;
  const percentile = diagnostics.percentile;

  // SVG circular calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference;

  // Generate GitHub Heatmap data for 2026 aligned to Sundays
  const heatmapData = useMemo(() => {
    const start = new Date(2025, 11, 28); // Dec 28, 2025 (Sunday)
    const end = new Date(2027, 0, 2); // Jan 2, 2027 (Saturday)

    const list = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      const is2026 = cur.getFullYear() === 2026;
      const count = is2026 ? (diagnostics.heatmapMap[dateStr] || 0) : -1;

      list.push({ dateStr, count, dateObj: new Date(cur), is2026 });
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }, [diagnostics.heatmapMap]);

  // Generate month labels aligning with the 53 week columns of 2026
  const monthLabels = useMemo(() => {
    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = -1;

    const totalCols = Math.ceil(heatmapData.length / 7);
    for (let w = 0; w < totalCols; w++) {
      const dayIndex = w * 7;
      if (dayIndex >= heatmapData.length) break;
      const date = heatmapData[dayIndex].dateObj;
      if (date.getFullYear() === 2026) {
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            text: date.toLocaleString("en-US", { month: "short" }),
            colIndex: w,
          });
          lastMonth = month;
        }
      }
    }
    return labels;
  }, [heatmapData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted/60 rounded animate-pulse" />
        <div className="h-32 bg-muted/40 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      
      {/* 1. ROW 1: HERO SECTION & INTERVIEW READINESS DIAGNOSTICS */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch">
        
        {/* HERO PROFILE CARD */}
        <div className="flex flex-col p-6 rounded-xl border border-border bg-card shadow-sm justify-between gap-4 h-full">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl uppercase">
              {profileName?.[0] || "A"}
            </div>

            <div className="space-y-1">
              <Typography variant="h1" className="font-semibold text-foreground">
                {profileName}
              </Typography>
              <p className="text-xs text-muted-foreground font-mono">@{profileUsername}</p>
              {profileBio && <p className="text-xs text-muted-foreground mt-1">{profileBio}</p>}
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                <Calendar className="size-3" /> Joined July 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
            <button
              onClick={handleCopyProfileUrl}
              className="h-9 px-4 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted/50 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="size-3.5" /> Share Profile
            </button>
            
            <Button
              onClick={() => setIsEditOpen(true)}
              variant="outline"
              className="h-9 text-xs cursor-pointer shadow-sm"
            >
              <Edit2 className="size-3.5 mr-1" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* CIRCULAR INTERVIEW READINESS GAUGE */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-center flex flex-col justify-between items-center h-full gap-4">
          <div className="w-full flex items-center justify-between border-b border-border/30 pb-2">
            <Typography variant="title" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block text-left">
              Readiness Diagnostics
            </Typography>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
              {percentile} Rank
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2 w-full">
            <div className="relative size-24 shrink-0 flex items-center justify-center select-none">
              <svg className="size-full -rotate-90">
                <circle cx="48" cy="48" r={radius} className="stroke-muted fill-none" strokeWidth="5" />
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-primary fill-none transition-all duration-500 ease-out animate-none"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-bold text-foreground block">{readinessPercent}%</span>
                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider">Ready</span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <Typography variant="title" className="text-foreground block">
                Overall Interview Readiness
              </Typography>
              <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs">
                Performance diagnostic based on correct solves ratio, daily active consistency, and playlists completeness.
              </p>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground text-center border-t border-border/30 pt-2.5 w-full font-medium">
            Calculated level rank is within the <span className="font-semibold text-foreground">{percentile}</span> tier.
          </div>
        </div>

      </div>

      {/* 2. ROW 2: OVERALL STATS SECTION GRID */}
      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Stats card wrapper 1 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Solved Problems</span>
          <p className="text-2xl font-light text-foreground">
            {solvedCount} <span className="text-xs text-muted-foreground">/ {problems.length}</span>
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Stats card wrapper 2 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Daily Streak</span>
          <p className="text-2xl font-light text-foreground flex items-center gap-1.5">
            {currentStreakVal} <Flame className="size-5 text-amber-500 fill-amber-500/10" />
          </p>
          <span className="text-[10px] text-muted-foreground">
            Longest Streak: {longestStreakVal} days
          </span>
        </div>

        {/* Stats card wrapper 3 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Recall Loops</span>
          <p className="text-2xl font-light text-foreground">
            {revisionsCount} <span className="text-xs text-muted-foreground">attempts</span>
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5">
            <Sparkles className="size-3" /> {masteredCount} Mastered items
          </span>
        </div>

        {/* Stats card wrapper 4 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Study Playlists</span>
          <p className="text-2xl font-light text-foreground">
            {collections.length} <span className="text-xs text-muted-foreground">curations</span>
          </p>
          <span className="text-[10px] text-muted-foreground">
            Spotify-style roadmaps
          </span>
        </div>

      </div>

      {/* 3. ROW 3: CONSISTENCY HEATMAP */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <Typography variant="title" className="text-foreground flex items-center gap-1.5">
            <Activity className="size-4 text-indigo-500" />
            Consistency Heatmap
          </Typography>
          <span className="text-[10px] text-muted-foreground font-semibold">Problems Solved & Revisions</span>
        </div>

        <div className="flex gap-2 text-xs select-none items-start">
          
          {/* Day of Week Labels (Left Side) */}
          <div className="relative text-[9px] text-muted-foreground font-semibold w-8 select-none shrink-0" style={{ height: "150px" }}>
            <span className="absolute" style={{ top: "24px", right: "6px" }}>Sun</span>
            <span className="absolute" style={{ top: "42px", right: "6px" }}>Mon</span>
            <span className="absolute" style={{ top: "60px", right: "6px" }}>Tue</span>
            <span className="absolute" style={{ top: "78px", right: "6px" }}>Wed</span>
            <span className="absolute" style={{ top: "96px", right: "6px" }}>Thu</span>
            <span className="absolute" style={{ top: "114px", right: "6px" }}>Fri</span>
            <span className="absolute" style={{ top: "132px", right: "6px" }}>Sat</span>
          </div>

          {/* Main Heatmap Grid with Month Headers */}
          <div className="flex-1 overflow-x-auto select-none">
            
            {/* Month labels on top */}
            <div className="relative h-4 text-[9px] text-muted-foreground font-semibold select-none mb-1 w-[960px]">
              {monthLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="absolute"
                  style={{ left: `${lbl.colIndex * 18}px` }}
                >
                  {lbl.text}
                </span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 py-1 w-[960px]">
              {heatmapData.map((item, idx) => {
                let bgClass = "bg-muted/30 border-border/40 hover:border-muted-foreground/60";
                if (item.count === -1) {
                  bgClass = "bg-transparent border-transparent pointer-events-none";
                } else if (item.count === 1) {
                  bgClass = "bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/40";
                } else if (item.count === 2) {
                  bgClass = "bg-emerald-300 border-emerald-400 dark:bg-emerald-800/40 dark:border-emerald-800/60";
                } else if (item.count === 3) {
                  bgClass = "bg-emerald-500 border-emerald-600 dark:bg-emerald-600/60 dark:border-emerald-600/80";
                } else if (item.count >= 4) {
                  bgClass = "bg-emerald-700 border-emerald-800 dark:bg-emerald-500/80 dark:border-emerald-500/90";
                }

                const formattedDate = item.dateObj.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                });
                const tooltipText = `${item.count === 0 ? "No" : item.count} problem${item.count === 1 ? "" : "s"} solved on ${formattedDate}`;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "size-3 rounded-[2px] border transition-all duration-200 cursor-pointer relative group/item",
                      bgClass
                    )}
                  >
                    {/* Tooltip Overlay */}
                    {item.count !== -1 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/item:block z-50 bg-[#121214] text-white text-[10px] rounded px-2.5 py-1.5 whitespace-nowrap shadow-md pointer-events-none border border-zinc-800 font-medium">
                        {tooltipText}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between items-center text-[10px] text-muted-foreground border-t border-border/30 pt-3 gap-2">
          <span className="cursor-pointer hover:underline">Learn how we count contributions</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <div className="size-2.5 rounded-sm bg-muted/40 border border-border" />
            <div className="size-2.5 rounded-sm bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/40" />
            <div className="size-2.5 rounded-sm bg-emerald-300 border border-emerald-400 dark:bg-emerald-800/40 dark:border-emerald-800/60" />
            <div className="size-2.5 rounded-sm bg-emerald-500 border border-emerald-600 dark:bg-emerald-600/60" />
            <div className="size-2.5 rounded-sm bg-emerald-700 border border-emerald-800 dark:bg-emerald-500/80" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* 4. ROW 4: TWO COLUMN DETAILS GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Column 1: Leetcode and Sharing */}
        <div className="space-y-6">
          
          {/* LEETCODE CONNECTOR INTEGRATION */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <Typography variant="title" className="text-foreground flex items-center gap-1.5">
                <Code className="size-4 text-amber-500" />
                LeetCode Profile Connection
              </Typography>
              {leetcodeUsername && (
                <Button
                  onClick={() => setIsLeetcodeOpen(true)}
                  variant="ghost"
                  size="xs"
                  className="h-6 text-xs text-amber-600 hover:bg-amber-500/10 cursor-pointer"
                >
                  Change Username
                </Button>
              )}
            </div>

            {!leetcodeUsername ? (
              <div className="py-4 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  No LeetCode profile linked. Sync stats to display coding progress.
                </p>
                <Button
                  onClick={() => setIsLeetcodeOpen(true)}
                  size="sm"
                  className="text-xs cursor-pointer shadow-sm mx-auto"
                >
                  Connect Profile
                </Button>
              </div>
            ) : loadingStats ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <Spinner className="size-6 text-primary" />
                <p className="text-xs text-muted-foreground mt-2 animate-pulse">Syncing statistics...</p>
              </div>
            ) : statsError ? (
              <div className="py-4 space-y-3">
                <p className="text-xs text-rose-500 font-medium">
                  Could not retrieve stats for @{leetcodeUsername}.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => fetchLeetcodeStats(leetcodeUsername)}
                    className="text-xs cursor-pointer"
                  >
                    Retry Sync
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleDisconnectLeetcode}
                    className="text-xs cursor-pointer text-muted-foreground hover:text-destructive flex items-center gap-1"
                  >
                    <Link2Off className="size-3" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : leetcodeStats ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center py-2 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-amber-500/10 rounded-full flex items-center justify-center font-bold text-amber-600 font-mono">
                      LC
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">@{leetcodeUsername}</p>
                      <p className="text-xs text-muted-foreground">Connected solved profiles</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://leetcode.com/u/${leetcodeUsername}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted/50 cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                    >
                      View LeetCode Profile
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>

                {/* Leetcode Solved categories numbers */}
                <div className="grid grid-cols-4 gap-4 border-t border-border/30 pt-4 text-xs text-center">
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px]">Points</span>
                    <span className="text-sm font-bold text-foreground">
                      {leetcodeStats.contributionPoint || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px]">Ranking</span>
                    <span className="text-sm font-bold text-foreground truncate block">
                      {leetcodeStats.ranking ? leetcodeStats.ranking.toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px]">Solved Ratio</span>
                    <span className="text-sm font-bold text-foreground">
                      {leetcodeStats.totalSolved} / {leetcodeStats.totalQuestions}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-emerald-500 font-bold block text-[9px]">Easy: {leetcodeStats.easySolved}</span>
                    <span className="text-amber-500 font-bold block text-[9px]">Med: {leetcodeStats.mediumSolved}</span>
                    <span className="text-rose-500 font-bold block text-[9px]">Hard: {leetcodeStats.hardSolved}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* LINKEDIN PUBLIC SHARE CARD PREVIEW */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
            <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
              LinkedIn Public Share Card
            </Typography>

            {/* Premium Preview wrapper */}
            <div className="p-5 rounded-xl border border-border bg-[#030303] dark:bg-[#070707] text-white flex flex-col justify-between h-44 relative shadow-inner select-none max-w-md mx-auto">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <span>CrackDSA Achievement</span>
                <span>Profile Card</span>
              </div>

              <div className="space-y-2 py-2">
                <p className="text-lg font-bold text-white tracking-tight">{profileName}</p>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                  <span className="text-amber-400 font-bold flex items-center gap-0.5">🔥 {currentStreakVal} Day Streak</span>
                  <span>•</span>
                  <span>{solvedCount} Problems Solved</span>
                  <span>•</span>
                  <span className="text-indigo-400 font-bold">{percentile} SDE Grade</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2.5">
                <span>crackdsa.co.in/u/{profileUsername}</span>
                <span className="text-indigo-500 font-semibold">{readinessPercent}% Ready</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Button
                onClick={handleCopyProfileUrl}
                size="sm"
                className="text-xs cursor-pointer shadow-sm flex items-center gap-1.5 mx-auto"
              >
                <Share2 className="size-3.5" /> Copy share link
              </Button>
            </div>
          </div>

        </div>

        {/* Column 2: Monthly Summary and Activity logs */}
        <div className="space-y-6">
          
          {/* MONTHLY SUMMARY CARD */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <Typography variant="title" className="text-foreground block">
                Monthly Summary
              </Typography>
            </div>
            
            <div className="space-y-3 text-xs">
              {[
                { label: "Problems Solved This Month", val: `${diagnostics.monthlySummary.solvedThisMonth} solved` },
                { label: "Revisions This Month", val: `${diagnostics.monthlySummary.revisionsThisMonth} revised` },
                { label: "Study Hours logged", val: `${diagnostics.monthlySummary.studyHoursThisMonth} hours` },
                { label: "Best Streak achieved", val: `${diagnostics.monthlySummary.longestStreak} days` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-2.5 rounded bg-background border border-border">
                  <span className="font-semibold text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY TIMELINE */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
            <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
              Recent Activity logs
            </Typography>

            <div className="space-y-4 relative pl-4 mt-2 border-l border-border/80 text-xs">
              {diagnostics.recentActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent activity logs recorded.</p>
              ) : (
                diagnostics.recentActivities.map((act: any, idx: number) => {
                  const timeLabel = new Date(act.time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  });
                  return (
                    <div key={idx} className="relative space-y-0.5">
                      <span className="absolute -left-[21px] size-2 rounded-full border bg-background border-indigo-500" />
                      <p className="font-semibold text-foreground">{act.activity}</p>
                      <p className="text-[10px] text-muted-foreground">{act.desc} • {timeLabel}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ===================================================
          DIALOG MODALS
          =================================================== */}

      {/* 1. Edit Profile Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Profile Settings"
        description="Update your personal details visible in achievements cards."
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Full Name:
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Username:
            </label>
            <input
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Short Bio:
            </label>
            <Textarea
              placeholder="e.g. SDE Prep at CrackDSA..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="text-xs h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} size="sm" className="text-xs cursor-pointer shadow-sm">
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 2. Leetcode Connect Dialog */}
      <Dialog
        isOpen={isLeetcodeOpen}
        onClose={() => setIsLeetcodeOpen(false)}
        title="Connect LeetCode Profile"
        description="Add your LeetCode username to sync solved ratios and ranking cards."
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              LeetCode Username:
            </label>
            <input
              type="text"
              value={editLeetcodeUser}
              onChange={(e) => setEditLeetcodeUser(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setIsLeetcodeOpen(false)} className="text-xs cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSaveLeetcodeUser} size="sm" className="text-xs cursor-pointer shadow-sm">
              Connect Username
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
