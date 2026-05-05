import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { QuestionTypes } from "@/components/landing/QuestionTypes";
import { Testimonials } from "@/components/landing/Testimonials";
import { Founder } from "@/components/landing/Founder";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <QuestionTypes />
        <Testimonials />
        <Founder />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
