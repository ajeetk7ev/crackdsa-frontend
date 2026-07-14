import { Link } from "react-router-dom";
import { Typography } from "@/components/ui/typography";

import { FileText, ClipboardList, Activity, ArrowRight, BookOpen } from "lucide-react";

interface SubmissionsItem {
  id: string;
  problemId: string;
  status: string;
  date: string;
}

interface RevisionItem {
  id: string;
  problemId: string;
  nextReviewDate: string;
}

interface ProblemItem {
  id: string;
  title: string;
  topic: string;
}

interface InsightsProps {
  submissions: SubmissionsItem[];
  revisions: RevisionItem[];
  problems: ProblemItem[];
  notes: Record<string, string>; // user notes dictionary
}

export function Insights({ submissions, revisions, problems, notes }: InsightsProps) {
  // 1. Resolve problem title helper
  const getProblemTitle = (probId: string) => {
    return problems.find((p) => p.id === probId)?.title || "Coding Challenge";
  };

  // 2. Topic progress percentages calculations
  const getTopicProgress = () => {
    const topicsList = ["Array", "Linked List", "Dynamic Programming", "DFS Tree", "Design"];
    return topicsList.map((topic) => {
      const topicProblems = problems.filter((p) => p.topic === topic);
      const totalCount = topicProblems.length;
      
      // count solved items in this topic
      // A problem is solved if there's a correct submission in the submissions history
      const solvedIds = new Set(
        submissions.filter((s) => s.status === "Correct").map((s) => s.problemId)
      );
      const solvedCount = topicProblems.filter((p) => solvedIds.has(p.id)).length;
      const percentage = totalCount > 0 ? Math.ceil((solvedCount / totalCount) * 100) : 0;

      return {
        topic,
        solvedCount,
        totalCount,
        percentage,
      };
    });
  };

  const topicProgress = getTopicProgress();

  // 3. Format Date helper
  const formatCompactDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // 4. Notes previews helper
  const getNotesSnippets = () => {
    const entries = Object.entries(notes);
    if (entries.length === 0) return [];
    
    // entries have format key = "userId_problemId", value = markdown note string
    return entries.slice(0, 2).map(([key, text]) => {
      const parts = key.split("_");
      const problemId = parts[1] || "";
      const snippet = text.length > 50 ? `${text.substring(0, 50)}...` : text;
      
      return {
        problemId,
        title: getProblemTitle(problemId),
        snippet,
      };
    });
  };

  const notesSnippets = getNotesSnippets();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 4.1 Recent Activity Log */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <Activity className="size-4 text-emerald-500" />
            Recent Activity
          </Typography>
          <span className="text-[10px] text-muted-foreground">Historical actions</span>
        </div>

        <div className="flex-1">
          {submissions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                No activity logs recorded. Solve LeetCode problems to start log tracing.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative pl-4 mt-2 border-l border-border/80 text-left">
              {submissions.slice(0, 3).map((sub) => (
                <div key={sub.id} className="relative space-y-1">
                  {/* Timeline circle dot */}
                  <span className={`absolute -left-[21px] size-2 rounded-full border bg-background ${
                    sub.status === "Correct"
                      ? "border-emerald-500"
                      : "border-rose-500"
                  }`} />
                  <p className="text-xs font-semibold text-foreground leading-none">
                    {sub.status === "Correct" ? "Solved" : "Attempted"} "{getProblemTitle(sub.problemId)}"
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Status: {sub.status} • {formatCompactDate(sub.date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4.2 Spacing Queue Decay Forecast */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <ClipboardList className="size-4 text-amber-500" />
            Decay Forecast
          </Typography>
          <span className="text-[10px] text-muted-foreground">Spaced Queue</span>
        </div>

        <div className="flex-1">
          {revisions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                No future revisions scheduled. Add solved problems to activate decay tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {revisions.slice(0, 3).map((rev) => (
                <div key={rev.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-background/50 border border-border/40">
                  <span className="font-semibold truncate max-w-[150px]">{getProblemTitle(rev.problemId)}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Next: {formatCompactDate(rev.nextReviewDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4.3 Topic Solves Ratios */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <BookOpen className="size-4 text-indigo-500" />
            Topic Progress
          </Typography>
          <span className="text-[10px] text-muted-foreground">Solved rates</span>
        </div>

        <div className="flex-1 space-y-3 mt-1.5 text-left">
          {topicProgress.slice(0, 4).map((item) => (
            <div key={item.topic} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span>{item.topic}</span>
                <span className="text-muted-foreground">{item.solvedCount}/{item.totalCount} ({item.percentage}%)</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4.4 Recent Notes Snippets */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <Typography variant="title" className="flex items-center gap-1.5 text-foreground">
            <FileText className="size-4 text-sky-500" />
            Recent Notes
          </Typography>
          <span className="text-[10px] text-muted-foreground">Logic logs</span>
        </div>

        <div className="flex-1">
          {notesSnippets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                No custom notes logged. Document pattern tips inside the problem details interface to view summaries here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-2 text-left">
              {notesSnippets.map((note) => (
                <div key={note.problemId} className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground truncate">{note.title}</span>
                    <Link to={`/problems/${note.problemId}`} className="text-[9px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
                      Open <ArrowRight className="size-2" />
                    </Link>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic leading-relaxed truncate">
                    "{note.snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
