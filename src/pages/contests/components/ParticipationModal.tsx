import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/loader";
import { Save, Trophy } from "lucide-react";

interface Contest {
  id: string;
  platform: string;
  name: string;
  url: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
}

interface Participation {
  _id: string;
  participated: boolean;
  totalTimeSpent: number;
  totalQuestions: number;
  questionsSolved: number;
  questionsAttempted: number;
  questionsToUpsolve: number;
  upsolvedCount: number;
  rank: number | null;
  ratingChange: number | null;
  problemNumbers: string;
  notes: string;
}

interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: Contest | null;
  existingData: Participation | null;
  onSave: (data: any) => Promise<void>;
}

export function ParticipationModal({
  isOpen,
  onClose,
  contest,
  existingData,
  onSave,
}: ParticipationModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    participated: true,
    totalTimeSpent: 0,
    totalQuestions: 0,
    questionsSolved: 0,
    questionsAttempted: 0,
    questionsToUpsolve: 0,
    upsolvedCount: 0,
    rank: "",
    ratingChange: "",
    problemNumbers: "",
    notes: "",
  });

  // Populate form when existingData changes
  useEffect(() => {
    if (existingData) {
      setForm({
        participated: existingData.participated,
        totalTimeSpent: existingData.totalTimeSpent,
        totalQuestions: existingData.totalQuestions,
        questionsSolved: existingData.questionsSolved,
        questionsAttempted: existingData.questionsAttempted,
        questionsToUpsolve: existingData.questionsToUpsolve,
        upsolvedCount: existingData.upsolvedCount,
        rank: existingData.rank?.toString() || "",
        ratingChange: existingData.ratingChange?.toString() || "",
        problemNumbers: existingData.problemNumbers,
        notes: existingData.notes,
      });
    } else {
      setForm({
        participated: true,
        totalTimeSpent: 0,
        totalQuestions: 0,
        questionsSolved: 0,
        questionsAttempted: 0,
        questionsToUpsolve: 0,
        upsolvedCount: 0,
        rank: "",
        ratingChange: "",
        problemNumbers: "",
        notes: "",
      });
    }
  }, [existingData, isOpen]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        rank: form.rank ? parseInt(form.rank) : null,
        ratingChange: form.ratingChange ? parseInt(form.ratingChange) : null,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!contest) return null;

  const platformBadge =
    contest.platform === "codeforces"
      ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
      : "bg-amber-500/10 border-amber-500/20 text-amber-500";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Log Contest Participation"
      description={`Record your performance for ${contest.name}`}
      className="sm:max-w-xl"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {/* Contest Info Header */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
          <Trophy className="size-5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{contest.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(contest.startTime).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${platformBadge}`}>
            {contest.platform}
          </span>
        </div>

        {/* Participated Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10">
          <span className="text-sm font-medium text-foreground">Did you participate?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateField("participated", true)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                form.participated
                  ? "bg-emerald-500 text-white"
                  : "bg-muted/40 text-muted-foreground border border-border"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => updateField("participated", false)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                !form.participated
                  ? "bg-rose-500 text-white"
                  : "bg-muted/40 text-muted-foreground border border-border"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Questions Stats Grid */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Questions Performance
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Total Questions</label>
              <Input
                type="number"
                min={0}
                value={form.totalQuestions}
                onChange={(e) => updateField("totalQuestions", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Solved</label>
              <Input
                type="number"
                min={0}
                value={form.questionsSolved}
                onChange={(e) => updateField("questionsSolved", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Attempted</label>
              <Input
                type="number"
                min={0}
                value={form.questionsAttempted}
                onChange={(e) => updateField("questionsAttempted", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To Upsolve</label>
              <Input
                type="number"
                min={0}
                value={form.questionsToUpsolve}
                onChange={(e) => updateField("questionsToUpsolve", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Already Upsolved</label>
              <Input
                type="number"
                min={0}
                value={form.upsolvedCount}
                onChange={(e) => updateField("upsolvedCount", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Time Spent (mins)</label>
              <Input
                type="number"
                min={0}
                value={form.totalTimeSpent}
                onChange={(e) => updateField("totalTimeSpent", parseInt(e.target.value) || 0)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Rank & Rating */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Ranking & Rating
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Rank</label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 1234"
                value={form.rank}
                onChange={(e) => updateField("rank", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Rating Change</label>
              <Input
                type="number"
                placeholder="e.g. +45 or -12"
                value={form.ratingChange}
                onChange={(e) => updateField("ratingChange", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Problem Numbers */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Problem Numbers
          </label>
          <Input
            placeholder="e.g. A, B, C1, C2 or 1, 2, 3"
            value={form.problemNumbers}
            onChange={(e) => updateField("problemNumbers", e.target.value)}
            className="h-9 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">
            Comma-separated problem IDs from the platform
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Notes
          </label>
          <Textarea
            placeholder="Key takeaways, mistakes, strategies..."
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="h-20 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <>
                <Spinner className="size-3" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-3" />
                {existingData ? "Update" : "Save"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
