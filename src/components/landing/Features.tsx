import { Mic, PencilLine, ClipboardCheck, CalendarRange, Bot, BarChart3, type LucideIcon } from "lucide-react";

type Feature = { icon: LucideIcon; title: string; desc: string };

const features: Feature[] = [
  { icon: Mic, title: "AI Speaking Evaluator", desc: "Real-time pronunciation, fluency and content scoring on every spoken response." },
  { icon: PencilLine, title: "AI Writing Scorer", desc: "Granular feedback on grammar, vocabulary, structure and task achievement." },
  { icon: ClipboardCheck, title: "Full Mock Tests", desc: "Simulates real PTE exam conditions — full 2hr 15min sectioned test flow." },
  { icon: CalendarRange, title: "AI Study Plan", desc: "A personalized daily plan, auto-tuned to your target score and weak areas." },
  { icon: Bot, title: "AI Tutor Chatbot", desc: "24/7 doubt solving with instant explanations, tips and exam strategies." },
  { icon: BarChart3, title: "Performance Dashboard", desc: "Track progress across all 22 question types with deep analytics." },
];

export const Features = () => (
  <section id="features" className="py-20 md:py-28 relative">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-medium text-accent uppercase tracking-widest">Features</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">
          Everything You Need to <span className="gradient-text">Score 90</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          A complete AI-native toolkit, engineered for the August 2025 PTE Academic format.
        </p>
      </div>

      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <article
            key={title}
            className="group relative rounded-2xl glass p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                 style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), hsl(var(--primary)/0.12), transparent 50%)" }} />
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary/10 grid place-items-center ring-1 ring-primary/30">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
