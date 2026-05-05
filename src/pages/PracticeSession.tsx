import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { questions, meta } from "@/lib/practiceBank";
import { SpeakingInterface } from "@/components/practice/SpeakingInterface";
import { WritingInterface } from "@/components/practice/WritingInterface";
import { MCQInterface } from "@/components/practice/MCQInterface";
import { FIBInterface } from "@/components/practice/FIBInterface";
import { ReorderInterface } from "@/components/practice/ReorderInterface";
import { SelectMissingWord } from "@/components/practice/SelectMissingWord";
import { HighlightIncorrect } from "@/components/practice/HighlightIncorrect";
import { WriteFromDictation } from "@/components/practice/WriteFromDictation";

const PracticeSession = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const m = meta[slug];
  const q = questions[slug];

  const next = () => navigate("/practice");

  if (!m || !q) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Question not found.</p>
      </DashboardLayout>
    );
  }

  const renderInterface = () => {
    switch (slug) {
      case "read-aloud":
        return <SpeakingInterface slug={slug} prompt={q.prompt} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "describe-image":
        return <SpeakingInterface slug={slug} prompt={q.prompt} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "respond-to-situation":
        return <SpeakingInterface slug={slug} prompt={q.prompt} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Relevance", "Naturalness", "Fluency"]} questionType={m.name} onNext={next} />;
      case "repeat-sentence":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={0} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "retell-lecture":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;
      case "answer-short-question":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={0} recordSeconds={q.record} criteria={["Accuracy"]} questionType={m.name} onNext={next} />;
      case "summarize-group-discussion":
        return <SpeakingInterface slug={slug} audioOnly prompt={q.audioText} prepSeconds={q.prep} recordSeconds={q.record} criteria={["Content", "Pronunciation", "Fluency"]} questionType={m.name} onNext={next} />;

      case "summarize-written-text":
        return <WritingInterface slug={slug} prompt={q.prompt} minWords={q.minWords} maxWords={q.maxWords} minutes={q.minutes} criteria={["Content", "Grammar", "Vocabulary"]} questionType={m.name} onNext={next} />;
      case "write-essay":
        return <WritingInterface slug={slug} prompt={q.prompt} minWords={q.minWords} maxWords={q.maxWords} minutes={q.minutes} criteria={["Content", "Grammar", "Vocabulary", "Structure", "Linguistic Range"]} questionType={m.name} onNext={next} />;
      case "sst":
        return (
          <div className="space-y-5">
            <AudioBanner text={q.audioText} />
            <WritingInterface slug={slug} prompt={q.audioText} minWords={50} maxWords={70} minutes={10} criteria={["Content", "Grammar", "Vocabulary"]} questionType={m.name} onNext={next} />
          </div>
        );

      case "rw-fib":
        return <FIBInterface slug={slug} q={q} variant="dropdown" questionType={m.name} onNext={next} />;
      case "r-fib":
        return <FIBInterface slug={slug} q={q} variant="drag" questionType={m.name} onNext={next} />;
      case "l-fib":
        return <FIBInterface slug={slug} q={q} variant="type" audio audioText={q.audioText || ""} questionType={m.name} onNext={next} />;

      case "r-mcq-multi":
        return <MCQInterface slug={slug} q={q} multi questionType={m.name} onNext={next} />;
      case "r-mcq-single":
        return <MCQInterface slug={slug} q={q} multi={false} questionType={m.name} onNext={next} />;
      case "l-mcq-multi":
        return <MCQInterface slug={slug} q={q} multi audio questionType={m.name} onNext={next} />;
      case "l-mcq-single":
      case "hcs":
        return <MCQInterface slug={slug} q={q} multi={false} audio questionType={m.name} onNext={next} />;

      case "reorder":
        return <ReorderInterface slug={slug} q={q} questionType={m.name} onNext={next} />;
      case "smw":
        return <SelectMissingWord slug={slug} q={q} questionType={m.name} onNext={next} />;
      case "hiw":
        return <HighlightIncorrect slug={slug} q={q} questionType={m.name} onNext={next} />;
      case "wfd":
        return <WriteFromDictation slug={slug} q={q} questionType={m.name} onNext={next} />;
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <DashboardLayout>
      <button onClick={() => navigate("/practice")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Practice
      </button>
      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">{m.category}</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-extrabold">{m.name}</h1>
        </div>
      </div>
      <div className="mt-6 max-w-3xl mx-auto">{renderInterface()}</div>
    </DashboardLayout>
  );
};

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/practiceUtils";
const AudioBanner = ({ text }: { text: string }) => (
  <div className="glass rounded-2xl p-6 flex items-center justify-between gap-4">
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Audio</p>
      <p className="mt-1 text-sm text-muted-foreground">Listen, then write your summary below (50–70 words).</p>
    </div>
    <Button variant="hero" onClick={() => speak(text)}><Volume2 className="h-4 w-4 mr-2" /> Play</Button>
  </div>
);

export default PracticeSession;
