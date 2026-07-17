import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft } from "lucide-react";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const addToast = useNotificationStore((state: any) => state.addToast);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { password });
      addToast("Password updated successfully! Redirecting to login...", "success");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch {
      addToast("Reset token is invalid or has expired.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Typography variant="h1" className="font-semibold tracking-tight text-foreground text-left">
          Choose Password
        </Typography>
        <Typography variant="muted" className="text-left block">
          Choose a secure password keys for your account.
        </Typography>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1 text-left">
          <Typography variant="subtitle" className="text-[12px] uppercase tracking-wider text-muted-foreground">
            New Password
          </Typography>
          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-1 text-left">
          <Typography variant="subtitle" className="text-[12px] uppercase tracking-wider text-muted-foreground">
            Confirm Password
          </Typography>
          <PasswordInput
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {error && (
          <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 text-left">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-9 cursor-pointer mt-2"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
          <Save className="size-4 ml-1.5" />
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        <Link to="/login" className="inline-flex items-center gap-1 text-foreground hover:underline font-semibold">
          <ArrowLeft className="size-3" /> Cancel
        </Link>
      </p>
    </div>
  );
}
