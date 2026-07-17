import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@/stores/notification.store";
import { Typography } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const addToast = useNotificationStore((state: any) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      addToast("Password recovery link sent successfully!", "success");
    } catch {
      addToast("Failed to dispatch recovery email. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Typography variant="h1" className="font-semibold tracking-tight text-foreground text-left">
          Reset Password
        </Typography>
        <Typography variant="muted" className="text-left block">
          We will send recovery instructions to your email.
        </Typography>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <Typography variant="subtitle" className="text-[12px] uppercase tracking-wider text-muted-foreground">
              Email Address
            </Typography>
            <Input
              placeholder="alex@developer.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-9 cursor-pointer mt-2"
            disabled={loading}
          >
            {loading ? "Sending link..." : "Send Reset Link"}
            <Mail className="size-4 ml-1.5" />
          </Button>
        </form>
      ) : (
        <div className="p-4 rounded-xl border border-success/20 bg-success/5 text-left space-y-2 animate-in fade-in">
          <Typography variant="title" className="text-success">Email Dispatched</Typography>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please check your inbox at <span className="font-semibold text-foreground">{email}</span>. Follow the reset link to update password.
          </p>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        <Link to="/login" className="inline-flex items-center gap-1 text-foreground hover:underline font-semibold">
          <ArrowLeft className="size-3" /> Back to Sign In
        </Link>
      </p>
    </div>
  );
}
