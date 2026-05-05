import { Quote } from "lucide-react";

export const Founder = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm font-medium text-accent uppercase tracking-widest">Founder</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">
          Meet the <span className="gradient-text">Founder</span>
        </h2>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="relative gradient-border rounded-3xl">
          <div className="glass-strong rounded-3xl p-8 md:p-12 grid md:grid-cols-[auto,1fr] gap-8 md:gap-10 items-center">
            <div className="relative mx-auto">
              <div className="absolute -inset-2 rounded-full bg-gradient-primary blur-xl opacity-50" />
              <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-primary grid place-items-center font-display text-5xl md:text-6xl font-extrabold text-primary-foreground ring-4 ring-background">
                J
              </div>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold">Jimmy</h3>
              <p className="mt-1 text-accent font-medium">Founder & CEO, ScorePTE</p>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Jimmy is a 19-year-old from Peshawar, Pakistan — a pre-medical FSc graduate from
                Islamia College Peshawar with one massive dream: to make world-class PTE preparation
                completely free and AI-powered for every student on the planet. ScorePTE is that
                dream, built from zero.
              </p>
              <div className="mt-6 flex gap-3 items-start">
                <Quote className="h-6 w-6 text-accent shrink-0" />
                <p className="font-display text-lg md:text-xl italic text-foreground/90 leading-snug">
                  "Big dreams don't need big budgets. They need big vision."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
