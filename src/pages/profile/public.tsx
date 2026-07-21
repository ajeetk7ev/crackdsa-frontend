import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/axios";
import { Typography } from "@/components/ui/typography";
import { Spinner } from "@/components/ui/loader";

import {
  Flame,
  Sparkles,
  Activity,
  Calendar,
  ExternalLink,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import leetcodeLogo from "@/assets/LeetCode_logo_black.png";



export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();

  // Core Data State
  const [profileUser, setProfileUser] = useState<any>(null);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // LeetCode API Stats States
  const [leetcodeStats, setLeetcodeStats] = useState<any>(null);

  const fetchLeetcodeStats = async (lcUser: string) => {
    try {
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${lcUser}/profile`);
      if (response.ok) {
        const data = await response.json();
        if (!data.errors && !data.message && typeof data.totalSolved === "number") {
          setLeetcodeStats(data);
        }
      }
    } catch (err) {
      console.error("Failed to load LeetCode statistics:", err);
    }
  };

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/auth/public/${username}`);
        const { user, progressList, diagnostics } = response.data.data;
        setProfileUser(user);
        setProgressList(progressList);
        setDiagnostics(diagnostics);

        if (user.leetcodeUsername) {
          fetchLeetcodeStats(user.leetcodeUsername);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || "User profile not found.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  // Stats Calculations
  const solvedCount = useMemo(() => {
    return progressList.filter(
      (p) => ["Solved", "Revised Once", "Revised Twice", "Mastered"].includes(p.status)
    ).length;
  }, [progressList]);

  const masteredCount = useMemo(() => {
    return progressList.filter((p) => p.status === "Mastered").length;
  }, [progressList]);

  const currentStreakVal = profileUser?.streak?.current || 0;
  const longestStreakVal = profileUser?.streak?.longest || 0;

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
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs text-muted-foreground">Loading public profile details...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="py-20 text-center space-y-3 max-w-md mx-auto">
        <div className="size-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ⚠️
        </div>
        <Typography variant="h2" className="text-foreground">Profile Not Found</Typography>
        <p className="text-xs text-muted-foreground">
          {error || "The requested user profile does not exist or has been deactivated."}
        </p>
      </div>
    );
  }

  const profileName = profileUser.firstname || profileUser.lastname 
    ? `${profileUser.firstname} ${profileUser.lastname}`.trim() 
    : "DSA Scholar";

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left px-6 py-8">
      
      {/* 1. ROW 1: HERO SECTION & INTERVIEW READINESS DIAGNOSTICS */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch">
        
        {/* HERO PROFILE CARD */}
        <div className="flex flex-col p-6 rounded-xl border border-border bg-card shadow-sm justify-between gap-4 h-full">
          <div className="flex items-center gap-4">
            {profileUser.avatar ? (
              <img
                src={profileUser.avatar}
                alt="Profile Avatar"
                className="size-16 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-2xl uppercase">
                {profileName?.[0] || "A"}
              </div>
            )}

            <div className="space-y-1">
              <Typography variant="h1" className="font-semibold text-foreground">
                {profileName}
              </Typography>
              <p className="text-xs text-muted-foreground font-mono">@{profileUser.username}</p>
              {profileUser.bio && <p className="text-xs text-muted-foreground mt-1">{profileUser.bio}</p>}
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                <Calendar className="size-3" /> Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-border/30">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Public Scholar Card</span>
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
                  className="stroke-primary fill-none transition-all duration-500 ease-out"
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
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Stats card 1 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Solved Problems</span>
          <p className="text-2xl font-light text-foreground">{solvedCount}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Study queue active
          </span>
        </div>

        {/* Stats card 2 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Consistency Streak</span>
          <p className="text-2xl font-light text-foreground flex items-center gap-1.5">
            <Flame className="size-6 text-amber-500 fill-amber-500/10 animate-pulse" />
            {currentStreakVal} <span className="text-xs text-muted-foreground font-normal">Days current</span>
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
            Longest streak record: {longestStreakVal} days
          </span>
        </div>

        {/* Stats card 3 */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28 hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Mastered Concepts</span>
          <p className="text-2xl font-light text-foreground flex items-center gap-1.5">
            <Sparkles className="size-6 text-purple-500 fill-purple-500/10" />
            {masteredCount} <span className="text-xs text-muted-foreground font-normal">Problems</span>
          </p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
            Perfect revision recall status
          </span>
        </div>

      </div>

      {/* 3. ROW 3: HEATMAP CALENDAR */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <Typography variant="title" className="text-foreground flex items-center gap-1.5">
            <Activity className="size-4 text-emerald-500" />
            2026 Solves & Revision Grid
          </Typography>
          <span className="text-[10px] text-muted-foreground font-semibold">Study tracker showing daily active solves and recall reps.</span>
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

      {/* 4. ROW 4: DUAL COLUMN PUBLIC OVERVIEWS */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch">
        
        {/* LEETCODE CONNECTED API STATS CARD */}
        {profileUser.leetcodeUsername && leetcodeStats ? (
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-border/30 pb-3">
                <div className="flex items-center gap-2">
                  <img src={leetcodeLogo} alt="LeetCode" className="size-5 object-contain dark:invert" />
                  <div>
                    <Typography variant="title" className="text-foreground block">
                      LeetCode Profile
                    </Typography>
                    <p className="text-[10px] text-muted-foreground">Connected account stats</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full uppercase">
                  Connected
                </span>
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
            
            <div className="pt-4 text-right">
              <a
                href={`https://leetcode.com/u/${profileUser.leetcodeUsername}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-lg border border-border text-[10px] font-semibold text-foreground hover:bg-muted/50 cursor-pointer inline-flex items-center gap-1 shadow-sm"
              >
                View LeetCode Profile
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm text-center flex flex-col items-center justify-center py-10 space-y-2">
            <span className="text-xl">🔗</span>
            <Typography variant="title" className="text-foreground">LeetCode Disconnected</Typography>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              This user has not synced their personal LeetCode statistics.
            </p>
          </div>
        )}

        {/* PREMIUM SHARABLE CARD EMBED */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
          <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
            Public Achievement Badge
          </Typography>

          <div className="relative overflow-hidden p-6 rounded-xl border border-zinc-800/80 bg-gradient-to-br from-[#08080a] via-[#121215] to-[#1c1c22] text-white flex flex-col justify-between h-48 shadow-2xl max-w-md mx-auto group">
            {/* Background abstract gradient flow */}
            <div className="absolute -right-20 -top-20 size-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 size-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-3">
                {profileUser.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt="Avatar"
                    className="size-11 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="size-11 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-base uppercase">
                    {profileName?.[0] || "A"}
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-sm font-extrabold text-white tracking-tight">{profileName}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">crackdsa.co.in/u/{profileUser.username}</p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 uppercase">
                  CrackDSA
                </span>
                <span className="text-[8px] font-medium text-zinc-500">Verified Scholar</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-900/60 my-2 z-10 text-center">
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Streak</span>
                <span className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  🔥 {currentStreakVal} Days
                </span>
              </div>
              <div className="space-y-0.5 border-x border-zinc-900/60">
                <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Solved</span>
                <span className="text-xs font-bold text-white">
                  {solvedCount} Qs
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] text-zinc-500 uppercase font-semibold block">Readiness</span>
                <span className="text-xs font-bold text-emerald-400">
                  {readinessPercent}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center z-10 text-[9px] text-zinc-400">
              <span className="font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-300 font-mono">
                {percentile} SDE Grade
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">
                Joined {new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
export default PublicProfilePage;
