import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, GoogleButton } from "@/components/auth/AuthShell";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(100),
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setLoading(false);
    if (error) {
      setErrors({ form: "Something went wrong, please try again" });
      return;
    }
    navigate("/dashboard");
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) {
      setErrors({ form: "Something went wrong, please try again" });
      setGoogleLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate("/dashboard");
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your PTE prep journey">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 bg-secondary/40 border-border" />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 bg-secondary/40 border-border" />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
        </Button>
        {errors.form && <p className="text-sm text-destructive text-center">{errors.form}</p>}
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={onGoogle} loading={googleLoading} />

      <p className="mt-6 text-sm text-center text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-accent font-medium hover:underline">Sign Up</Link>
      </p>
    </AuthShell>
  );
};

export default Login;
