import { UserPlus, Gauge, Rocket } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create your free account", desc: "Sign up in 30 seconds — no credit card, no commitments. Free forever access." },
  { icon: Gauge, title: "Take an AI diagnostic test", desc: "A quick adaptive test pinpoints your strengths, gaps and target band." },
  { icon: Rocket, title: "Get your personalized plan", desc: "Start practicing with a daily AI-curated study plan built around your goals." },
];

export const HowItWorks = () => (
  <section id="how" className="py-20 md:py-28 relative">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-medium text-accent uppercase tracking-widest">How it works</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">
          From zero to <span className="gradient-text">exam-ready</span> in 3 steps
        </h2>
      </div>

      <div className="relative mt-16 grid md:grid-cols-3 gap-6">
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {steps.map(({ icon: Icon, title, desc }, idx) => (
          <div key={title} className="relative glass rounded-2xl p-7 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary grid place-items-center glow">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="mt-4 inline-flex items-center justify-center h-6 px-3 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-secondary text-muted-foreground">
              Step {idx + 1}
            </div>
            <h3 className="mt-3 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
