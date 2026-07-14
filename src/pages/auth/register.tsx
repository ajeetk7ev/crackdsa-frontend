import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Typography } from "@/components/ui/typography";
import { Input, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill in all onboarding fields.");
      return;
    }

    if (!agree) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    const success = await register(email, password, name);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Typography variant="h1" className="font-semibold tracking-tight text-foreground text-left">
          Create Account
        </Typography>
        <Typography variant="muted" className="text-left block">
          Start building consistency and recall habits.
        </Typography>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1 text-left">
          <Typography variant="subtitle" className="text-[12px] uppercase tracking-wider text-muted-foreground">
            Full Name
          </Typography>
          <Input
            placeholder="Alex Miller"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

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
          <Typography variant="subtitle" className="text-[12px] uppercase tracking-wider text-muted-foreground">
            Password
          </Typography>
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

        <div className="flex items-center pt-1 text-left">
          <Checkbox
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            label="I accept the Terms and privacy policies."
          />
        </div>

        <Button
          type="submit"
          className="w-full h-9 cursor-pointer mt-2"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
          <UserPlus className="size-4 ml-1" />
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-foreground hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
