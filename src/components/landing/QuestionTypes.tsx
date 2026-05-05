import { useState } from "react";
import { BookOpen, Headphones, MessageSquare } from "lucide-react";

type Q = { name: string; isNew?: boolean };
type Tab = { key: string; label: string; icon: typeof BookOpen; items: Q[] };

const tabs: Tab[] = [
  {
    key: "sw",
    label: "Speaking & Writing",
    icon: MessageSquare,
    items: [
      { name: "Read Aloud" },
      { name: "Repeat Sentence" },
      { name: "Describe Image" },
      { name: "Re-tell Lecture" },
      { name: "Answer Short Question" },
      { name: "Respond to a Situation", isNew: true },
      { name: "Summarize Written Text" },
      { name: "Write Essay" },
    ],
  },
  {
    key: "r",
    label: "Reading",
    icon: BookOpen,
    items: [
      { name: "Reading & Writing: Fill in the Blanks" },
      { name: "Multiple Choice, Multiple Answers" },
      { name: "Re-order Paragraphs" },
      { name: "Reading: Fill in the Blanks" },
      { name: "Multiple Choice, Single Answer" },
    ],
  },
  {
    key: "l",
    label: "Listening",
    icon: Headphones,
    items: [
      { name: "Summarize Spoken Text" },
      { name: "Multiple Choice, Multiple Answers" },
      { name: "Fill in the Blanks" },
      { name: "Highlight Correct Summary" },
      { name: "Multiple Choice, Single Answer" },
      { name: "Select Missing Word" },
      { name: "Highlight Incorrect Words" },
      { name: "Write from Dictation" },
      { name: "Summarize Group Discussion", isNew: true },
    ],
  },
];

export const QuestionTypes = () => {
  const [active, setActive] = useState(tabs[0].key);
  const current = tabs.find((t) => t.key === active)!;

  return (
    <section id="question-types" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-medium text-accent uppercase tracking-widest">Coverage</p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold">
            All 22 PTE Question Types — <span className="gradient-text">Updated August 2025</span>
          </h2>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="glass rounded-full p-1.5 inline-flex gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`px-4 md:px-5 py-2.5 rounded-full text-sm font-medium inline-flex items-center gap-2 transition-all ${
                    isActive
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {current.items.map((q, i) => (
            <div
              key={q.name}
              className="glass rounded-xl p-4 flex items-center justify-between transition-all hover:-translate-y-0.5 hover:bg-secondary/40 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-secondary grid place-items-center text-xs font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium">{q.name}</span>
              </div>
              {q.isNew && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-gradient-primary text-primary-foreground">
                  NEW 2025
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
