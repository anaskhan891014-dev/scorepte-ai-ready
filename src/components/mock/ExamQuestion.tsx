import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { speak, stopSpeaking } from "@/lib/practiceUtils";
import type { MockQ } from "@/lib/mockBank";

type Props = {
  q: MockQ;
  value: any;
  onChange: (v: any) => void;
};

// Universal in-exam question renderer (light theme).
// Captures a response object that downstream AI scoring understands.
export const ExamQuestion = ({ q, value, onChange }: Props) => {
  const d = q.data;
  const slug = q.slug;
  const isAudio = ["repeat-sentence", "retell-lecture", "answer-short-question", "summarize-group-discussion", "sst", "l-mcq-multi", "l-mcq-single", "l-fib", "hcs", "smw", "hiw", "wfd"].includes(slug);
  const audioText = d?.audioText as string | undefined;

  // text response default
  const text = typeof value === "string" ? value : "";

  // Speech recognition for speaking tasks
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any>(null);

  const startRec = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser. Type your response."); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    let acc = "";
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) acc += t + " ";
        else interim += t;
      }
      onChange((acc + interim).trim());
    };
    r.onend = () => setRecording(false);
    r.start(); recRef.current = r; setRecording(true);
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  useEffect(() => () => { stopSpeaking(); recRef.current?.stop?.(); }, []);

  // Specific renderers
  if (slug === "rw-fib" || slug === "r-fib" || slug === "l-fib") {
    const tpl = d.template as string;
    const blanks = (tpl.match(/\{(\d+)\}/g) || []).length;
    const arr: string[] = Array.isArray(value) ? value : Array(blanks).fill("");
    const parts = tpl.split(/\{\d+\}/);
    return (
      <div className="space-y-5">
        {slug === "l-fib" && audioText && (
          <AudioPanel text={audioText} />
        )}
        <p className="text-base md:text-lg leading-relaxed text-slate-800">
          {parts.map((p, i) => (
            <span key={i}>
              {p}
              {i < blanks && (
                <input
                  value={arr[i] || ""}
                  onChange={(e) => {
                    const next = [...arr]; next[i] = e.target.value; onChange(next);
                  }}
                  className="inline-block mx-1 min-w-[100px] px-2 py-1 border-b-2 border-emerald-500 bg-emerald-50/50 focus:outline-none focus:bg-emerald-50 text-slate-900"
                />
              )}
            </span>
          ))}
        </p>
        {d.bank && d.bank.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(d.bank as string[]).map((b, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-700">{b}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (slug === "r-mcq-multi" || slug === "r-mcq-single" || slug === "l-mcq-multi" || slug === "l-mcq-single" || slug === "hcs" || slug === "smw") {
    const multi = slug.endsWith("-multi");
    const opts: string[] = d.options;
    const picked: number[] = Array.isArray(value) ? value : [];
    const toggle = (i: number) => {
      if (multi) onChange(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i]);
      else onChange([i]);
    };
    return (
      <div className="space-y-5">
        {audioText && <AudioPanel text={audioText} />}
        {d.passage && <p className="text-base leading-relaxed text-slate-800">{d.passage}</p>}
        <p className="font-semibold text-slate-900">{d.question}</p>
        <div className="space-y-2">
          {opts.map((o, i) => {
            const sel = picked.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`w-full text-left p-3.5 rounded-lg border-2 text-sm transition ${sel ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <span className={`inline-block mr-3 h-5 w-5 ${multi ? "rounded" : "rounded-full"} border-2 ${sel ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`} />
                <span className="text-slate-800">{o}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (slug === "reorder") {
    const items = d.items as { id: string; text: string }[];
    const initial = useMemo(() => items.map((i) => i.id), [q]);
    const order: string[] = Array.isArray(value) && value.length === items.length ? value : initial;
    const move = (idx: number, dir: -1 | 1) => {
      const j = idx + dir; if (j < 0 || j >= order.length) return;
      const a = [...order]; [a[idx], a[j]] = [a[j], a[idx]]; onChange(a);
    };
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Re-order the paragraphs into a logical sequence.</p>
        <ul className="space-y-2">
          {order.map((id, idx) => {
            const it = items.find((x) => x.id === id)!;
            return (
              <li key={id} className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-lg">
                <span className="h-7 w-7 shrink-0 rounded-md bg-emerald-500 text-white text-xs font-bold grid place-items-center">{idx + 1}</span>
                <p className="flex-1 text-sm text-slate-800">{it.text}</p>
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(idx, -1)} className="px-2 text-slate-500 hover:text-slate-900">▲</button>
                  <button onClick={() => move(idx, 1)} className="px-2 text-slate-500 hover:text-slate-900">▼</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (slug === "hiw") {
    const tokens = (d.transcript as string).split(/\s+/);
    const picked: number[] = Array.isArray(value) ? value : [];
    const toggle = (i: number) => onChange(picked.includes(i) ? picked.filter((x) => x !== i) : [...picked, i]);
    return (
      <div className="space-y-5">
        <AudioPanel text={d.spoken} />
        <p className="leading-loose text-slate-800">
          {tokens.map((t, i) => (
            <button key={i} onClick={() => toggle(i)} className={`px-1 mx-0.5 rounded ${picked.includes(i) ? "bg-rose-200 text-rose-900" : "hover:bg-slate-100"}`}>
              {t}
            </button>
          ))}
        </p>
      </div>
    );
  }

  // Speaking tasks: read-aloud, describe-image, respond-to-situation use the prompt directly.
  // Audio listening tasks (sst, retell-lecture, answer-short-question, summarize-group-discussion, repeat-sentence, wfd) play audio.
  return (
    <div className="space-y-5">
      {audioText && <AudioPanel text={audioText} oneShot={slug === "wfd" || slug === "repeat-sentence" || slug === "answer-short-question"} />}
      {d.prompt && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Prompt</p>
          <p className="text-base leading-relaxed text-slate-800">{d.prompt}</p>
        </div>
      )}

      {q.category === "speaking" ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {!recording ? (
              <Button onClick={startRec} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Mic className="h-4 w-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRec} variant="destructive">
                <Square className="h-4 w-4 mr-2" /> Stop Recording
              </Button>
            )}
            {recording && (
              <span className="inline-flex items-center gap-2 text-sm text-rose-600">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Recording…
              </span>
            )}
          </div>
          <Textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Your spoken response will appear here. You may also type to edit it."
            className="min-h-[140px] bg-white border-slate-300 text-slate-900"
          />
        </div>
      ) : (
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={slug === "wfd" ? "Type the sentence you heard…" : "Type your response here…"}
          className="min-h-[180px] bg-white border-slate-300 text-slate-900"
        />
      )}
    </div>
  );
};

const AudioPanel = ({ text, oneShot }: { text: string; oneShot?: boolean }) => {
  const [played, setPlayed] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500">Audio</p>
        <p className="text-sm text-slate-700 mt-1">{oneShot ? "Plays once. Listen carefully." : "You may replay during preparation."}</p>
      </div>
      <Button
        onClick={() => { speak(text); setPlayed(true); }}
        disabled={oneShot && played}
        className="bg-slate-900 hover:bg-slate-800 text-white"
      >
        <Volume2 className="h-4 w-4 mr-2" /> {oneShot && played ? "Played" : "Play Audio"}
      </Button>
    </div>
  );
};
