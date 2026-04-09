import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import {
  useCreateLiveChatRequest,
  useListLiveChatMessages,
  useSendLiveChatMessage,
  useCloseLiveChatRequest,
} from "@workspace/api-client-react";

/* ─────────────────── types ─────────────────── */
type Tab       = "ai" | "human";
type ChatState = "closed" | "open";
type HumanStep = "form" | "waiting" | "rejected" | "chat";

interface AiMessage { role: "user" | "assistant"; content: string; pending?: boolean }

const SUGGESTED_EN = ["What's included in the Launch Store?", "How long does delivery take?", "What are your prices?"];
const SUGGESTED_AR = ["ماذا يشمل متجر الإطلاق؟", "كم تستغرق مدة التسليم؟", "ما هي الأسعار؟"];

/* ─────────────────── component ─────────────────── */
export default function ChatWidget() {
  const { isRTL, lang } = useLang();
  const isAr = lang === "ar";

  const [chatState, setChatState]   = useState<ChatState>("closed");
  const [tab, setTab]               = useState<Tab>("ai");

  /* AI state */
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput]       = useState("");
  const [streaming, setStreaming]   = useState(false);
  const abortRef                    = useRef<AbortController | null>(null);
  const aiInputRef                  = useRef<HTMLInputElement>(null);

  /* Human / live-chat state */
  const [humanStep, setHumanStep]   = useState<HumanStep>("form");
  const [visitorName, setVisitorName] = useState("");
  const [topic, setTopic]           = useState("");
  const [requestId, setRequestId]   = useState<number | null>(null);
  const [msgInput, setMsgInput]     = useState("");
  const [lastMsgId, setLastMsgId]   = useState(0);
  const [localMsgs, setLocalMsgs]   = useState<{ senderRole: string; content: string; id: number }[]>([]);
  const pollRef                     = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  /* API mutations */
  const createRequest  = useCreateLiveChatRequest();
  const sendMsg        = useSendLiveChatMessage();
  const closeChat      = useCloseLiveChatRequest();

  /* messages query (only when accepted) */
  const { data: remoteMsgs, refetch: refetchMsgs } = useListLiveChatMessages(
    requestId ?? 0,
    undefined,
    { query: { enabled: !!requestId && humanStep === "chat" } },
  );

  /* close on outside click */
  useEffect(() => {
    function h(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setChatState("closed");
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* scroll bottom */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages, localMsgs]);

  /* focus AI input */
  useEffect(() => {
    if (chatState === "open" && tab === "ai") setTimeout(() => aiInputRef.current?.focus(), 120);
  }, [chatState, tab]);

  /* ── poll for request status ── */
  const pollStatus = useCallback(async () => {
    if (!requestId) return;
    try {
      const res = await fetch(`/api/live-chat/${requestId}`);
      if (!res.ok) return;
      const data: { status: string } = await res.json();
      if (data.status === "accepted") {
        setHumanStep("chat");
        clearInterval(pollRef.current!);
        pollRef.current = null;
      } else if (data.status === "rejected" || data.status === "closed") {
        setHumanStep("rejected");
        clearInterval(pollRef.current!);
        pollRef.current = null;
      }
    } catch { /* ignore */ }
  }, [requestId]);

  /* ── poll for new messages ── */
  const pollMessages = useCallback(async () => {
    if (!requestId || humanStep !== "chat") return;
    try {
      const url = lastMsgId > 0
        ? `/api/live-chat/${requestId}/messages?after=${lastMsgId}`
        : `/api/live-chat/${requestId}/messages`;
      const res = await fetch(url);
      if (!res.ok) return;
      const msgs: { id: number; senderRole: string; content: string }[] = await res.json();
      if (msgs.length > 0) {
        setLocalMsgs(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newOnes = msgs.filter(m => !existingIds.has(m.id));
          return [...prev, ...newOnes];
        });
        setLastMsgId(msgs[msgs.length - 1].id);
      }
    } catch { /* ignore */ }
  }, [requestId, humanStep, lastMsgId]);

  /* start/stop polling based on step */
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (humanStep === "waiting" && requestId) {
      pollRef.current = setInterval(pollStatus, 3000);
    } else if (humanStep === "chat" && requestId) {
      pollRef.current = setInterval(pollMessages, 2500);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [humanStep, requestId, pollStatus, pollMessages]);

  /* init messages when chat opens */
  useEffect(() => {
    if (humanStep === "chat" && requestId) {
      (async () => {
        try {
          const res = await fetch(`/api/live-chat/${requestId}/messages`);
          if (res.ok) {
            const msgs: { id: number; senderRole: string; content: string }[] = await res.json();
            setLocalMsgs(msgs);
            if (msgs.length > 0) setLastMsgId(msgs[msgs.length - 1].id);
          }
        } catch { /* ignore */ }
      })();
    }
  }, [humanStep, requestId]);

  /* ── AI send ── */
  async function sendAiMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: AiMessage = { role: "user", content: text.trim() };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages([...newMessages, { role: "assistant", content: "", pending: true }]);
    setAiInput("");
    setStreaming(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const p = JSON.parse(line.slice(6));
            if (p.content) {
              accumulated += p.content;
              setAiMessages(prev => {
                const u = [...prev];
                u[u.length - 1] = { role: "assistant", content: accumulated };
                return u;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setAiMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: "assistant", content: isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again." };
          return u;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  /* ── Submit live chat request ── */
  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!visitorName.trim() || !topic.trim()) return;
    const row = await createRequest.mutateAsync({ data: { visitorName: visitorName.trim(), topic: topic.trim() } });
    setRequestId(row.id);
    setHumanStep("waiting");
  }

  /* ── Send live chat message ── */
  async function handleSendMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!msgInput.trim() || !requestId) return;
    const optimistic = { id: Date.now(), senderRole: "visitor", content: msgInput.trim() };
    setLocalMsgs(prev => [...prev, optimistic]);
    const sent = msgInput.trim();
    setMsgInput("");
    try {
      const msg = await sendMsg.mutateAsync({ id: requestId, data: { senderRole: "visitor", content: sent } });
      setLocalMsgs(prev => prev.map(m => m.id === optimistic.id ? msg : m));
      setLastMsgId(prev => Math.max(prev, msg.id));
    } catch {
      setLocalMsgs(prev => prev.filter(m => m.id !== optimistic.id));
    }
  }

  /* ── End chat ── */
  async function handleEndChat() {
    if (!requestId) return;
    await closeChat.mutateAsync({ id: requestId });
    setHumanStep("form");
    setRequestId(null);
    setLocalMsgs([]);
    setLastMsgId(0);
    setVisitorName("");
    setTopic("");
  }

  /* ── reset human tab ── */
  function resetHuman() {
    setHumanStep("form");
    setRequestId(null);
    setLocalMsgs([]);
    setLastMsgId(0);
    setVisitorName("");
    setTopic("");
    setMsgInput("");
  }

  const anchor = isRTL ? "left-6" : "right-6";
  const alignItems = isRTL ? "items-start" : "items-end";

  return (
    <div className={`fixed bottom-6 ${anchor} z-50 flex flex-col ${alignItems} gap-3`} ref={panelRef}>

      {/* ── Panel ───────────────────────────────────────── */}
      {chatState === "open" && (
        <div
          className="w-[340px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ background: "hsl(252 28% 5%)", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "530px" }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between shrink-0"
            style={{ background: "hsl(var(--primary) / 0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "hsl(var(--primary) / 0.2)", border: "1px solid hsl(var(--primary) / 0.35)" }}>
                <span className="text-[11px] font-black text-primary">M</span>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-none mb-0.5">
                  {isAr ? "دعم MARIS" : "MARIS Support"}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-[10px] text-muted-foreground/50">{isAr ? "متاح الآن" : "Available now"}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setChatState("closed")}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {([
              { id: "ai"    as Tab, label: isAr ? "الذكاء الاصطناعي" : "AI Chat" },
              { id: "human" as Tab, label: isAr ? "موظف حقيقي"       : "Live Agent" },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-all relative"
                style={{ color: tab === t.id ? "hsl(var(--primary))" : "rgba(255,255,255,0.25)" }}>
                {t.label}
                {tab === t.id && <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "hsl(var(--primary))" }} />}
              </button>
            ))}
          </div>

          {/* ── AI Chat tab ─────────────────────────── */}
          {tab === "ai" && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
                {/* Greeting */}
                <AiBubble isAr={isAr}>
                  {isAr ? "مرحباً! أنا مساعد MARIS. كيف يمكنني مساعدتك اليوم؟" : "Hi! I'm the MARIS AI assistant. How can I help you today?"}
                </AiBubble>
                {/* Suggestions */}
                {aiMessages.length === 0 && (
                  <div className="flex flex-col gap-1.5 pl-8">
                    {(isAr ? SUGGESTED_AR : SUGGESTED_EN).map(q => (
                      <button key={q} onClick={() => sendAiMessage(q)} disabled={streaming}
                        className="text-[11px] px-3 py-1.5 rounded-xl border transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40"
                        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)",
                          color: "rgba(255,255,255,0.5)", textAlign: isRTL ? "right" : "left" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                {/* Messages */}
                {aiMessages.map((msg, i) => msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed text-foreground max-w-[80%]"
                      style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <AiBubble key={i} isAr={isAr}>
                    {msg.pending && !msg.content ? (
                      <span className="flex gap-1 items-center py-0.5">
                        {[0,150,300].map(d => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce inline-block"
                            style={{ background: "hsl(var(--primary) / 0.6)", animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    ) : (
                      <>
                        {msg.content}
                        {streaming && i === aiMessages.length - 1 && (
                          <span className="inline-block w-0.5 h-3 ml-0.5 animate-pulse align-middle"
                            style={{ background: "hsl(var(--primary))" }} />
                        )}
                      </>
                    )}
                  </AiBubble>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={e => { e.preventDefault(); sendAiMessage(aiInput); }}
                className="shrink-0 p-3 pt-2 flex gap-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <input ref={aiInputRef} type="text" value={aiInput} onChange={e => setAiInput(e.target.value)}
                  disabled={streaming} dir={isRTL ? "rtl" : "ltr"}
                  placeholder={isAr ? "اكتب سؤالك..." : "Ask anything..."}
                  className="flex-1 text-xs bg-transparent rounded-xl border border-white/[0.08] px-3 py-2.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50" />
                <button type="submit" disabled={!aiInput.trim() || streaming}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shrink-0"
                  style={{ background: "hsl(var(--primary))" }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </>
          )}

          {/* ── Human / Live Agent tab ───────────────── */}
          {tab === "human" && (
            <div className="flex-1 overflow-y-auto flex flex-col" style={{ minHeight: 0 }}>

              {/* FORM step */}
              {humanStep === "form" && (
                <div className="p-4 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-bold text-foreground mb-0.5">
                      {isAr ? "تحدث مع موظفنا" : "Talk to our team"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                      {isAr ? "أدخل بياناتك وسنتواصل معك فور قبول طلبك." : "Submit a request and we'll connect you once an agent accepts."}
                    </p>
                  </div>
                  <form onSubmit={handleSubmitRequest} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                        {isAr ? "اسمك *" : "Your name *"}
                      </label>
                      <input type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)}
                        required dir={isRTL ? "rtl" : "ltr"}
                        placeholder={isAr ? "مثال: سارة العمري" : "e.g. Sarah Al-Omari"}
                        className="w-full text-xs bg-transparent rounded-xl border border-white/[0.09] px-3 py-2.5 text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                        {isAr ? "موضوع الاستفسار *" : "What's your question about? *"}
                      </label>
                      <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
                        required dir={isRTL ? "rtl" : "ltr"}
                        placeholder={isAr ? "مثال: أسعار المتاجر" : "e.g. store pricing"}
                        className="w-full text-xs bg-transparent rounded-xl border border-white/[0.09] px-3 py-2.5 text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-colors" />
                    </div>
                    <button type="submit" disabled={createRequest.isPending || !visitorName.trim() || !topic.trim()}
                      className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                      style={{ background: "hsl(var(--primary))", color: "white" }}>
                      {createRequest.isPending
                        ? (isAr ? "جارٍ الإرسال..." : "Sending...")
                        : (isAr ? "إرسال الطلب" : "Send Request")}
                    </button>
                  </form>
                </div>
              )}

              {/* WAITING step */}
              {humanStep === "waiting" && (
                <div className="p-5 flex flex-col items-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                    <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {isAr ? "بانتظار الموافقة..." : "Waiting for an agent..."}
                    </p>
                    <p className="text-xs text-muted-foreground/50 leading-relaxed">
                      {isAr
                        ? "طلبك وصل. سيتواصل معك أحد موظفينا في أقرب وقت."
                        : "Your request was received. An agent will accept your chat shortly."}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/25">
                    #{requestId} · {visitorName}
                  </div>
                  <button onClick={resetHuman}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors underline underline-offset-2">
                    {isAr ? "إلغاء الطلب" : "Cancel request"}
                  </button>
                </div>
              )}

              {/* REJECTED step */}
              {humanStep === "rejected" && (
                <div className="p-5 flex flex-col items-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {isAr ? "لم يتوفر موظف الآن" : "No agents available right now"}
                    </p>
                    <p className="text-xs text-muted-foreground/50 leading-relaxed">
                      {isAr ? "يمكنك إرسال رسالة عبر البريد الإلكتروني أو المحاولة لاحقاً." : "Try again later or reach us by email."}
                    </p>
                  </div>
                  <a href="mailto:studiomaris@outlook.com"
                    className="text-xs font-bold transition-colors hover:underline"
                    style={{ color: "hsl(var(--primary))" }}>
                    studiomaris@outlook.com
                  </a>
                  <button onClick={resetHuman}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors underline underline-offset-2">
                    {isAr ? "حاول مرة أخرى" : "Try again"}
                  </button>
                </div>
              )}

              {/* CHAT step */}
              {humanStep === "chat" && (
                <>
                  {/* Chat header banner */}
                  <div className="px-4 py-2 flex items-center justify-between shrink-0"
                    style={{ background: "rgba(74,222,128,0.06)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-[11px] text-green-400 font-semibold">
                        {isAr ? "متصل بموظف MARIS" : "Connected to MARIS agent"}
                      </span>
                    </div>
                    <button onClick={handleEndChat}
                      className="text-[10px] text-muted-foreground/40 hover:text-red-400 transition-colors uppercase tracking-wider">
                      {isAr ? "إنهاء" : "End"}
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
                    {localMsgs.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground/40">
                          {isAr ? "تم قبول طلبك. ابدأ المحادثة." : "Your request was accepted. Start chatting!"}
                        </p>
                      </div>
                    )}
                    {localMsgs.map((msg) => (
                      msg.senderRole === "visitor" ? (
                        <div key={msg.id} className="flex justify-end">
                          <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed text-foreground max-w-[80%]"
                            style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }}>
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div key={msg.id} className="flex gap-2 items-start">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
                            <span className="text-[8px] font-black text-primary">M</span>
                          </div>
                          <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed text-foreground/80 max-w-[80%]"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {msg.content}
                          </div>
                        </div>
                      )
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMsg}
                    className="shrink-0 p-3 pt-2 flex gap-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)}
                      dir={isRTL ? "rtl" : "ltr"}
                      placeholder={isAr ? "اكتب رسالتك..." : "Type a message..."}
                      className="flex-1 text-xs bg-transparent rounded-xl border border-white/[0.08] px-3 py-2.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors" />
                    <button type="submit" disabled={!msgInput.trim()}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shrink-0"
                      style={{ background: "hsl(var(--primary))" }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Trigger button ─────────────────────────── */}
      <button
        onClick={() => setChatState(s => s === "closed" ? "open" : "closed")}
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: "hsl(var(--primary))", boxShadow: "0 0 20px hsl(var(--primary) / 0.35)" }}
      >
        {chatState === "open" ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>
    </div>
  );
}

/* ─── helper bubble ─── */
function AiBubble({ children, isAr }: { children: React.ReactNode; isAr: boolean }) {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
        <span className="text-[8px] font-black text-primary">M</span>
      </div>
      <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed text-foreground/80 max-w-[80%]"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {children}
      </div>
    </div>
  );
}
