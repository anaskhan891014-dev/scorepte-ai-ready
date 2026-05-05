import { ArrowRight, Play, Sparkles, Mic, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section id="home" className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-pattern" aria-hidden />
      <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" aria-hidden />
      <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" aria-hidden />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-accent/60 animate-float"
          style={{
            top: `${15 + i * 12}%`,
            left: `${8 + i * 14}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${5 + i}s`,
          }}
          aria-hidden
        />
      ))}

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Updated for the August 2025 PTE Academic Format
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] animate-fade-in" style={{ animationDelay: "0.1s" }}>
            The World's Most{" "}
            <span className="gradient-text bg-[length:200%_200%] animate-gradient-shift">AI-Powered</span>{" "}
            PTE Preparation Platform
          </h1>

          <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Practice all 22 PTE question types with real-time AI scoring. Free forever.
            Built for dreamers worldwide.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/signup">
              <Button variant="hero" size="xl" className="group">
                Start Practicing Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#how">
              <Button variant="glass" size="xl" className="group">
                <Play className="mr-2 h-4 w-4" />
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* Mockup card */}
        <div className="mt-16 md:mt-24 mx-auto max-w-4xl animate-scale-in" style={{ animationDelay: "0.5s" }}>
          <div className="relative gradient-border rounded-2xl">
            <div className="glass-strong rounded-2xl p-4 md:p-6 shadow-elegant">
              {/* Window chrome */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-destructive/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">scorepte.com / practice / read-aloud</div>
                <div className="w-12" />
              </div>

              <div className="grid md:grid-cols-5 gap-4">
                <div className="md:col-span-3 rounded-xl glass p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Mic className="h-3.5 w-3.5 text-accent" />
                    Read Aloud · Question 3 of 6
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-foreground/90">
                    "The advancement of artificial intelligence has fundamentally transformed
                    how we approach education, enabling personalized learning experiences at an
                    unprecedented scale across global classrooms."
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button className="relative h-12 w-12 rounded-full bg-gradient-primary glow grid place-items-center">
                      <Mic className="h-5 w-5 text-primary-foreground" />
                      <span className="absolute inset-0 rounded-full ring-2 ring-accent/40 animate-ping" />
                    </button>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-primary rounded-full relative overflow-hidden">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">00:24</span>
                  </div>
                </div>

                <div className="md:col-span-2 rounded-xl glass p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground">AI Score</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Excellent</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-display font-extrabold gradient-text">87</span>
                    <span className="text-muted-foreground text-sm mb-2">/ 90</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      { label: "Pronunciation", value: 92 },
                      { label: "Fluency", value: 88 },
                      { label: "Content", value: 81 },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{m.label}</span>
                          <span className="tabular-nums">{m.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${m.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    Detailed feedback ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
