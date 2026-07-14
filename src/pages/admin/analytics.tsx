import { useState, useEffect } from "react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

import {
  TrendingUp,
  Users,
  Cpu,
  Database,
  RefreshCw,
  Clock,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TimeRange = "24h" | "7d" | "30d";

interface ActivityPoint {
  label: string;
  load: number;
  users: number;
}

const DATA_SETS: Record<TimeRange, ActivityPoint[]> = {
  "24h": [
    { label: "00:00", load: 24, users: 15 },
    { label: "04:00", load: 12, users: 8 },
    { label: "08:00", load: 45, users: 38 },
    { label: "12:00", load: 78, users: 95 },
    { label: "16:00", load: 88, users: 110 },
    { label: "20:00", load: 62, users: 80 },
    { label: "24:00", load: 35, users: 40 },
  ],
  "7d": [
    { label: "Mon", load: 65, users: 180 },
    { label: "Tue", load: 78, users: 210 },
    { label: "Wed", load: 58, users: 195 },
    { label: "Thu", load: 92, users: 275 },
    { label: "Fri", load: 84, users: 240 },
    { label: "Sat", load: 42, users: 130 },
    { label: "Sun", load: 48, users: 155 },
  ],
  "30d": [
    { label: "Wk 1", load: 52, users: 650 },
    { label: "Wk 2", load: 74, users: 820 },
    { label: "Wk 3", load: 83, users: 940 },
    { label: "Wk 4", load: 69, users: 790 },
  ],
};

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live simulator user actions
  const [liveLogs, setLiveLogs] = useState<Array<{ id: number; text: string; time: string }>>([
    { id: 1, text: "Alex Miller completed Two Sum correct submissions list.", time: "1m ago" },
    { id: 2, text: "Admin added candidate questions to dynamic programming catalog.", time: "4m ago" },
    { id: 3, text: "Robin Hood synchronized LeetCode stats split values.", time: "8m ago" },
    { id: 4, text: "User registry token issued for user 'sarah_codes'.", time: "12m ago" },
  ]);

  // Simulate incoming live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      const usersList = ["Alex Miller", "sarah_codes", "Robin Hood", "kunal_sde", "priya_sharma"];
      const problemsList = ["Two Sum", "LRU Cache", "Trapping Rain Water", "Valid Parentheses", "Merge Intervals"];
      
      const user = usersList[Math.floor(Math.random() * usersList.length)];
      const prob = problemsList[Math.floor(Math.random() * problemsList.length)];
      
      const newLog = {
        id: Date.now(),
        text: `${user} solved ${prob} and logged spacing confidence.`,
        time: "Just now",
      };

      setLiveLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const points = DATA_SETS[range];
  const maxLoad = 100;
  
  // Calculate SVG Area coordinates dynamically
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const pointsCount = points.length;

  const coordinatePoints = points.map((p, idx) => {
    const x = paddingX + (idx / (pointsCount - 1)) * chartWidth;
    const y = paddingY + chartHeight - (p.load / maxLoad) * chartHeight;
    return { x, y, ...p };
  });

  const linePath = coordinatePoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = coordinatePoints.length > 0
    ? `${linePath} L ${coordinatePoints[coordinatePoints.length - 1].x} ${paddingY + chartHeight} L ${coordinatePoints[0].x} ${paddingY + chartHeight} Z`
    : "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Typography variant="h1" className="font-semibold text-foreground">
            Platform Analytics
          </Typography>
          <Typography variant="muted">
            Platform request logs, student active rates, and system performance diagnostics.
          </Typography>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border border-border bg-card p-1 text-xs">
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1 rounded font-semibold transition-colors cursor-pointer select-none",
                  range === r
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleRefreshData}
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
            <span className="text-[9px] font-bold uppercase tracking-wider">Telemetry Load</span>
            <Cpu className="size-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">42.4%</span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">🟢 Uptime: 99.98%</span>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">Active Sessions</span>
            <Users className="size-4 text-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-foreground">248</span>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Real-time active counts</span>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">API Invocations</span>
            <Activity className="size-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">84,124</span>
            <span className="text-[10px] text-indigo-500 font-semibold block mt-0.5">⚡ Last updated just now</span>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm text-left flex flex-col justify-between h-28">
          <div className="flex justify-between items-start text-muted-foreground">
            <span className="text-[9px] font-bold uppercase tracking-wider">Mock DB Footprint</span>
            <Database className="size-4 text-indigo-500" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">342 KB</span>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Indexed in LocalStorage</span>
          </div>
        </div>

      </div>

      {/* SVG DYNAMIC CHART AREA */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column (2/3 width) - SVG Graph */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <Typography variant="title" className="text-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-indigo-500" />
              Platform Traffic Over time
            </Typography>
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <Clock className="size-3" /> Average Load Indicator (%)
            </span>
          </div>

          <div className="w-full relative py-2 select-none">
            {/* Custom Responsive SVG Chart */}
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 overflow-visible"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((v) => {
                const gridY = paddingY + chartHeight - (v / 100) * chartHeight;
                return (
                  <g key={v}>
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
                      {v}%
                    </text>
                  </g>
                );
              })}

              {/* Area Path */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#areaGrad)"
                  className="transition-all duration-500 ease-out"
                />
              )}

              {/* Line Path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  className="stroke-primary transition-all duration-500 ease-out"
                  strokeWidth="2"
                />
              )}

              {/* Data Points Tooltip circles */}
              {coordinatePoints.map((p, idx) => (
                <g key={idx} className="group/dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    className="fill-background stroke-primary stroke-[2px] hover:r-6 transition-all duration-200"
                  />
                  {/* Tooltip Overlay */}
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="hidden group-hover/dot:block fill-foreground text-[9px] font-bold"
                  >
                    {p.load}% Load ({p.users} users)
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
          </div>
        </div>

        {/* Right Column (1/3 width) - Distribution & Channels */}
        <div className="space-y-6">
          
          {/* DSA Topic Distribution */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
              DSA Topic Share
            </Typography>

            <div className="space-y-3.5 text-xs text-left">
              {[
                { label: "Dynamic Programming", pct: 42, color: "bg-indigo-500" },
                { label: "Arrays & Arrays lists", pct: 28, color: "bg-emerald-500" },
                { label: "Graph Traversal Loops", pct: 18, color: "bg-amber-500" },
                { label: "HashMaps & Sets structures", pct: 12, color: "bg-rose-500" },
              ].map((topic) => (
                <div key={topic.label} className="space-y-1">
                  <div className="flex justify-between font-semibold text-foreground text-[11px]">
                    <span>{topic.label}</span>
                    <span>{topic.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full transition-all", topic.color)} style={{ width: `${topic.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Channels */}
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
            <Typography variant="title" className="text-foreground border-b border-border pb-3 block">
              Referral Channels
            </Typography>

            <div className="space-y-3 text-xs text-left">
              {[
                { channel: "Direct Workspace Link", count: 485, pct: 45 },
                { channel: "LeetCode redirects", count: 320, pct: 35 },
                { channel: "LinkedIn achievement cards", count: 184, pct: 20 },
              ].map((c) => (
                <div key={c.channel} className="flex justify-between items-center p-2.5 rounded bg-background border border-border">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground text-[11px] block">{c.channel}</span>
                    <span className="text-[9px] text-muted-foreground">{c.count} views</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-500">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* LIVE SERVER ACTIVITY LOG TICKER */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <Typography variant="title" className="text-foreground flex items-center gap-1.5">
            <Zap className="size-4 text-amber-500" />
            Live Platform Event Stream
          </Typography>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse" /> Live Telemetry
          </span>
        </div>

        <div className="space-y-3 mt-2 text-xs">
          {liveLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <span className="font-semibold text-foreground">{log.text}</span>
              <span className="text-[10px] text-muted-foreground font-mono font-medium shrink-0 ml-4 flex items-center gap-1">
                <Clock className="size-3" /> {log.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
