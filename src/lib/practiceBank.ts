export type Difficulty = "Easy" | "Medium" | "Hard";
export type SpeakingQ = { prompt: string; modelHint?: string; prep?: number; record: number };
export type WritingQ = { prompt: string; minWords: number; maxWords: number; minutes: number };
export type AudioQ = { audioText: string; prompt?: string; prep?: number; record?: number };
export type MCQQ = { passage?: string; audioText?: string; question: string; options: string[]; correct: number[] };
export type FIBQ = { template: string; bank: string[]; correct: string[]; audioText?: string };
export type ReorderQ = { items: { id: string; text: string }[]; correct: string[] };
export type WFDQ = { audioText: string };
export type HIWQ = { transcript: string; spoken: string };
export type SMWQ = { audioText: string; options: string[]; correct: number };
export type PracticeQuestion = { id: string; slug: string; number: number; difficulty: Difficulty; preview: string; data: any };

export const meta: Record<string, { name: string; category: "speaking" | "writing" | "reading" | "listening" }> = {
  "read-aloud": { name: "Read Aloud", category: "speaking" },
  "repeat-sentence": { name: "Repeat Sentence", category: "speaking" },
  "describe-image": { name: "Describe Image", category: "speaking" },
  "retell-lecture": { name: "Re-tell Lecture", category: "speaking" },
  "answer-short-question": { name: "Answer Short Question", category: "speaking" },
  "summarize-group-discussion": { name: "Summarize Group Discussion", category: "speaking" },
  "respond-to-situation": { name: "Respond to a Situation", category: "speaking" },
  "summarize-written-text": { name: "Summarize Written Text", category: "writing" },
  "write-essay": { name: "Write Essay", category: "writing" },
  "rw-fib": { name: "R&W Fill in the Blanks", category: "reading" },
  "r-mcq-multi": { name: "Multiple Choice (Multiple)", category: "reading" },
  reorder: { name: "Re-order Paragraphs", category: "reading" },
  "r-fib": { name: "Reading Fill in the Blanks", category: "reading" },
  "r-mcq-single": { name: "Multiple Choice (Single)", category: "reading" },
  sst: { name: "Summarize Spoken Text", category: "listening" },
  "l-mcq-multi": { name: "Multiple Choice (Multiple)", category: "listening" },
  "l-fib": { name: "Listening Fill in the Blanks", category: "listening" },
  hcs: { name: "Highlight Correct Summary", category: "listening" },
  "l-mcq-single": { name: "Multiple Choice (Single)", category: "listening" },
  smw: { name: "Select Missing Word", category: "listening" },
  hiw: { name: "Highlight Incorrect Words", category: "listening" },
  wfd: { name: "Write from Dictation", category: "listening" },
};

const topics = ["artificial intelligence", "climate adaptation", "precision medicine", "ancient history", "space exploration", "renewable energy", "digital education", "global economics", "cultural heritage", "marine science"];
const verbs = ["transformed", "influenced", "accelerated", "challenged", "strengthened", "reshaped", "expanded", "supported", "limited", "improved"];
const diffs: Difficulty[] = ["Easy", "Medium", "Hard"];
const diff = (i: number) => diffs[i % 3];
const topic = (i: number) => topics[i % topics.length];
const id = (slug: string, i: number) => `${slug}-${String(i + 1).padStart(3, "0")}`;
const preview = (text: string) => text.replace(/\s+/g, " ").slice(0, 96);
const make = (slug: string, data: any, i: number): PracticeQuestion => ({ id: id(slug, i), slug, number: i + 1, difficulty: diff(i), preview: preview(data.prompt || data.audioText || data.passage || data.template || data.question || data.transcript || meta[slug].name), data });

const paragraph = (i: number) => `Recent research in ${topic(i)} has ${verbs[i % verbs.length]} the way universities, governments and industries make long-term decisions. Although early studies focused on technical progress, current evidence highlights social impact, ethical responsibility and measurable public benefits. These findings suggest that careful planning is essential when new ideas move from laboratories into everyday life.`;
const sentence = (i: number) => `The university library extended its digital archive after students requested broader access to research on ${topic(i)}.`;
const lecture = (i: number) => `Today we examined ${topic(i)} and its impact on modern society. The lecture explained three points: first, innovation can create economic opportunity; second, regulation protects the public; and third, education helps communities adapt to rapid change. A key example showed how local institutions used evidence-based planning to improve outcomes.`;
const passage = (i: number) => `${paragraph(i)} In addition, experts argue that collaboration across disciplines reduces risk because it combines technical knowledge with practical experience. However, funding limitations and public trust remain major barriers.`;
const correctWord = (i: number) => ["innovation", "evidence", "policy", "research", "technology", "education", "culture", "medicine", "climate", "economy"][i % 10];

const buildQuestion = (slug: string, i: number): any => {
  const t = topic(i);
  switch (slug) {
    case "read-aloud": return { prompt: paragraph(i), prep: 35, record: 40 } as SpeakingQ;
    case "repeat-sentence": return { audioText: sentence(i), prep: 0, record: 15 } as AudioQ;
    case "describe-image": return { prompt: `Describe the line chart showing investment in ${t} from 2014 to 2024. It rises from ${10 + i % 12}% to ${48 + i % 32}%, with a brief dip in 2020 and the fastest growth after 2021.`, prep: 25, record: 40 } as SpeakingQ;
    case "retell-lecture": return { audioText: lecture(i), prep: 10, record: 40 } as AudioQ;
    case "answer-short-question": return { audioText: [`What do we call a scientist who studies the oceans?`, `Which instrument is used to measure temperature?`, `What is the opposite of increase?`, `What do people use to borrow books?`, `Which planet is known as the red planet?`][i % 5], record: 10 } as AudioQ;
    case "summarize-group-discussion": return { audioText: `Speaker A: ${t} can improve productivity when institutions invest early. Speaker B: It may widen inequality if access is limited. Speaker C: A balanced strategy should combine funding, training and clear public guidelines.`, prep: 10, record: 120 } as AudioQ;
    case "respond-to-situation": return { prompt: `A classmate is worried about presenting research on ${t} tomorrow. Respond supportively, give practical advice and encourage them to stay confident.`, prep: 10, record: 40 } as SpeakingQ;
    case "summarize-written-text": return { prompt: passage(i), minWords: 5, maxWords: 75, minutes: 10 } as WritingQ;
    case "write-essay": return { prompt: `Some people believe investment in ${t} should be led by governments, while others think private companies are more effective. Discuss both views and give your opinion.`, minWords: 200, maxWords: 300, minutes: 20 } as WritingQ;
    case "rw-fib": return { template: `Many universities now {0} courses on ${t} because employers {1} graduates with analytical skills. Recent studies have {2} that interdisciplinary learning improves career outcomes.`, bank: ["offer", "avoid", "prefer", "reject", "shown", "ignored", "limited"], correct: ["offer", "prefer", "shown"] } as FIBQ;
    case "r-mcq-multi": return { passage: passage(i), question: `Which statements are supported by the passage?`, options: ["Collaboration can reduce risk", "Funding is never a problem", "Public trust can be a barrier", "Only technical knowledge matters"], correct: [0, 2] } as MCQQ;
    case "reorder": return { items: [{ id: "a", text: `${t[0].toUpperCase()}${t.slice(1)} has become an important subject for public debate.` }, { id: "b", text: "Researchers first identified the main challenges through small pilot studies." }, { id: "c", text: "Larger projects then tested whether the findings worked in real communities." }, { id: "d", text: "As a result, policymakers began to design more evidence-based programs." }], correct: ["a", "b", "c", "d"] } as ReorderQ;
    case "r-fib": return { template: `Scholars have long {0} the relationship between ${t} and social change. New evidence {1} that public engagement can {2} long-term results.`, bank: ["studied", "ignored", "suggests", "denies", "improve", "damage"], correct: ["studied", "suggests", "improve"] } as FIBQ;
    case "r-mcq-single": return { passage: passage(i), question: "What is the main idea of the passage?", options: [`${t} requires planning, collaboration and public trust`, `${t} has no connection to society`, "Funding barriers have disappeared", "Technical progress alone solves every problem"], correct: [0] } as MCQQ;
    case "sst": return { audioText: lecture(i), record: 0 } as AudioQ;
    case "l-mcq-multi": return { audioText: lecture(i), question: "Which points were mentioned in the lecture?", options: ["Innovation can create opportunity", "Regulation protects the public", "Education helps adaptation", "All research should stop"], correct: [0, 1, 2] } as MCQQ;
    case "l-fib": return { audioText: `The lecture argued that ${correctWord(i)} should be supported by careful planning and public discussion.`, template: `The lecture argued that {0} should be supported by careful {1} and public {2}.`, bank: [], correct: [correctWord(i), "planning", "discussion"] } as FIBQ;
    case "hcs": return { audioText: lecture(i), question: "Choose the best summary.", options: [`The lecture says ${t} has social and economic effects and requires planning.`, `The lecture only describes ancient history.`, "The speaker argues education is unnecessary.", "The recording is mainly about sports funding."], correct: [0] } as MCQQ;
    case "l-mcq-single": return { audioText: lecture(i), question: "What is the speaker's main point?", options: [`${t} should be managed through evidence and education`, "Innovation has no risks", "Only private companies matter", "Communities cannot adapt"], correct: [0] } as MCQQ;
    case "smw": return { audioText: `Most researchers agree that successful projects depend on reliable`, options: ["evidence", "weather", "fiction", "silence"], correct: 0 } as SMWQ;
    case "hiw": return { transcript: `The committee decided to approve the new education policy after several months of careful discussion and review.`, spoken: `The committee decided to reject the new education policy after several weeks of careful discussion and replay.` } as HIWQ;
    case "wfd": return { audioText: sentence(i) } as WFDQ;
    default: return { prompt: paragraph(i) };
  }
};

export const questionBank: Record<string, PracticeQuestion[]> = Object.fromEntries(
  Object.keys(meta).map((slug) => [slug, Array.from({ length: 100 }, (_, i) => make(slug, buildQuestion(slug, i), i))])
) as Record<string, PracticeQuestion[]>;

export const questions: Record<string, any> = Object.fromEntries(
  Object.entries(questionBank).map(([slug, list]) => [slug, list[0].data])
);

export const getPracticeQuestion = (slug: string, questionId?: string) => {
  const list = questionBank[slug] || [];
  return list.find((q) => q.id === questionId) || list[0];
};
