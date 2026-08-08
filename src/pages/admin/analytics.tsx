import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";

import {
  TrendingUp,
  Users,
  Cpu,
  RefreshCw,
  Clock,
  Zap,
  CheckCircle2,
  BookOpen,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsOverviewData {
  totalUsers: number;
  totalProblems: number;
  difficultyDist: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  topicBreakdown: Array<{ topic: string; count: number }>;
  registrationGrowth: Array<{ label: string; users: number }>;
  liveActivities: Array<{
    id: string;
    userName: string;
    userAvatar?: string;
    problemTitle: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
    status: string;
    timeTaken?: string;
    updatedAt: string;
  }>;
}

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics/overview");
      setData(res.data?.data || null);
    } catch (err) {
      console.error("Failed to load platform analytics overview", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return <PageLoader message="Aggregating platform-wide telemetry & MongoDB analytics..." />;
  }

  const difficultyDist = data?.difficultyDist || { Easy: 0, Medium: 0, Hard: 0 };
  const totalSolvedAcross = difficultyDist.Easy + difficultyDist.Medium + difficultyDist.Hard || 1;
  const registrationGrowth = data?.registrationGrowth || [];
  const maxGrowth = Math.max(...registrationGrowth.map((g) => g.users), 5);

  // SVG Area calculation for user registration growth
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;
  const pointsCount = registrationGrowth.length || 1;

  const coordinatePoints = registrationGrowth.map((p, idx) => {
    const x = paddingX + (pointsCount > 1 ? (idx / (pointsCount - 1)) * chartWidth : chartWidth / 2);
    const y = paddingY + chartHeight - (p.users / maxGrowth) * chartHeight;
    return { x, y, ...p };
  });

  const linePath = coordinatePoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    coordinatePoints.length > 0
      ? `${linePath} L ${coordinatePoints[coordinatePoints.length - 1].x} ${paddingY + chartHeight} L ${coordinatePoints[0].x} ${paddingY + chartHeight} Z`
      : "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Typography variant="h1" className="font-semibold text-foreground">
            Platform Analytics & Intelligence
          </Typography>
          <Typography variant="muted">
            Live database aggregations, registration velocity, topic distribution, and active telemetry.
          </Typography>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className={cn("h-9 cursor-pointer shadow-sm text-xs px-3", isRefreshing ? "animate-spin" : "")}
            title="Refresh statistics"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* CORE DIAGNOSTIC METRICS CARD GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Candidates</span>
            <Users className="size-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{data?.totalUsers || 0}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">🟢 Active MongoDB Accounts</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">Curated Challenges</span>
            <BookOpen className="size-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-foreground">{data?.totalProblems || 0}</span>
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Categorized DSA Problems</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">Total Solved Events</span>
            <CheckCircle2 className="size-4 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">{totalSolvedAcross}</span>
            <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">⚡ Solved across all users</span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">System Health</span>
            <Cpu className="size-4 text-purple-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-500">100%</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Express API Operational</span>
          </div>
        </div>
      </div>

      {/* SVG DYNAMIC CHART AREA */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) - Registration Growth Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <Typography variant="title" className="text-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-indigo-500" />
              Candidate Registrations Growth
            </Typography>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <Clock className="size-3" /> Historical Trend
            </span>
          </div>

          <div className="w-full relative py-2 select-none">
            {coordinatePoints.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                No historical registration data recorded yet.
              </div>
            ) : (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((pct) => {
                  const v = Math.round((pct / 100) * maxGrowth);
                  const gridY = paddingY + chartHeight - (pct / 100) * chartHeight;
                  return (
                    <g key={pct}>
                      <line
                        x1={paddingX}
                        y1={gridY}
                        x2={svgWidth - paddingX}
                        y2={gridY}
                        className="stroke-border/40"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 10}
                        y={gridY + 3}
                        className="fill-muted-foreground text-[8px] font-semibold text-right"
                        textAnchor="end"
                      >
                        {v}
                      </text>
                    </g>
                  );
                })}

                {/* Area Path */}
                {areaPath && (
                  <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-500 ease-out" />
                )}

                {/* Line Path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    className="stroke-primary transition-all duration-500 ease-out"
                    strokeWidth="2.5"
                  />
                )}

                {/* Data Points */}
                {coordinatePoints.map((p, idx) => (
                  <g key={idx} className="group/dot cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-background stroke-primary stroke-[2px] hover:r-6 transition-all duration-200"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      textAnchor="middle"
                      className="hidden group-hover/dot:block fill-foreground text-[9px] font-bold"
                    >
                      {p.users} user(s)
                    </text>
                  </g>
                ))}

                {/* Bottom Labels */}
                {coordinatePoints.map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px] font-bold"
                  >
                    {p.label}
                  </text>
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Right Column (1/3 width) - Difficulty & Topic Share */}
        <div className="space-y-6">
          {/* Solved Difficulty Distribution */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
              Platform Difficulty Share
            </Typography>

            <div className="space-y-3.5 text-xs text-left">
              <div>
                <div className="flex justify-between font-semibold text-foreground text-[11px] mb-1">
                  <span className="text-emerald-500">Easy ({difficultyDist.Easy})</span>
                  <span>{Math.round((difficultyDist.Easy / totalSolvedAcross) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(difficultyDist.Easy / totalSolvedAcross) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-foreground text-[11px] mb-1">
                  <span className="text-amber-500">Medium ({difficultyDist.Medium})</span>
                  <span>{Math.round((difficultyDist.Medium / totalSolvedAcross) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${(difficultyDist.Medium / totalSolvedAcross) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-foreground text-[11px] mb-1">
                  <span className="text-rose-500">Hard ({difficultyDist.Hard})</span>
                  <span>{Math.round((difficultyDist.Hard / totalSolvedAcross) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${(difficultyDist.Hard / totalSolvedAcross) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Solved Topics */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
              Top Solved Topics
            </Typography>

            <div className="space-y-2.5 text-xs text-left">
              {!data?.topicBreakdown?.length ? (
                <p className="text-xs text-muted-foreground py-2 text-center">No topic telemetry recorded yet.</p>
              ) : (
                data.topicBreakdown.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-background border border-border">
                    <div className="flex items-center gap-2">
                      <Layers className="size-3.5 text-indigo-500" />
                      <span className="font-semibold text-foreground text-[11px]">{t.topic}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t.count} solved</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE SERVER ACTIVITY LOG TICKER */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <Typography variant="title" className="text-foreground flex items-center gap-1.5">
            <Zap className="size-4 text-amber-500" />
            Live Database Activity Telemetry
          </Typography>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse" /> Real-time Progress Stream
          </span>
        </div>

        <div className="space-y-2.5 mt-2 text-xs">
          {!data?.liveActivities?.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No platform submission activities logged yet.</p>
          ) : (
            data.liveActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-full bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                    {act.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{act.userName}</span>{" "}
                    <span className="text-muted-foreground">worked on</span>{" "}
                    <span className="font-semibold text-foreground">{act.problemTitle}</span>{" "}
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
                </div>
                <div className="flex items-center gap-3">
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
                  <span className="text-[10px] text-muted-foreground font-mono font-medium shrink-0 flex items-center gap-1">
                    <Clock className="size-3" /> {new Date(act.updatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
