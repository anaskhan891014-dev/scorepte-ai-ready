const stats = [
  { value: "22", label: "Question Types Covered" },
  { value: "<5s", label: "AI Scoring in Seconds" },
  { value: "100%", label: "Free to Start" },
  { value: "Aug 2025", label: "Updated PTE Format" },
];

export const Stats = () => (
  <section className="py-12 md:py-16">
    <div className="container">
      <div className="glass rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
        {stats.map((s) => (
          <div key={s.label} className="p-6 md:p-8 text-center">
            <div className="text-3xl md:text-4xl font-display font-extrabold gradient-text">{s.value}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
