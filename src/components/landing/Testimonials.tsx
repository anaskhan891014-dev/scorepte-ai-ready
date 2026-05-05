import { Star } from "lucide-react";

const items = [
  { name: "Aisha K.", country: "🇵🇰 Pakistan", score: 86, quote: "Scored 86 in my first attempt! The AI feedback on speaking was a game-changer — felt like having a personal coach.", initials: "AK" },
  { name: "Daniel O.", country: "🇳🇬 Nigeria", score: 82, quote: "I tried 3 platforms before ScorePTE. Nothing comes close to the depth of feedback. And it's actually free.", initials: "DO" },
  { name: "Priya S.", country: "🇮🇳 India", score: 89, quote: "The mock tests felt identical to the real exam. The AI study plan kept me consistent for 6 weeks straight.", initials: "PS" },
];

export const Testimonials = () => (
  <section className="py-20 md:py-28">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-medium text-accent uppercase tracking-widest">Loved worldwide</p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">
          Stories from <span className="gradient-text">real dreamers</span>
        </h2>
      </div>

      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <article
            key={t.name}
            className="glass rounded-2xl p-7 flex flex-col transition-all hover:-translate-y-1 hover:shadow-glow animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-1 text-accent">
              {[...Array(5)].map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
            <div className="mt-6 flex items-center gap-3 pt-5 border-t border-border/60">
              <div className="h-11 w-11 rounded-full bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground">
                {t.initials}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.country}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-extrabold gradient-text leading-none">{t.score}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
