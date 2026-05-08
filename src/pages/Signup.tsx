import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthShell, GoogleButton } from "@/components/auth/AuthShell";
import { Loader2 } from "lucide-react";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(100),
  confirm: z.string(),
  targetScore: z.string().min(1, "Select your target score"),
  examDate: z.string().min(1, "Pick your target exam date"),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

const scores = [50, 58, 65, 70, 79, 85, 90];

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", targetScore: "", examDate: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as string] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: {
          full_name: parsed.data.fullName,
          target_score: parsed.data.targetScore,
          target_exam_date: parsed.data.examDate,
        },
      },
    });
    setLoading(false);
    if (error) {
      setErrors({ form: "Something went wrong, please try again" });
      return;
    }
    navigate("/dashboard");
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) { setErrors({ form: "Something went wrong, please try again" }); return; }
    if (result.redirected) return;
    navigate("/dashboard");
  };

  return (
    <AuthShell title="Create your free account" subtitle="Start practicing for PTE Academic in minutes">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input value={form.fullName} onChange={(e) => set("fullName")(e.target.value)} placeholder="Jimmy Khan" className="mt-1.5 bg-secondary/40 border-border" />
          {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="you@example.com" className="mt-1.5 bg-secondary/40 border-border" />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => set("password")(e.target.value)} placeholder="••••••••" className="mt-1.5 bg-secondary/40 border-border" />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>
          <div>
            <Label>Confirm</Label>
            <Input type="password" value={form.confirm} onChange={(e) => set("confirm")(e.target.value)} placeholder="••••••••" className="mt-1.5 bg-secondary/40 border-border" />
            {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Target Score</Label>
            <Select value={form.targetScore} onValueChange={set("targetScore")}>
              <SelectTrigger className="mt-1.5 bg-secondary/40 border-border"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{scores.map((s) => <SelectItem key={s} value={String(s)}>{s}+</SelectItem>)}</SelectContent>
            </Select>
            {errors.targetScore && <p className="mt-1 text-xs text-destructive">{errors.targetScore}</p>}
          </div>
          <div>
            <Label>Exam Date</Label>
            <Input type="date" value={form.examDate} onChange={(e) => set("examDate")(e.target.value)} className="mt-1.5 bg-secondary/40 border-border" />
            {errors.examDate && <p className="mt-1 text-xs text-destructive">{errors.examDate}</p>}
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Free Account"}
        </Button>
        {errors.form && <p className="text-sm text-destructive text-center">{errors.form}</p>}
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton onClick={onGoogle} />

      <p className="mt-6 text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-accent font-medium hover:underline">Login</Link>
      </p>
    </AuthShell>
  );
};

export default Signup;
