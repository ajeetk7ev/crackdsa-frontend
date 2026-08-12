import { Trophy, Clock, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  rank: number;
  user: {
    firstname: string;
    lastname: string;
    username: string;
    avatar?: string;
  };
  score: number;
  totalPoints: number;
  scorePercent: number;
  totalTimeTaken: number;
  status: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  currentUserId?: string;
}

const rankMedals: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export function LeaderboardTable({
  entries,
  pagination,
  onPageChange,
}: LeaderboardTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground w-16">Rank</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Score</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Time</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Trophy className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No attempts yet. Be the first!</p>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.user?.username}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-center">
                    {rankMedals[entry.rank] ? (
                      <span className="text-lg">{rankMedals[entry.rank]}</span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {entry.user?.avatar ? (
                        <img src={entry.user.avatar} alt="" className="size-7 rounded-full object-cover" />
                      ) : (
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {entry.user?.firstname?.[0] || "?"}{entry.user?.lastname?.[0] || ""}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {entry.user?.firstname} {entry.user?.lastname}
                        </p>
                        <p className="text-[10px] text-muted-foreground">@{entry.user?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-emerald-500">{entry.scorePercent}%</span>
                    <span className="text-[10px] text-muted-foreground ml-1">({entry.score}/{entry.totalPoints})</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {entry.totalTimeTaken >= 60
                        ? `${Math.floor(entry.totalTimeTaken / 60)}m ${entry.totalTimeTaken % 60}s`
                        : `${entry.totalTimeTaken}s`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      entry.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                      {entry.status === "completed" ? "Completed" : "Timed Out"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
