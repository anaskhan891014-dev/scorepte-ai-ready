export type GeminiMessage = { role: "user" | "assistant"; content: string };

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const FRIENDLY_ERROR = "Something went wrong, please try again";
export const CHAT_ERROR = "Please try again";

const apiKey = () => import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const stripJsonFences = (text: string) => text.replace(/^```json\s*|^```\s*|\s*```$/g, "").trim();

export const parseGeminiJson = <T>(text: string): T => {
  const cleaned = stripJsonFences(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Invalid Gemini JSON");
  }
};

export async function generateGeminiText({
  prompt,
  system,
  temperature = 0.5,
  maxOutputTokens = 1600,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const key = apiKey();
  if (!key) throw new Error(FRIENDLY_ERROR);

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens },
    }),
  });

  if (!response.ok) throw new Error(FRIENDLY_ERROR);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(FRIENDLY_ERROR);
  return text as string;
}

export async function generateGeminiChat({
  messages,
  system,
  temperature = 0.7,
  maxOutputTokens = 1200,
}: {
  messages: GeminiMessage[];
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const key = apiKey();
  if (!key) throw new Error(CHAT_ERROR);

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content.slice(0, 3000) }],
  }));

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents,
      generationConfig: { temperature, maxOutputTokens },
    }),
  });

  if (!response.ok) throw new Error(CHAT_ERROR);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(CHAT_ERROR);
  return text as string;
}

export async function generateGeminiJson<T>({
  prompt,
  system,
  temperature = 0.4,
  maxOutputTokens = 2000,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const text = await generateGeminiText({
    prompt,
    system: `${system ? `${system}\n` : ""}Return valid JSON only. Do not wrap it in markdown fences.`,
    temperature,
    maxOutputTokens,
  });
  return parseGeminiJson<T>(text);
}
