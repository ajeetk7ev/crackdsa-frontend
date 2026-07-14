import { useAuthStore } from "@/stores/auth.store";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar } from "lucide-react";

interface WelcomeHeaderProps {
  dueCount: number;
  onStartRevisions: () => void;
}

export function WelcomeHeader({ dueCount, onStartRevisions }: WelcomeHeaderProps) {
  const user = useAuthStore((state) => state.user);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-xl border border-border bg-card shadow-sm gap-4">
      <div className="space-y-1">
        <Typography variant="h1" className="font-semibold text-foreground flex items-center gap-2">
          {getGreeting()}, {user?.name || "Developer"} <Sparkles className="size-5 text-amber-500 fill-amber-500/10" />
        </Typography>
        <p className="text-sm text-muted-foreground">
          {dueCount > 0
            ? `You have ${dueCount} spaced-repetition revision items scheduled for today.`
            : "Your revision queue is fully caught up for today. Keep building consistency!"}
        </p>
      </div>

      <div className="shrink-0">
        <Button
          onClick={onStartRevisions}
          variant="default"
          className="w-full md:w-auto h-10 px-5 cursor-pointer shadow-sm flex items-center gap-2"
        >
          <Calendar className="size-4" />
          Start Daily Revisions
        </Button>
      </div>
    </div>
  );
}
