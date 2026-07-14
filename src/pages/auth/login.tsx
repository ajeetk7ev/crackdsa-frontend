import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Typography } from "@/components/ui/typography";
import { Input, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Sparkles } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all credentials fields.");
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    }
  };

  const handleQuickLogin = async (role: "student" | "admin") => {
    const credentials = {
      student: { e: "alex@developer.com", p: "Password123" },
      admin: { e: "admin@crackdsa.com", p: "Password123" },
    };
    const { e, p } = credentials[role];
    setEmail(e);
    setPassword(p);
    const success = await login(e, p);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Typography variant="h1" className="font-semibold tracking-tight text-foreground text-left">
          Welcome Back
        </Typography>
        <Typography variant="muted" className="text-left block">
          Enter credentials below to resume revisions.
        </Typography>
      </div>

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
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <Typography variant="subtitle" className="text-[12px] uppercase tracking-wider text-muted-foreground">
              Password
            </Typography>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 text-left">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <Checkbox label="Remember this device" />
        </div>

        <Button
          type="submit"
          className="w-full h-9 cursor-pointer mt-2"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
          <LogIn className="size-4 ml-1" />
        </Button>
      </form>

      {/* Guest Login buttons */}
      <div className="relative pt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or quick demo login
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => handleQuickLogin("student")}
          disabled={isLoading}
          className="text-xs cursor-pointer"
        >
          <Sparkles className="size-3 text-amber-500 mr-1" /> Student Demo
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => handleQuickLogin("admin")}
          disabled={isLoading}
          className="text-xs cursor-pointer"
        >
          <Sparkles className="size-3 text-indigo-500 mr-1" /> Admin Demo
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/auth/register" className="text-foreground hover:underline font-semibold">
          Create Account
        </Link>
      </p>
    </div>
  );
}
