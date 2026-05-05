import { ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Brain, ClipboardList, MessageCircle, CalendarDays, BarChart3, Settings,
  Sparkles, LogOut, Menu, X, Target,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: Brain },
  { to: "/mock-tests", label: "Mock Tests", icon: ClipboardList },
  { to: "/ai-tutor", label: "AI Tutor", icon: MessageCircle },
  { to: "/study-plan", label: "Study Plan", icon: CalendarDays },
  { to: "/performance", label: "Performance", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

type Profile = { full_name: string | null; target_score: number | null };

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, target_score").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const onLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const Sidebar = (
    <aside className="h-full w-64 shrink-0 glass-strong border-r border-border flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </span>
        <span className="font-display font-bold text-lg">Score<span className="gradient-text">PTE</span></span>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="hidden md:block">{Sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 sticky top-0 z-30 glass-strong border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden p-2 rounded-lg glass" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="font-semibold truncate">{profile?.full_name || user?.email?.split("@")[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile?.target_score && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full glass">
                <Target className="h-3.5 w-3.5 text-accent" /> Target {profile.target_score}
              </span>
            )}
            <div className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-sm font-bold text-primary-foreground ring-2 ring-background">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
