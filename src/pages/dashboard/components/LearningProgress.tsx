import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Typography } from "@/components/ui/typography";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { Spinner } from "@/components/ui/loader";

interface WeeklyDay {
  date: string;
  day: string;
  count: number;
}

interface ConsistencyDot {
  date: string;
  dayLabel: string;
  count: number;
}

interface DashboardAnalytics {
  overall: {
    solvedCount: number;
    totalProblems: number;
    percentage: number;
    difficultyBreakdown: { Easy: number; Medium: number; Hard: number };
  };
  weeklyProgress: WeeklyDay[];
  totalWeeklySolves: number;
  streak: {
    current: number;
    longest: number;
  };
  consistencyDots: ConsistencyDot[];
  readiness: {
    score: number;
    grade: string;
    masteredCount: number;
  };
}

export function LearningProgress() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/progress/dashboard-analytics");
        setAnalytics(res.data.data);
      } catch {
        // Silently fail — cards will show zero states
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-card h-52 flex items-center justify-center">
            <Spinner className="size-5 text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <p className="text-xs text-muted-foreground">Unable to load analytics data.</p>
      </div>
    );
  }

  const { overall, weeklyProgress, totalWeeklySolves, streak, consistencyDots, readiness } = analytics;

  // Circular gauge calculations
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall.percentage / 100) * circumference;

  // Weekly chart bar heights
  const maxWeeklyCount = Math.max(...weeklyProgress.map((d) => d.count), 1);
  const maxBarHeight = 40;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Overall Progress Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Overall Progress
        </Typography>

        <div className="flex items-center gap-6 py-2">
          {/* Circular SVG Progress */}
          <div className="relative size-20 shrink-0 flex items-center justify-center select-none">
            <svg className="size-full -rotate-90">
              <circle cx="40" cy="40" r={radius} className="stroke-muted fill-none" strokeWidth="5" />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-primary fill-none transition-all duration-500 ease-out"
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-semibold text-foreground">{overall.percentage}%</span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-light text-foreground">
              {overall.solvedCount} <span className="text-xs text-muted-foreground">Solved</span>
            </p>
            <p className="text-[11px] text-muted-foreground leading-none">
              Total directory: {overall.totalProblems} items
            </p>
          </div>
        </div>

        {/* Difficulty breakdown pills */}
        <div className="flex gap-2 text-[10px] font-semibold">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Easy {overall.difficultyBreakdown.Easy}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Med {overall.difficultyBreakdown.Medium}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Hard {overall.difficultyBreakdown.Hard}
          </span>
        </div>
      </div>

      {/* 2. Interview Readiness Index */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Readiness Index
          <TrendingUp className="size-3.5 text-indigo-500" />
        </Typography>

        <div className="space-y-1">
          <p className="text-3xl font-light text-foreground">
            {readiness.score} <span className="text-xs font-semibold text-muted-foreground">/ 1000</span>
          </p>
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {readiness.grade}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {readiness.score < 700
              ? "Solve harder questions and maintain daily streaks to boost your readiness grade."
              : "✓ High rating. Your topic coverage indicates strong technical readiness."}
          </p>
          <p className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{readiness.masteredCount}</span> problems mastered
          </p>
        </div>
      </div>

      {/* 3. Weekly Progress Chart */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Weekly Progress
          </Typography>
          <span className="text-[10px] font-semibold text-primary">
            {totalWeeklySolves} solve{totalWeeklySolves !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end justify-between h-14 px-1 pt-2">
          {weeklyProgress.map((dayData, idx) => {
            const barH = dayData.count > 0 ? Math.max(6, (dayData.count / maxWeeklyCount) * maxBarHeight) : 4;
            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1" title={`${dayData.date}: ${dayData.count} solved`}>
                {dayData.count > 0 && (
                  <span className="text-[8px] font-semibold text-primary">{dayData.count}</span>
                )}
                <div
                  className={`w-4 rounded-t transition-all duration-300 ${
                    dayData.count > 0 ? "bg-primary" : "bg-muted/80"
                  }`}
                  style={{ height: `${barH}px` }}
                />
              </div>
            );
          })}
        </div>

        {/* Day labels from backend (accurate weekday names) */}
        <div className="flex justify-between text-[9px] text-muted-foreground border-t border-border/40 pt-2 px-1">
          {weeklyProgress.map((dayData, idx) => (
            <span key={idx} className="flex-1 text-center">{dayData.day}</span>
          ))}
        </div>
      </div>

      {/* 4. Consistency Streak Calendar */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Current Streak
          <Flame className="size-3.5 text-amber-500 fill-amber-500/20" />
        </Typography>

        <div className="space-y-1">
          <p className="text-3xl font-light text-foreground">
            {streak.current} <span className="text-xs font-semibold text-muted-foreground">Days active</span>
          </p>
          {streak.longest > 0 && (
            <p className="text-[10px] text-muted-foreground">
              Best: <span className="font-semibold text-foreground">{streak.longest}</span> days
            </p>
          )}
        </div>

        {/* Streak dots grid (14 days) */}
        <div className="grid grid-cols-7 gap-1">
          {consistencyDots.map((dot, idx) => (
            <div
              key={idx}
              title={`${dot.date}: ${dot.count > 0 ? `${dot.count} solved` : "No solves"}`}
              className={`size-3 rounded-sm border flex items-center justify-center text-[7px] font-bold ${
                dot.count > 0
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:bg-emerald-500/20"
                  : "bg-muted/30 border-border text-transparent"
              }`}
            >
              ✓
            </div>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground flex items-center justify-between">
          <span>14-day history</span>
          <span className="font-semibold text-foreground flex items-center gap-0.5">
            <Sparkles className="size-3 text-amber-500" /> {streak.longest > streak.current ? "Keep going!" : "On fire!"}
          </span>
        </div>
      </div>
    </div>
  );
}
