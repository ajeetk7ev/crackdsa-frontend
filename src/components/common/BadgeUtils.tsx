
import { cn } from "@/lib/utils";

// Company Color Badge Mapping
export function CompanyBadge({ company, className }: { company: string; className?: string }) {
  const normalized = company.trim().toLowerCase();
  
  let colorClasses = "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20";

  if (normalized.includes("google")) {
    colorClasses = "bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500/25";
  } else if (normalized.includes("meta") || normalized.includes("facebook")) {
    colorClasses = "bg-blue-600/15 border-blue-600/30 text-blue-300 hover:bg-blue-600/25";
  } else if (normalized.includes("amazon")) {
    colorClasses = "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25";
  } else if (normalized.includes("microsoft")) {
    colorClasses = "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25";
  } else if (normalized.includes("apple")) {
    colorClasses = "bg-zinc-400/15 border-zinc-400/30 text-zinc-200 hover:bg-zinc-400/25";
  } else if (normalized.includes("uber")) {
    colorClasses = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25";
  } else if (normalized.includes("netflix")) {
    colorClasses = "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25";
  } else if (normalized.includes("goldman")) {
    colorClasses = "bg-yellow-500/15 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25";
  } else if (normalized.includes("bloomberg")) {
    colorClasses = "bg-purple-500/15 border-purple-500/30 text-purple-400 hover:bg-purple-500/25";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors shadow-xs",
        colorClasses,
        className
      )}
    >
      {company}
    </span>
  );
}

// Topic Color Badge Mapping (Text-only, no background or border)
export function TopicBadge({ topic, className }: { topic: string; className?: string }) {
  const normalized = topic.trim().toLowerCase();

  let textClass = "text-muted-foreground font-medium";

  if (normalized.includes("dp") || normalized.includes("dynamic programming") || normalized.includes("knapsack")) {
    textClass = "text-purple-400 font-semibold";
  } else if (normalized.includes("graph") || normalized.includes("dijkstra") || normalized.includes("dsu")) {
    textClass = "text-indigo-400 font-semibold";
  } else if (normalized.includes("tree") || normalized.includes("bst") || normalized.includes("binary tree")) {
    textClass = "text-emerald-400 font-semibold";
  } else if (normalized.includes("array") || normalized.includes("matrix") || normalized.includes("2d")) {
    textClass = "text-sky-400 font-semibold";
  } else if (normalized.includes("pointer") || normalized.includes("sliding window")) {
    textClass = "text-cyan-400 font-semibold";
  } else if (normalized.includes("string") || normalized.includes("kmp")) {
    textClass = "text-amber-400 font-semibold";
  } else if (normalized.includes("list") || normalized.includes("linked")) {
    textClass = "text-teal-400 font-semibold";
  } else if (normalized.includes("stack") || normalized.includes("queue") || normalized.includes("deque")) {
    textClass = "text-orange-400 font-semibold";
  } else if (normalized.includes("search") || normalized.includes("binary search")) {
    textClass = "text-blue-400 font-semibold";
  } else if (normalized.includes("recursion") || normalized.includes("backtracking")) {
    textClass = "text-pink-400 font-semibold";
  } else if (normalized.includes("heap") || normalized.includes("priority")) {
    textClass = "text-yellow-400 font-semibold";
  } else if (normalized.includes("bit")) {
    textClass = "text-lime-400 font-semibold";
  } else if (normalized.includes("trie")) {
    textClass = "text-violet-400 font-semibold";
  } else if (normalized.includes("segment") || normalized.includes("fenwick")) {
    textClass = "text-fuchsia-400 font-semibold";
  } else if (normalized.includes("greedy")) {
    textClass = "text-rose-400 font-semibold";
  }

  return (
    <span className={cn("text-xs font-semibold tracking-wide", textClass, className)}>
      {topic}
    </span>
  );
}
