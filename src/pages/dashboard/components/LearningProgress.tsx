import { Typography } from "@/components/ui/typography";
import { Flame, Sparkles, TrendingUp } from "lucide-react";

interface LearningProgressProps {
  solvedCount: number;
  totalCount: number;
  streaks: string[]; // dates array
}

export function LearningProgress({ solvedCount, totalCount, streaks }: LearningProgressProps) {
  // 1. Overall Progress circular SVG gauge calculations
  const total = totalCount || 100;
  const solved = solvedCount;
  const percentage = Math.min(100, Math.ceil((solved / total) * 100));

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // 2. Weekly progress calculations: solve count for the last 7 days
  const getWeeklySolves = () => {
    const today = new Date();
    const dates = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - idx));
      return d.toISOString().split("T")[0];
    });

    return dates.map((dateStr) => {
      // count correct submissions on this date
      return streaks.includes(dateStr) ? 1 : 0;
    });
  };

  const weeklyData = getWeeklySolves();
  const maxBarHeight = 35; // px

  // 3. Interview Readiness Index score simulator
  const computeReadinessScore = () => {
    if (solvedCount === 0) return 100;
    // score builds based on number solved, maxing out at 950
    return Math.min(950, Math.ceil(150 + (solvedCount / total) * 750 + (streaks.length * 5)));
  };
  const readinessScore = computeReadinessScore();

  const getReadinessGrade = (score: number) => {
    if (score < 300) return "Needs Practice";
    if (score < 600) return "Early Prep";
    if (score < 800) return "Ready for Intern/Junior";
    return "Ready for Mid-Level SDE";
  };

  // 4. Consistency Calendar dots: last 14 days
  const getCalendarDots = () => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - idx));
      const dateStr = d.toISOString().split("T")[0];
      const isSolved = streaks.includes(dateStr);
      
      const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });

      return {
        dateStr,
        isSolved,
        dayName,
      };
    });
  };

  const calendarDots = getCalendarDots();

  // Streak size logic
  const calculateCurrentStreak = () => {
    if (streaks.length === 0) return 0;
    const sortedDates = [...new Set(streaks)].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // If no solve today or yesterday, streak is broken
    if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let checkDate = new Date();
    // Start checking from today
    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (sortedDates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const activeStreak = calculateCurrentStreak();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 3.1 Overall Progress Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Overall Progress
        </Typography>

        <div className="flex items-center gap-6 py-2">
          {/* Circular SVG Progress */}
          <div className="relative size-20 shrink-0 flex items-center justify-center select-none">
            <svg className="size-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-muted fill-none"
                strokeWidth="5"
              />
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
            <span className="absolute text-sm font-semibold text-foreground">
              {percentage}%
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-light text-foreground">
              {solved} <span className="text-xs text-muted-foreground">Solved</span>
            </p>
            <p className="text-[11px] text-muted-foreground leading-none">
              Total directory: {total} items
            </p>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground">
          Track completions across arrays, trees, and logic topics.
        </div>
      </div>

      {/* 3.2 Interview Readiness Index */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Readiness Index
          <TrendingUp className="size-3.5 text-indigo-500" />
        </Typography>

        <div className="space-y-1">
          <p className="text-3xl font-light text-foreground">
            {readinessScore} <span className="text-xs font-semibold text-muted-foreground">/ 1000</span>
          </p>
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {getReadinessGrade(readinessScore)}
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {readinessScore < 700
            ? "Your scoring index is building. Solve Hard questions to boost readiness grades."
            : "✓ High rating. Your topic speed averages indicate strong technical readiness."}
        </p>
      </div>

      {/* 3.3 Weekly Progress Chart */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Weekly Progress
        </Typography>

        {/* SVG columns chart */}
        <div className="flex items-end justify-between h-12 px-1 pt-2">
          {weeklyData.map((val, idx) => {
            const h = val > 0 ? maxBarHeight : 4; // minimum visual block
            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-4 rounded-t transition-all duration-300 ${
                    val > 0 ? "bg-primary" : "bg-muted/80"
                  }`}
                  style={{ height: `${h}px` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[9px] text-muted-foreground border-t border-border/40 pt-2 px-1">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      {/* 3.4 Consistency Streak Calendar */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <Typography variant="subtitle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          Current Streak
          <Flame className="size-3.5 text-amber-500 fill-amber-500/20" />
        </Typography>

        <div className="space-y-1">
          <p className="text-3xl font-light text-foreground">
            {activeStreak} <span className="text-xs font-semibold text-muted-foreground">Days active</span>
          </p>
        </div>

        {/* Streak dots grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDots.map((dot, idx) => (
            <div
              key={idx}
              title={`${dot.dateStr}: ${dot.isSolved ? "Solved" : "Not solved"}`}
              className={`size-3 rounded-sm border flex items-center justify-center text-[7px] font-bold ${
                dot.isSolved
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
            <Sparkles className="size-3 text-amber-500" /> 1 freeze safe
          </span>
        </div>
      </div>
    </div>
  );
}
