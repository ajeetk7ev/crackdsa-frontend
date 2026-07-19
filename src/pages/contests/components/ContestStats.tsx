import { Trophy, Target, Award, TrendingUp } from "lucide-react";

interface StatsData {
  totalContests: number;
  totalSolved: number;
  totalAttempted: number;
  totalUpsolveTarget: number;
  totalUpsolved: number;
  averageRank: number | null;
  platformBreakdown: Record<string, { contests: number; solved: number }>;
}

interface ContestStatsProps {
  stats: StatsData;
}

export function ContestStats({ stats }: ContestStatsProps) {
  const solveRate =
    stats.totalAttempted > 0
      ? Math.round((stats.totalSolved / (stats.totalSolved + stats.totalAttempted)) * 100)
      : 0;

  const statCards = [
    {
      label: "Contests",
      value: stats.totalContests,
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Questions Solved",
      value: stats.totalSolved,
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Upsolved",
      value: `${stats.totalUpsolved}/${stats.totalUpsolveTarget}`,
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Avg. Rank",
      value: stats.averageRank ? `#${stats.averageRank}` : "—",
      icon: Award,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="p-4 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-tight">{card.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
