import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  Flame,
  Sparkles,
  Activity,
  Calendar,
  ExternalLink,
  Share2,
  Edit2,
  Code,
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
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Customization States
  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  
  // Modals Visibility
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLeetcodeOpen, setIsLeetcodeOpen] = useState(false);

  // Temporary edit binds
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLeetcodeUser, setEditLeetcodeUser] = useState("");

  const loadProfileData = async () => {
    try {
      const probRes = await api.get("/problems");
      const revRes = await api.get("/revisions");

      const rawSub = localStorage.getItem("mock_submissions") || "[]";
      const rawCol = localStorage.getItem("mock_collections") || "[]";
      const rawStreaks = localStorage.getItem("mock_streaks") || "[]";

      setProblems(probRes.data);
      setRevisions(revRes.data);
      setSubmissions(JSON.parse(rawSub));
      setCollections(JSON.parse(rawCol));
      setStreaks(JSON.parse(rawStreaks));

      // Set user values
      const name = localStorage.getItem("profile_name") || authUser?.name || "Alex Miller";
      const username = localStorage.getItem("profile_username") || "alex_miller";
      const bio = localStorage.getItem("profile_bio") || "SDE Prep | Targeting Mid-Level placement boards";
      const lcUser = localStorage.getItem("profile_leetcode_username") || "alex_leetcode";

      setProfileName(name);
      setProfileUsername(username);
      setProfileBio(bio);
      setLeetcodeUsername(lcUser);

      // Bind edits
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
  }, []);

  // 1. Save Profile Details
  const handleSaveProfile = () => {
    if (!editName.trim() || !editUsername.trim()) {
      addToast("Name and Username are required.", "warning");
      return;
    }

    localStorage.setItem("profile_name", editName);
    localStorage.setItem("profile_username", editUsername);
    localStorage.setItem("profile_bio", editBio);

    setProfileName(editName);
    setProfileUsername(editUsername);
    setProfileBio(editBio);

    // Sync auth store username
    updateProfile(editName);

    addToast("Profile details updated successfully.", "success");
    setIsEditOpen(false);
  };

  // 2. Save Leetcode username
  const handleSaveLeetcodeUser = () => {
    localStorage.setItem("profile_leetcode_username", editLeetcodeUser);
    setLeetcodeUsername(editLeetcodeUser);
    addToast(`LeetCode profile connected: ${editLeetcodeUser}`, "success");
    setIsLeetcodeOpen(false);
  };

  // 3. Copy share link
  const handleCopyProfileUrl = () => {
    const shareUrl = `crackdsa.co.in/u/${profileUsername}`;
    navigator.clipboard.writeText(shareUrl);
    addToast(`Copied LinkedIn profile link: ${shareUrl}`, "success");
  };

  // Stats Calculations
  const solvedCount = useMemo(() => {
    return problems.filter((p) => {
      return submissions.some((s) => s.problemId === p.id && s.status === "Correct");
    }).length;
  }, [problems, submissions]);

  const progressPercent = problems.length > 0 ? Math.ceil((solvedCount / problems.length) * 100) : 0;
  const revisionsCount = useMemo(() => {
    return revisions.reduce((sum, item) => sum + (item.repetitions || 0), 0);
  }, [revisions]);

  const masteredCount = useMemo(() => {
    return revisions.filter((r) => r.status === "todo" && r.interval >= 15).length;
  }, [revisions]);

  // Current Streak Flame Size
  const currentStreakVal = useMemo(() => {
    if (streaks.length === 0) return 0;
    const sorted = [...new Set(streaks)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

    let count = 0;
    let check = new Date();
    while (true) {
      const checkStr = check.toISOString().split("T")[0];
      if (sorted.includes(checkStr)) {
        count++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [streaks]);

  // Longest Streak simulation
  const longestStreakVal = useMemo(() => {
    return Math.max(currentStreakVal, 18);
  }, [currentStreakVal]);

  // Interview Readiness Score calculations
  const readinessPercent = useMemo(() => {
    if (solvedCount === 0) return 10;
    return Math.min(96, Math.ceil(20 + (solvedCount / problems.length) * 70 + (streaks.length * 0.5)));
  }, [solvedCount, problems, streaks]);

  const getPercentileRank = (percent: number) => {
    if (percent > 90) return "Top 2%";
    if (percent > 70) return "Top 5%";
    if (percent > 50) return "Top 12%";
    return "Top 25%";
  };

  const percentile = getPercentileRank(readinessPercent);

  // SVG circular calculations
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessPercent / 100) * circumference;

  // Generate GitHub Heatmap data (last 52 weeks aligned to Sunday)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 364); // 52 weeks ago
    
    // Align to Sunday
    const startDay = start.getDay();
    start.setDate(start.getDate() - startDay);

    const list = [];
    let cur = new Date(start);
    while (cur <= today) {
      const dateStr = cur.toISOString().split("T")[0];
      
      // Calculate solved count on this day
      const count = submissions.filter(
        (s) => s.status === "Correct" && s.date.startsWith(dateStr)
      ).length;

      list.push({ dateStr, count, dateObj: new Date(cur) });
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }, [submissions]);

  // Generate month labels aligning with the 53 week columns
  const monthLabels = useMemo(() => {
    const labels: { text: string; colIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < 53; w++) {
      const dayIndex = w * 7;
      if (dayIndex >= heatmapData.length) break;
      const date = heatmapData[dayIndex].dateObj;
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({
          text: date.toLocaleString("en-US", { month: "short" }),
          colIndex: w,
        });
        lastMonth = month;
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
              <p className="text-xs text-muted-foreground mt-1">{profileBio}</p>
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

        <div className="flex gap-1.5 text-xs select-none">
          
          {/* Day of Week Labels (Left Side) */}
          <div className="grid grid-rows-7 gap-1.5 pr-1.5 pt-5 text-[9px] text-muted-foreground font-semibold h-[116px] text-right w-6 select-none leading-none">
            <div className="h-3" /> {/* Sun */}
            <div className="h-3 flex items-center justify-end">Mon</div>
            <div className="h-3" /> {/* Tue */}
            <div className="h-3 flex items-center justify-end">Wed</div>
            <div className="h-3" /> {/* Thu */}
            <div className="h-3 flex items-center justify-end">Fri</div>
            <div className="h-3" /> {/* Sat */}
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
                if (item.count === 1) {
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
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/item:block z-50 bg-[#121214] text-white text-[10px] rounded px-2.5 py-1.5 whitespace-nowrap shadow-md pointer-events-none border border-zinc-800 font-medium">
                      {tooltipText}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                    </div>
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
              <Button
                onClick={() => setIsLeetcodeOpen(true)}
                variant="ghost"
                size="xs"
                className="h-6 text-xs text-amber-600 hover:bg-amber-500/10 cursor-pointer"
              >
                Change Username
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 sm:items-center py-2 justify-between">
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
                  href={`https://leetcode.com/${leetcodeUsername}/`}
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
                <span className="font-semibold text-muted-foreground block text-[10px]">Rating</span>
                <span className="text-sm font-bold text-foreground">1,850</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-[10px]">Ranking</span>
                <span className="text-sm font-bold text-foreground">12,402</span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground block text-[10px]">Solved Ratio</span>
                <span className="text-sm font-bold text-foreground">220/500</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-emerald-500 font-bold block text-[9px]">Easy: 45</span>
                <span className="text-amber-500 font-bold block text-[9px]">Med: 120</span>
                <span className="text-rose-500 font-bold block text-[9px]">Hard: 55</span>
              </div>
            </div>
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
                { label: "Problems Solved This Month", val: `${Math.min(solvedCount, 24)} solved` },
                { label: "Revisions This Month", val: `${Math.min(revisionsCount, 18)} revised` },
                { label: "Study Hours logged", val: "35 hours" },
                { label: "Best Streak achieved", val: `${longestStreakVal} days` },
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
              {[
                { activity: "Solved Trapping Rain Water", desc: "Correct submission logged on LeetCode", time: "2 hours ago" },
                { activity: "Revised LRU Cache", desc: "Anki Sm2 confidence set: Good (8d)", time: "1 day ago" },
                { activity: "Created Microsoft Collection", desc: "Playlist roadmap added", time: "3 days ago" },
                { activity: "Completed Today's Revision Queue", desc: "All catches verified", time: "4 days ago" },
              ].map((act, idx) => (
                <div key={idx} className="relative space-y-0.5">
                  <span className="absolute -left-[21px] size-2 rounded-full border bg-background border-indigo-500" />
                  <p className="font-semibold text-foreground">{act.activity}</p>
                  <p className="text-[10px] text-muted-foreground">{act.desc} • {act.time}</p>
                </div>
              ))}
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
