import { ClipboardCheck, Target, TrendingUp, Clock, Trophy } from "lucide-react";

interface MockTestStatsProps {
  stats: {
    testsTaken: number;
    avgScorePercent: number;
    bestScorePercent: number;
    totalTimeMinutes: number;
    totalSolved: number;
  };
}

export function MockTestStats({ stats }: MockTestStatsProps) {
  const cards = [
    {
      label: "Tests Taken",
      value: stats.testsTaken,
      icon: ClipboardCheck,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Avg Score",
      value: `${stats.avgScorePercent}%`,
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Best Score",
      value: `${stats.bestScorePercent}%`,
      icon: Trophy,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Time",
      value: stats.totalTimeMinutes >= 60
        ? `${Math.floor(stats.totalTimeMinutes / 60)}h ${stats.totalTimeMinutes % 60}m`
        : `${stats.totalTimeMinutes}m`,
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Problems Solved",
      value: stats.totalSolved,
      icon: TrendingUp,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${card.bg}`}>
              <card.icon className={`size-3.5 ${card.color}`} />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              {card.label}
            </span>
          </div>
          <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
