import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Typography } from "@/components/ui/typography";
import { Input, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notification = useNotificationStore();

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await login(email, password, rememberMe);

     

      if (result.success) {
        navigate("/dashboard");
        return;
      } 

      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {       
        setFieldErrors(result.fieldErrors);
      } else if (result.error) {
        notification.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth: redirect the browser to the backend route.
  // The backend handles the full OAuth flow and redirects back to /auth/google/success.
  const handleGoogleLogin = () => {
    console.log(import.meta.env.VITE_API_URL + "/auth/google");
    window.location.href = import.meta.env.VITE_API_URL + "/auth/google";
  };

  return (
    <div className="w-full space-y-6">

      {/* Title */}
      <div className="space-y-2">
        <Typography variant="h1" className="font-bold tracking-tight text-foreground text-left text-2xl md:text-3xl">
          Resume Your DSA Journey
        </Typography>
        <Typography variant="muted" className="text-left text-xs md:text-sm block">
          Mastery requires consistency. Sign in to review today's due problems and log new solutions.
        </Typography>
      </div>

      {/* Google Authentication Button */}
      <Button
        variant="outline"
        type="button"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="w-full h-10 cursor-pointer text-xs font-semibold flex items-center justify-center gap-2 border border-border bg-card hover:bg-muted/50 text-foreground transition-all shadow-sm rounded-lg"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/80" />
        </div>
        <div className="relative bg-background px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider select-none">
          Or continue with email
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1 text-left">
          <Typography variant="subtitle" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Email Address
          </Typography>
          <Input
            placeholder="alex@developer.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg h-9 border border-border/80 focus:border-foreground"
          />
          {fieldErrors.email && (
            <p className="text-[11px] text-destructive font-medium">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <Typography variant="subtitle" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Password
            </Typography>
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg h-9 border border-border/80 focus:border-foreground"
          />
          {fieldErrors.password && (
            <p className="text-[11px] text-destructive font-medium">{fieldErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            label="Remember this device for 30 days"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 cursor-pointer mt-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
         
        </Button>
      </form>

      {/* Tip Box */}
      <div className="p-3 border border-border/60 bg-muted/20 dark:bg-muted/5 rounded-xl text-left space-y-1.5">
        <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
          <Lightbulb className="size-3.5" /> Interview Prep Tip
        </span>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Active recall triggers the Ebbinghaus retention threshold. Try coding from scratch for 15 minutes before referencing past solutions.
        </p>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-foreground hover:underline font-semibold">
          Create Account
        </Link>
      </p>
    </div>
  );
}
