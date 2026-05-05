import { Sparkles, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Question Types", href: "#question-types" },
  { label: "How it works", href: "#how" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-elegant" : "bg-transparent"
      }`}
    >
      <nav className="container flex h-16 md:h-18 items-center justify-between">
        <a href="#home" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span>
            Score<span className="gradient-text">PTE</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="relative transition-colors hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gradient-primary after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login"><Button variant="glass" size="lg">Login</Button></Link>
          <Link to="/signup"><Button variant="hero" size="lg">Get Started Free</Button></Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg glass"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass-strong border-t border-border animate-fade-in">
          <ul className="container py-4 flex flex-col gap-3">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="block py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setOpen(false)}><Button variant="glass" className="w-full">Login</Button></Link>
              <Link to="/signup" onClick={() => setOpen(false)}><Button variant="hero" className="w-full">Get Started Free</Button></Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
