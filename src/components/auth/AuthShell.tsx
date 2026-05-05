import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ReactNode } from "react";

export const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="relative min-h-screen overflow-hidden bg-background text-foreground grid place-items-center px-4 py-10">
    <div className="absolute inset-0 grid-pattern" aria-hidden />
    <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" aria-hidden />
    <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" aria-hidden />
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute h-1.5 w-1.5 rounded-full bg-accent/60 animate-float"
        style={{ top: `${10 + i * 13}%`, left: `${6 + i * 15}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${5 + i}s` }}
        aria-hidden
      />
    ))}

    <div className="relative w-full max-w-md animate-scale-in">
      <Link to="/" className="flex items-center justify-center gap-2 font-display font-bold text-xl mb-6">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary glow">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </span>
        <span>Score<span className="gradient-text">PTE</span></span>
      </Link>
      <div className="gradient-border rounded-2xl">
        <div className="glass-strong rounded-2xl p-7 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-center">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  </div>
);

export const GoogleButton = ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="w-full inline-flex items-center justify-center gap-3 h-11 rounded-lg glass hover:bg-secondary/60 text-sm font-medium transition disabled:opacity-60"
  >
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.7 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
    Continue with Google
  </button>
);
