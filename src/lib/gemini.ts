import SCOREPTE_BRAIN from "./scorePTEBrain.md?raw";

export type GeminiMessage = { role: "user" | "assistant"; content: string };

export const FRIENDLY_ERROR = "Something went wrong, please try again";
export const CHAT_ERROR = "Please try again";
export const SCOREPTE_SYSTEM = SCOREPTE_BRAIN as string;

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function extractJson(raw: string): any {
  let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.search(/[\{\[]/);
  if (start === -1) throw new Error("No JSON in response");
  const openChar = cleaned[start];
  const closeChar = openChar === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(closeChar);
  if (end === -1) throw new Error("Truncated JSON");
  cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, " ");
    return JSON.parse(cleaned);
  }
}

export const parseGeminiJson = <T,>(text: string): T => extractJson(text) as T;

export async function generateGeminiText({
  prompt,
  system,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[Gemini] Missing VITE_GEMINI_API_KEY");
    throw new Error(FRIENDLY_ERROR);
  }

  const text = system ? `${system}\n\n${prompt}` : prompt;

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }] }),
    });
  } catch (e) {
    console.error("[Gemini] Network error", e);
    throw new Error(FRIENDLY_ERROR);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    console.error("[Gemini] API error", res.status, data);
    throw new Error(FRIENDLY_ERROR);
  }

  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) {
    console.error("[Gemini] Empty response", data);
    throw new Error(FRIENDLY_ERROR);
  }
  return out as string;
}

export async function generateGeminiChat({
  messages,
  system,
}: {
  messages: GeminiMessage[];
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const conversation = messages
    .map((m) => `${m.role === "assistant" ? "Tutor" : "Student"}: ${m.content.slice(0, 3000)}`)
    .join("\n");
  return generateGeminiText({ prompt: conversation, system });
}

export async function generateGeminiJson<T>({
  prompt,
  system,
}: {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<T> {
  const text = await generateGeminiText({
    prompt: `${prompt}\n\nReturn valid JSON only. Do not wrap in markdown fences.`,
    system,
  });
  return extractJson(text) as T;
}
