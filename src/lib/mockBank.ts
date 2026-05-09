import { meta, questionBank } from "./practiceBank";

export type MockQ = {
  slug: string;          // question type slug (read-aloud, etc.)
  name: string;
  category: "speaking" | "writing" | "reading" | "listening";
  data: any;             // the question payload
};

export type SectionKey = "sw" | "r" | "l";
export const sectionLabel: Record<SectionKey, string> = {
  sw: "Speaking & Writing",
  r: "Reading",
  l: "Listening",
};

// Section timings in seconds (real PTE)
export const sectionTime: Record<SectionKey, number> = {
  sw: 54 * 60 + 41 * 60, // ~95 min combined SW
  r: 30 * 60,
  l: 30 * 60,
};

const buildQ = (slug: string, index = 0): MockQ => ({
  slug,
  name: meta[slug].name,
  category: meta[slug].category,
  data: questionBank[slug]?.[index % 100]?.data,
});

const repeat = (slug: string, n: number) => Array.from({ length: n }, (_, i) => buildQ(slug, i));

// FULL: realistic counts (lower bound to keep test usable)
export const fullTest: Record<SectionKey, MockQ[]> = {
  sw: [
    ...repeat("read-aloud", 6),
    ...repeat("repeat-sentence", 10),
    ...repeat("describe-image", 3),
    ...repeat("retell-lecture", 1),
    ...repeat("answer-short-question", 5),
    ...repeat("summarize-written-text", 1),
    ...repeat("summarize-group-discussion", 1),
    ...repeat("respond-to-situation", 1),
    ...repeat("write-essay", 1),
  ],
  r: [
    ...repeat("rw-fib", 5),
    ...repeat("r-mcq-multi", 1),
    ...repeat("reorder", 2),
    ...repeat("r-fib", 4),
    ...repeat("r-mcq-single", 1),
  ],
  l: [
    ...repeat("sst", 1),
    ...repeat("l-mcq-multi", 1),
    ...repeat("l-fib", 2),
    ...repeat("hcs", 1),
    ...repeat("l-mcq-single", 1),
    ...repeat("smw", 1),
    ...repeat("hiw", 2),
    ...repeat("wfd", 3),
  ],
};

// MINI: ~30 min mix
export const miniTest: MockQ[] = [
  buildQ("read-aloud", 11),
  buildQ("repeat-sentence", 12),
  buildQ("describe-image", 13),
  buildQ("answer-short-question", 14),
  buildQ("summarize-written-text", 15),
  buildQ("rw-fib", 16),
  buildQ("reorder", 17),
  buildQ("r-mcq-single", 18),
  buildQ("sst", 19),
  buildQ("l-fib", 20),
  buildQ("smw", 21),
  buildQ("wfd", 22),
];

export const buildSectional = (s: SectionKey) => fullTest[s];

export const totalDurationSeconds = (qs: MockQ[]) => {
  // estimate: speaking 50s avg, writing 10min, reading 90s, listening 90s
  let t = 0;
  for (const q of qs) {
    if (q.category === "speaking") t += 60;
    else if (q.category === "writing") t += q.slug === "write-essay" ? 20 * 60 : 10 * 60;
    else t += 90;
  }
  return t;
};
