import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, Send, Plus, Copy, ThumbsUp, ThumbsDown, Sparkles, Mic, Loader2, MessageSquare, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { CHAT_ERROR, generateGeminiChat } from "@/lib/gemini";

const SUGGESTED = [
  "What are the new question types in 2025?",
  "How to score 90 in Write Essay?",
  "Best template for Summarize Written Text",
  "How is PTE scored?",
  "Tips for Repeat Sentence",
  "How to improve pronunciation?",
  "What is a good study plan for 2 weeks?",
  "Difference between PTE Academic and Core?",
];

type Msg = { id?: string; role: "user" | "assistant"; content: string; feedback?: number | null };
type Conv = { id: string; title: string; updated_at: string };

const SYSTEM = `You are ScorePTE AI Tutor, an expert PTE Academic coach. You know the PTE Academic exam format with 22 question types including Summarize Group Discussion and Respond to a Situation. Give specific, actionable advice with examples. Format answers using clean markdown. If the user asks something unrelated to PTE, English study, or test prep, politely redirect them back to PTE topics in 1-2 sentences.`;

const AITutor = () => {
  const { user } = useAuth();
  const [convos, setConvos] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [errorText, setErrorText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);

  useEffect(() => { loadConvos(); }, [user]);
  useEffect(() => { if (activeId) loadMessages(activeId); else setMessages([]); }, [activeId]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, sending]);

  const loadConvos = async () => {
    if (!user) return;
    const { data } = await supabase.from("chat_conversations").select("id,title,updated_at").order("updated_at", { ascending: false });
    setConvos(data || []);
    if (data?.[0] && !activeId) setActiveId(data[0].id);
  };
  const loadMessages = async (id: string) => {
    const { data } = await supabase.from("chat_messages").select("id,role,content,feedback").eq("conversation_id", id).order("created_at");
    setMessages((data || []) as Msg[]);
  };

  const newChat = () => { setActiveId(null); setMessages([]); };

  const deleteConv = async (id: string) => {
    await supabase.from("chat_conversations").delete().eq("id", id);
    if (activeId === id) { setActiveId(null); setMessages([]); }
    loadConvos();
  };

  const send = async (text: string) => {
    if (!text.trim() || sending || !user) return;
    const trimmed = text.trim().slice(0, 500);
    setSending(true);
    setErrorText("");
    setInput("");

    let convId = activeId;
    if (!convId) {
      const { data, error } = await supabase.from("chat_conversations")
        .insert({ user_id: user.id, title: trimmed.slice(0, 50) }).select("id").single();
      if (error || !data) { setSending(false); setErrorText(CHAT_ERROR); return; }
      convId = data.id;
      setActiveId(convId);
    }

    const userMsg: Msg = { role: "user", content: trimmed };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    await supabase.from("chat_messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: trimmed });

    try {
      const text = await generateGeminiChat({
        system: SYSTEM,
        messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
      });
      const reply: Msg = { role: "assistant", content: text };
      setMessages([...newMsgs, reply]);
      const { data: ins } = await supabase.from("chat_messages")
        .insert({ conversation_id: convId, user_id: user.id, role: "assistant", content: text })
        .select("id").single();
      if (ins) setMessages((m) => m.map((x, i) => i === newMsgs.length ? { ...x, id: ins.id } : x));
      await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      loadConvos();
    } catch {
      setErrorText(CHAT_ERROR);
    } finally {
      setSending(false);
    }
  };

  const rateMessage = async (id: string | undefined, val: number) => {
    if (!id) return;
    await supabase.from("chat_messages").update({ feedback: val }).eq("id", id);
    setMessages((m) => m.map((x) => x.id === id ? { ...x, feedback: val } : x));
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setErrorText("Voice input is not supported in this browser."); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const r = new SR();
    r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e: any) => setInput((prev) => (prev + " " + e.results[0][0].transcript).trim().slice(0, 500));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    setListening(true); r.start();
  };

  return (
    <DashboardLayout>
      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-8rem)]">
        {/* Sidebar with convos */}
        <aside className="hidden md:flex glass rounded-2xl p-3 flex-col">
          <Button onClick={newChat} className="w-full bg-gradient-primary text-primary-foreground gap-2"><Plus className="h-4 w-4" /> New Chat</Button>
          <div className="mt-3 flex-1 overflow-y-auto space-y-1">
            {convos.length === 0 && <p className="text-xs text-muted-foreground px-2 py-4">No chats yet.</p>}
            {convos.map((c) => (
              <div key={c.id} className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition ${activeId === c.id ? "bg-secondary/70" : "hover:bg-secondary/40"}`} onClick={() => setActiveId(c.id)}>
                <MessageSquare className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="truncate flex-1">{c.title}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteConv(c.id); }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <div className="glass rounded-2xl flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center glow"><Brain className="h-4 w-4 text-primary-foreground" /></span>
              <div>
                <p className="font-semibold leading-tight">AI Tutor</p>
                <p className="text-[11px] text-muted-foreground">Powered by ScorePTE AI</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={newChat} className="md:hidden"><Plus className="h-4 w-4" /></Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center max-w-md mx-auto pt-8 space-y-4">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-primary grid place-items-center glow"><Sparkles className="h-6 w-6 text-primary-foreground" /></div>
                <h2 className="text-xl font-bold">Ask me anything about PTE</h2>
                <p className="text-sm text-muted-foreground">I know all 22 question types, scoring rubrics, and proven templates.</p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {SUGGESTED.map((q) => (
                    <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 rounded-full glass hover:bg-secondary/60 transition border border-border">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id || i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <span className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shrink-0"><Sparkles className="h-4 w-4 text-primary-foreground" /></span>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "bg-secondary/60"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:mt-3 prose-headings:mb-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                  {m.role === "assistant" && (
                    <div className="flex gap-1 mt-2 pt-2 border-t border-border/50 -mx-1">
                      <button onClick={() => { navigator.clipboard.writeText(m.content); toast.success("Copied"); }} className="p-1 rounded hover:bg-background/40 text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                      <button onClick={() => rateMessage(m.id, 1)} className={`p-1 rounded hover:bg-background/40 ${m.feedback === 1 ? "text-accent" : "text-muted-foreground"}`}><ThumbsUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => rateMessage(m.id, -1)} className={`p-1 rounded hover:bg-background/40 ${m.feedback === -1 ? "text-destructive" : "text-muted-foreground"}`}><ThumbsDown className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <span className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center"><Sparkles className="h-4 w-4 text-primary-foreground" /></span>
                <div className="bg-secondary/60 rounded-2xl px-4 py-3 inline-flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 md:p-4 border-t border-border">
            {errorText && <p className="mb-2 text-sm text-destructive">{errorText}</p>}
            <div className="flex items-end gap-2">
              <div className="flex-1 glass rounded-xl flex items-end px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="Ask anything about PTE..."
                  rows={1}
                  className="flex-1 bg-transparent outline-none text-sm resize-none max-h-32"
                />
                <span className="text-[10px] text-muted-foreground ml-2">{input.length}/500</span>
              </div>
              <Button onClick={startVoice} variant="glass" size="icon" className={listening ? "text-accent" : ""}><Mic className="h-4 w-4" /></Button>
              <Button onClick={() => send(input)} disabled={sending || !input.trim()} className="bg-gradient-primary text-primary-foreground" size="icon">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AITutor;
