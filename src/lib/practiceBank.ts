// One sample question per PTE type. Real product would load from a database.
export type SpeakingQ = { prompt: string; modelHint?: string; prep?: number; record: number };
export type WritingQ = { prompt: string; minWords: number; maxWords: number; minutes: number };
export type AudioQ = { audioText: string; prompt?: string; prep?: number; record?: number };
export type MCQQ = { passage?: string; audioText?: string; question: string; options: string[]; correct: number[] };
export type FIBQ = { template: string; bank: string[]; correct: string[] }; // template uses {0}, {1}...
export type ReorderQ = { items: { id: string; text: string }[]; correct: string[] };
export type WFDQ = { audioText: string };
export type HIWQ = { transcript: string; spoken: string }; // spoken differs by some words
export type SMWQ = { audioText: string; options: string[]; correct: number };

export const questions: Record<string, any> = {
  // SPEAKING
  "read-aloud": <SpeakingQ>{
    prompt:
      "The advancement of artificial intelligence has fundamentally transformed how we approach education, enabling personalized learning experiences at an unprecedented scale across global classrooms.",
    prep: 35,
    record: 40,
  },
  "repeat-sentence": <AudioQ>{
    audioText: "Climate change has become one of the most pressing global challenges of our time.",
    prep: 0,
    record: 15,
  },
  "describe-image": <SpeakingQ>{
    prompt:
      "Describe the bar chart showing global renewable energy consumption from 2010 to 2023, where solar grew from 5% to 28%, wind from 8% to 22%, and hydro stayed steady at 18%.",
    prep: 25,
    record: 40,
  },
  "retell-lecture": <AudioQ>{
    audioText:
      "Today we discussed the impact of urbanisation on ecosystems. Cities now host over half the world's population, creating heat islands, fragmenting habitats, and changing rainfall patterns. However, smart urban planning, green corridors and rooftop gardens are emerging as effective mitigation strategies.",
    prep: 10,
    record: 40,
  },
  "answer-short-question": <AudioQ>{
    audioText: "What do we call a person who studies the stars and planets?",
    record: 10,
  },
  "summarize-group-discussion": <AudioQ>{
    audioText:
      "Speaker A: Remote work boosts productivity for focused tasks. Speaker B: But it weakens team culture and mentorship. Speaker C: A hybrid model balances both — autonomy and connection.",
    prep: 10,
    record: 120,
  },
  "respond-to-situation": <SpeakingQ>{
    prompt:
      "Your friend is moving to a new city for work and is feeling anxious about it. Respond to them in a supportive way, offering practical advice.",
    prep: 10,
    record: 40,
  },

  // WRITING
  "summarize-written-text": <WritingQ>{
    prompt:
      "Renewable energy sources such as solar and wind have rapidly expanded over the past decade. Their costs have fallen dramatically, making them cheaper than coal in many countries. However, intermittency remains a key challenge, requiring investment in storage technology and modernised grids. Policymakers play a critical role through incentives, carbon pricing and infrastructure planning.",
    minWords: 5,
    maxWords: 75,
    minutes: 10,
  },
  "write-essay": <WritingQ>{
    prompt:
      "Some people believe that universities should focus on providing academic skills, while others think they should also prepare students for their future careers. Discuss both views and give your opinion.",
    minWords: 200,
    maxWords: 300,
    minutes: 20,
  },

  // READING
  "rw-fib": <FIBQ>{
    template:
      "Many companies now {0} flexible working policies because they {1} both productivity and employee wellbeing. Studies have {2} that hybrid models often outperform fully on-site arrangements.",
    bank: ["adopt", "reject", "improve", "reduce", "shown", "denied", "ignore"],
    correct: ["adopt", "improve", "shown"],
  },
  "r-mcq-multi": <MCQQ>{
    passage:
      "Coral reefs cover less than 1% of the ocean floor but support around 25% of all marine species. Rising sea temperatures, ocean acidification and overfishing have placed many reef systems under severe stress. Conservation efforts focus on marine protected areas and reef restoration projects.",
    question: "Which of the following are challenges facing coral reefs?",
    options: ["Ocean acidification", "Increased rainfall", "Overfishing", "Rising sea temperatures"],
    correct: [0, 2, 3],
  },
  reorder: <ReorderQ>{
    items: [
      { id: "a", text: "The internet has transformed how humans communicate." },
      { id: "b", text: "In the early days, only research labs had access." },
      { id: "c", text: "Today, billions of people connect from their pockets." },
      { id: "d", text: "This shift has reshaped industries from media to medicine." },
    ],
    correct: ["a", "b", "c", "d"],
  },
  "r-fib": <FIBQ>{
    template:
      "Scientists have long {0} the link between sleep and memory. New research {1} that deep sleep helps consolidate learning, allowing the brain to {2} short-term experiences into long-term knowledge.",
    bank: ["studied", "ignored", "suggests", "denies", "convert", "delete"],
    correct: ["studied", "suggests", "convert"],
  },
  "r-mcq-single": <MCQQ>{
    passage:
      "Mount Everest, the highest peak above sea level, attracts hundreds of climbers each year. The climbing season is short, and conditions can change rapidly, making preparation essential.",
    question: "What is the main idea of the passage?",
    options: [
      "Everest is the tallest mountain in the world",
      "Climbing Everest requires careful preparation due to harsh conditions",
      "Hundreds of climbers visit Everest each year",
      "Everest's climbing season is very short",
    ],
    correct: [1],
  },

  // LISTENING
  sst: <AudioQ>{
    audioText:
      "Researchers studying memory have found that brief naps of around 20 minutes significantly improve recall in working memory tasks. Longer naps, while restorative, can lead to grogginess and may interfere with night sleep. The implications for shift workers and students are significant.",
    record: 0,
  },
  "l-mcq-multi": <MCQQ>{
    audioText:
      "In today's lecture we discussed three benefits of regular exercise: improved cardiovascular health, better mental wellbeing, and enhanced cognitive performance.",
    question: "Which benefits of exercise were mentioned?",
    options: ["Cardiovascular health", "Stronger immune system", "Mental wellbeing", "Cognitive performance"],
    correct: [0, 2, 3],
  },
  "l-fib": <FIBQ>{
    template:
      "Photosynthesis is the process by which plants convert {0} into chemical energy stored in {1}, releasing {2} as a byproduct.",
    bank: [],
    correct: ["sunlight", "glucose", "oxygen"],
  },
  hcs: <MCQQ>{
    audioText:
      "Modern cities face an urgent challenge: how to balance rapid growth with environmental sustainability. Green corridors, electric public transport and energy-efficient buildings are leading strategies.",
    question: "Choose the paragraph that best summarises the recording.",
    options: [
      "Modern cities are growing too fast and pollution is unstoppable.",
      "Cities must balance growth with sustainability, using green corridors, clean transport and efficient buildings.",
      "Public transport is the only solution to urban environmental issues.",
      "Buildings should be redesigned to use solar panels.",
    ],
    correct: [1],
  },
  "l-mcq-single": <MCQQ>{
    audioText:
      "The professor argued that motivation, not innate talent, is the strongest predictor of long-term academic success.",
    question: "What does the professor say is the strongest predictor of academic success?",
    options: ["Innate talent", "Motivation", "School quality", "Family income"],
    correct: [1],
  },
  smw: <SMWQ>{
    audioText:
      "Most economists agree that inflation is closely tied to the supply of",
    options: ["money", "goods", "labour", "exports"],
    correct: 0,
  },
  hiw: <HIWQ>{
    transcript:
      "The committee decided to approve the new education policy after several months of careful discussion and review.",
    spoken:
      "The committee decided to reject the new education policy after several weeks of careful discussion and replay.",
  },
  wfd: <WFDQ>{
    audioText: "The new research highlights the importance of early childhood education.",
  },
};

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
