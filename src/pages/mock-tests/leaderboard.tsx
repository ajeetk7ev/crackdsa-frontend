import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { LeaderboardTable } from "./components/LeaderboardTable";
import { Trophy, ArrowLeft } from "lucide-react";

export function MockTestLeaderboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useNotificationStore((state: any) => state.addToast);

  const [test, setTest] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const [testRes, lbRes] = await Promise.all([
          api.get(`/mock-tests/${id}`),
          api.get(`/mock-tests/${id}/leaderboard?page=${page}&limit=15`),
        ]);

        const testData = testRes.data.data?.mockTest || testRes.data.data?.test;
        setTest(testData);
        setEntries(lbRes.data.data.entries);
        setPagination(lbRes.data.data.pagination);
      } catch (err: any) {
        addToast(err?.response?.data?.message || "Failed to load leaderboard.", "error");
      } finally {
        setLoading(false);
      }
    },
    [id, addToast]
  );

  useEffect(() => {
    fetchLeaderboard(1);
  }, [fetchLeaderboard]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Button>
          <div>
            <Typography variant="h2" className="font-bold text-foreground flex items-center gap-2 text-xl">
              <Trophy className="size-5 text-primary" />
              Leaderboard
            </Typography>
            {test && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {test.title} · {test.difficulty} · {test.durationMinutes} min
              </p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/mock-tests`)}
          className="text-xs cursor-pointer"
        >
          All Mock Tests
        </Button>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="p-8 rounded-xl border border-border bg-card animate-pulse space-y-4">
          <div className="h-6 w-1/4 rounded bg-muted/60" />
          <div className="h-48 rounded bg-muted/30" />
        </div>
      ) : (
        <LeaderboardTable
          entries={entries}
          pagination={pagination}
          onPageChange={(p) => fetchLeaderboard(p)}
        />
      )}
    </div>
  );
}
