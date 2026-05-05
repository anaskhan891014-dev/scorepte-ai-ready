import { Sparkles, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

const cols = [
  { title: "Product", links: ["Practice", "Mock Tests", "AI Tutor", "Study Plan", "Pricing"] },
  { title: "Resources", links: ["PTE Guide 2025", "Question Types", "Score Calculator", "Blog", "Help Center"] },
  { title: "Company", links: ["About", "Founder", "Contact", "Privacy", "Terms"] },
];

export const Footer = () => (
  <footer className="border-t border-border/60 mt-10">
    <div className="container py-14">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <a href="#home" className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            Score<span className="gradient-text">PTE</span>
          </a>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            The world's most AI-powered PTE Academic preparation platform. Free forever.
          </p>
          <div className="mt-5 flex gap-3">
            {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-lg glass grid place-items-center text-muted-foreground hover:text-foreground transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-semibold text-sm">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ScorePTE. Built with vision, from Peshawar to the world.</p>
        <p>Made for dreamers · Free forever</p>
      </div>
    </div>
  </footer>
);
