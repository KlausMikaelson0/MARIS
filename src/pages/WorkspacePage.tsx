import { useState, useEffect, useRef } from "react";
import { useLang } from "@/contexts/LanguageContext";

type Project = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  milestone: string | null;
  edd: string | null;
  orderRef: string | null;
  storeUrl: string | null;
  createdAt: string;
  clientName: string | null;
  clientEmail: string | null;
};

type ProjectMessage = {
  id: number;
  projectId: number;
  sender: string;
  content: string;
  createdAt: string;
};

type ChangeOrder = {
  id: number;
  projectId: number;
  amount: string;
  reasonCategory: string;
  details: string;
  status: string;
  adminNote: string | null;
  quotedAmount: string | null;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
};

const MILESTONES = [
  { key: "discovery",    label: "Discovery",    labelAr: "الاكتشاف" },
  { key: "design",       label: "Design",       labelAr: "التصميم" },
  { key: "development",  label: "Development",  labelAr: "التطوير" },
  { key: "qa",           label: "Review & QA",  labelAr: "المراجعة والجودة" },
  { key: "delivered",    label: "Delivered",    labelAr: "مكتمل" },
];

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  modification:   { en: "Modification",    ar: "تعديل" },
  new_feature:    { en: "New Feature",     ar: "ميزة جديدة" },
  design_change:  { en: "Design Change",   ar: "تغيير تصميم" },
};

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; bg: string }> = {
  scoping:      { label: "Scoping",      labelAr: "تحديد النطاق", color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.1)" },
  in_progress:  { label: "In Progress",  labelAr: "قيد التنفيذ",  color: "rgba(59,130,246,0.9)",  bg: "rgba(59,130,246,0.1)" },
  review:       { label: "Under Review", labelAr: "قيد المراجعة", color: "rgba(201,168,76,0.9)",  bg: "rgba(201,168,76,0.1)" },
  delivered:    { label: "Delivered",    labelAr: "تم التسليم",   color: "rgba(16,185,129,0.9)",  bg: "rgba(16,185,129,0.1)" },
  transferred:  { label: "Transferred",  labelAr: "محوّل",        color: "rgba(107,114,128,0.9)", bg: "rgba(107,114,128,0.1)" },
};

const CO_STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; bg: string }> = {
  pending_review: { label: "Pending Review", labelAr: "بانتظار المراجعة", color: "rgba(251,191,36,0.9)", bg: "rgba(251,191,36,0.1)" },
  quoted:         { label: "Quote Ready",    labelAr: "السعر جاهز",        color: "rgba(201,168,76,0.9)", bg: "rgba(201,168,76,0.12)" },
  approved:       { label: "Approved",       labelAr: "موافق عليه",         color: "rgba(16,185,129,0.9)", bg: "rgba(16,185,129,0.1)" },
  rejected:       { label: "Rejected",       labelAr: "مرفوض",              color: "rgba(239,68,68,0.9)",  bg: "rgba(239,68,68,0.1)" },
};

function formatDate(iso: string, locale = "en-GB") {
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function WorkspacePage() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [refInput, setRefInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);

  const [activeTab, setActiveTab] = useState<"messages" | "changes">("messages");
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqForm, setReqForm] = useState({ reasonCategory: "modification", details: "" });
  const [submittingReq, setSubmittingReq] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchData(ref: string) {
    const [msgsRes, cosRes] = await Promise.all([
      fetch(`/api/workspace/${ref}/messages`),
      fetch(`/api/workspace/${ref}/change-orders`),
    ]);
    if (msgsRes.ok) setMessages(await msgsRes.json());
    if (cosRes.ok) setChangeOrders(await cosRes.json());
  }

  useEffect(() => {
    if (!project?.orderRef) return;
    const ref = project.orderRef;
    pollRef.current = setInterval(() => fetchData(ref), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [project?.orderRef]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const ref = refInput.trim().toUpperCase();
    if (!ref) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspace/${ref}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Project not found.");
        setLoading(false);
        return;
      }
      const proj: Project = await res.json();
      setProject(proj);
      await fetchData(ref);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgInput.trim() || !project?.orderRef) return;
    setSending(true);
    try {
      const res = await fetch(`/api/workspace/${project.orderRef}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgInput.trim() }),
      });
      if (res.ok) {
        const msg: ProjectMessage = await res.json();
        setMessages(prev => [...prev, msg]);
        setMsgInput("");
      }
    } finally {
      setSending(false);
    }
  }

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reqForm.details.trim() || !project?.orderRef) return;
    setSubmittingReq(true);
    try {
      const res = await fetch(`/api/workspace/${project.orderRef}/change-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqForm),
      });
      if (res.ok) {
        const co: ChangeOrder = await res.json();
        setChangeOrders(prev => [...prev, co]);
        setShowRequestForm(false);
        setReqForm({ reasonCategory: "modification", details: "" });
        setActiveTab("changes");
      }
    } finally {
      setSubmittingReq(false);
    }
  }

  async function handleApprove(coId: number) {
    if (!project?.orderRef) return;
    setApprovingId(coId);
    try {
      const res = await fetch(`/api/workspace/${project.orderRef}/change-orders/${coId}/approve`, { method: "PATCH" });
      if (res.ok) {
        const updated: ChangeOrder = await res.json();
        setChangeOrders(prev => prev.map(co => co.id === coId ? updated : co));
      }
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(coId: number) {
    if (!project?.orderRef) return;
    setApprovingId(coId);
    try {
      const res = await fetch(`/api/workspace/${project.orderRef}/change-orders/${coId}/reject`, { method: "PATCH" });
      if (res.ok) {
        const updated: ChangeOrder = await res.json();
        setChangeOrders(prev => prev.map(co => co.id === coId ? updated : co));
      }
    } finally {
      setApprovingId(null);
    }
  }

  const milestoneIdx = MILESTONES.findIndex(m => m.key === (project?.milestone ?? "discovery"));
  const statusCfg = STATUS_CONFIG[project?.status ?? "scoping"] ?? STATUS_CONFIG.scoping;
  const pendingCos = changeOrders.filter(co => co.status === "quoted").length;

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div
          className="w-full max-w-md rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(18,14,38,0.95), rgba(12,9,28,0.98))",
            border: "1px solid rgba(201,168,76,0.2)",
            boxShadow: "0 0 80px rgba(201,168,76,0.08)",
          }}
        >
          <div className="absolute inset-2 rounded-xl pointer-events-none" style={{ border: "1px solid rgba(201,168,76,0.1)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <img src="/maris-logo.jpg" alt="MARIS" className="w-12 h-12 rounded-xl object-cover" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-center mb-2" style={{ color: "rgba(201,168,76,0.7)" }}>
              {isAr ? "منصة إدارة المشاريع" : "Project Management"}
            </p>
            <h1 className="text-xl font-black text-center mb-1" style={{
              background: "linear-gradient(160deg, #e0e2ee 0%, #9a9caa 50%, #d8dae4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {isAr ? "مساحة العمل" : "Project Workspace"}
            </h1>
            <p className="text-[10px] text-muted-foreground/40 text-center mb-7">
              {isAr ? "أدخل رمز الطلب للوصول إلى مشروعك" : "Enter your order reference to access your project"}
            </p>

            <form onSubmit={handleLookup} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 block mb-1.5">
                  {isAr ? "رمز الطلب" : "Order Reference"}
                </label>
                <input
                  value={refInput}
                  onChange={e => setRefInput(e.target.value.toUpperCase())}
                  placeholder="MARIS-2025-001"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm font-mono text-foreground focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; }}
                />
              </div>
              {error && (
                <p className="text-xs text-red-400/80 bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
                style={{ background: "hsl(44 54% 54%)", color: "#fff", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (isAr ? "جارٍ البحث..." : "Looking up…") : (isAr ? "الوصول إلى المشروع" : "Access Project")}
              </button>
            </form>

            <p className="text-[9px] text-muted-foreground/25 text-center mt-5">
              {isAr ? "رمز الطلب موجود في عقد الخدمة الخاص بك" : "Your reference code is in your service contract"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground/30">
                  {project.orderRef}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{ color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.color}33` }}>
                  {isAr ? statusCfg.labelAr : statusCfg.label}
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground">{project.title}</h1>
              {project.description && (
                <p className="text-xs text-muted-foreground/40 mt-0.5 max-w-lg">{project.description}</p>
              )}
            </div>
            <div className="text-right">
              {project.edd && (
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-0.5">
                    {isAr ? "تاريخ التسليم المتوقع" : "Est. Delivery"}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>
                    {formatDate(project.edd, isAr ? "ar-SA" : "en-GB")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Milestone progress bar */}
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                {isAr ? "مراحل المشروع" : "Project Milestones"}
              </p>
            </div>
            <div className="flex items-center gap-0">
              {MILESTONES.map((m, i) => {
                const isCompleted = i < milestoneIdx;
                const isCurrent   = i === milestoneIdx;
                const isPending   = i > milestoneIdx;
                return (
                  <div key={m.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center min-w-0 flex-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center mb-1 shrink-0 transition-all"
                        style={{
                          background: isCompleted ? "rgba(16,185,129,0.2)" : isCurrent ? "hsl(44 54% 54%)" : "rgba(255,255,255,0.05)",
                          border: `2px solid ${isCompleted ? "rgba(16,185,129,0.6)" : isCurrent ? "hsl(44 54% 54%)" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        {isCompleted ? (
                          <svg className="w-3 h-3" fill="rgba(16,185,129,0.9)" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        ) : null}
                      </div>
                      <p className="text-[8px] text-center leading-tight truncate w-full px-1"
                        style={{ color: isCompleted ? "rgba(16,185,129,0.8)" : isCurrent ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)" }}>
                        {isAr ? m.labelAr : m.label}
                      </p>
                    </div>
                    {i < MILESTONES.length - 1 && (
                      <div className="h-0.5 flex-1 mx-1 shrink-0" style={{ background: isCompleted ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mb-4 border-b border-white/[0.05]">
          {[
            { id: "messages" as const, label: isAr ? "الرسائل" : "Messages", count: messages.length },
            { id: "changes" as const, label: isAr ? "طلبات التغيير" : "Change Orders", count: changeOrders.length, badge: pendingCos },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all relative"
              style={{ color: activeTab === t.id ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }}
            >
              {isAr ? t.label : t.label}
              {t.count > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: activeTab === t.id ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)", color: activeTab === t.id ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }}>
                  {t.count}
                </span>
              )}
              {t.badge && t.badge > 0 ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(201,168,76,0.25)", color: "rgba(229,201,122,1)" }}>
                  {t.badge} {isAr ? "جديد" : "new"}
                </span>
              ) : null}
              {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "hsl(var(--primary))" }} />}
            </button>
          ))}
        </div>

        {/* ── Messages Tab ───────────────────────────────────── */}
        {activeTab === "messages" && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl overflow-hidden flex flex-col"
              style={{ border: "1px solid rgba(255,255,255,0.06)", minHeight: "420px" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(16,185,129,0.8)" }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {isAr ? "قناة التواصل المباشر" : "Direct Communication Channel"}
                  </p>
                </div>
                <p className="text-[9px] text-muted-foreground/25">{isAr ? "يتجدد تلقائياً" : "Auto-refreshing"}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ maxHeight: "380px" }}>
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <p className="text-[10px] text-muted-foreground/30">{isAr ? "لا توجد رسائل بعد. ابدأ المحادثة." : "No messages yet. Start the conversation."}</p>
                    </div>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isClient = msg.sender === "client";
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isClient ? "flex-row-reverse" : "flex-row"}`}>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                          style={{
                            background: isClient ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)",
                            border: `1px solid ${isClient ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.1)"}`,
                          }}
                        >
                          {isClient ? "C" : "M"}
                        </div>
                        <div className={`flex flex-col gap-1 max-w-[70%] ${isClient ? "items-end" : "items-start"}`}>
                          <p className="text-[9px] text-muted-foreground/30">
                            {isClient ? (isAr ? "أنت" : "You") : "MARIS Studio"} · {formatTime(msg.createdAt)}
                          </p>
                          <div
                            className="rounded-xl px-3.5 py-2.5 text-xs leading-relaxed"
                            style={{
                              background: isClient ? "hsl(44 54% 54% / 0.15)" : "rgba(255,255,255,0.05)",
                              border: `1px solid ${isClient ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.07)"}`,
                              color: "rgba(220,222,240,0.9)",
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 p-3 border-t border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <input
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  placeholder={isAr ? "اكتب رسالتك هنا..." : "Type your message…"}
                  className="flex-1 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as unknown as React.FormEvent); } }}
                />
                <button
                  type="submit"
                  disabled={sending || !msgInput.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "hsl(44 54% 54%)", color: "#fff", opacity: sending || !msgInput.trim() ? 0.5 : 1 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Change Orders Tab ───────────────────────────────── */}
        {activeTab === "changes" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">{isAr ? "طلبات التعديل والإضافة" : "Modification & Add-on Requests"}</h3>
                <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                  {isAr ? "اطلب تعديلاً أو ميزة إضافية وسيرد عليك الاستوديو بعرض سعر" : "Request a change and the studio will respond with a quote"}
                </p>
              </div>
              <button
                onClick={() => setShowRequestForm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "hsl(var(--primary))" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {isAr ? "طلب تعديل / إضافة" : "Request Modification / Add-on"}
              </button>
            </div>

            {showRequestForm && (
              <div className="rounded-xl p-5" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>
                    {isAr ? "طلب جديد" : "New Request"}
                  </p>
                  <button onClick={() => setShowRequestForm(false)} className="text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-3">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 block mb-1">
                      {isAr ? "نوع الطلب" : "Request Category"}
                    </label>
                    <select
                      value={reqForm.reasonCategory}
                      onChange={e => setReqForm(prev => ({ ...prev, reasonCategory: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
                    >
                      <option value="modification">{isAr ? "تعديل" : "Modification"}</option>
                      <option value="new_feature">{isAr ? "ميزة جديدة" : "New Feature"}</option>
                      <option value="design_change">{isAr ? "تغيير تصميم" : "Design Change"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 block mb-1">
                      {isAr ? "وصف الطلب بالتفصيل" : "Request Details"}
                    </label>
                    <textarea
                      value={reqForm.details}
                      onChange={e => setReqForm(prev => ({ ...prev, details: e.target.value }))}
                      placeholder={isAr ? "صِف ما تحتاجه بالتفصيل..." : "Describe exactly what you need…"}
                      rows={4}
                      className="w-full rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={submittingReq || !reqForm.details.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      style={{ background: "hsl(44 54% 54%)", color: "#fff", opacity: submittingReq || !reqForm.details.trim() ? 0.5 : 1 }}
                    >
                      {submittingReq ? (isAr ? "جارٍ الإرسال..." : "Sending…") : (isAr ? "إرسال الطلب" : "Submit Request")}
                    </button>
                    <button type="button" onClick={() => setShowRequestForm(false)} className="px-4 py-2 rounded-lg text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {changeOrders.length === 0 && !showRequestForm ? (
              <div className="rounded-xl p-10 text-center" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                <svg className="w-8 h-8 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p className="text-[10px] text-muted-foreground/30">{isAr ? "لا توجد طلبات تعديل بعد." : "No change requests yet."}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {changeOrders.map(co => {
                  const coStatus = CO_STATUS_CONFIG[co.status] ?? CO_STATUS_CONFIG.pending_review;
                  const catLabel = CATEGORY_LABELS[co.reasonCategory];
                  return (
                    <div
                      key={co.id}
                      className="rounded-xl p-5"
                      style={{
                        background: co.status === "quoted" ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${co.status === "quoted" ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{ color: coStatus.color, background: coStatus.bg, border: `1px solid ${coStatus.color}33` }}>
                            {isAr ? coStatus.labelAr : coStatus.label}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/30">
                            {isAr ? catLabel?.ar : catLabel?.en}
                          </span>
                        </div>
                        <span className="text-[9px] text-muted-foreground/25 shrink-0">{formatDate(co.createdAt)}</span>
                      </div>

                      <p className="text-xs text-muted-foreground/70 leading-relaxed mb-3">{co.details}</p>

                      {co.status === "quoted" && (
                        <div className="rounded-lg p-3 mb-3" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-1">
                            {isAr ? "رد الاستوديو" : "Studio Response"}
                          </p>
                          {co.adminNote && <p className="text-xs text-muted-foreground/70 mb-2">{co.adminNote}</p>}
                          {co.quotedAmount && parseFloat(co.quotedAmount) > 0 && (
                            <p className="text-sm font-black" style={{ color: "hsl(var(--primary))" }}>
                              +{parseFloat(co.quotedAmount).toLocaleString("en-SA")} SAR
                            </p>
                          )}
                        </div>
                      )}

                      {co.status === "quoted" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(co.id)}
                            disabled={approvingId === co.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "rgb(52,211,153)", opacity: approvingId === co.id ? 0.5 : 1 }}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            {isAr ? "موافقة وتأكيد" : "Approve & Confirm"}
                          </button>
                          <button
                            onClick={() => handleReject(co.id)}
                            disabled={approvingId === co.id}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(252,165,165,0.8)", opacity: approvingId === co.id ? 0.5 : 1 }}
                          >
                            {isAr ? "رفض" : "Decline"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-5 border-t border-white/[0.04]">
          <button
            onClick={() => { setProject(null); setMessages([]); setChangeOrders([]); }}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {isAr ? "تسجيل الخروج من المشروع" : "Exit Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
