import { useState, useRef, useEffect, useCallback } from "react";
import {
  useGetDashboardSummary,
  useListLeads,
  useListTickets,
  useListProductSettings,
  useUpdateProductSettings,
  useListRatings,
  useDeleteRating,
  useListLiveChatRequests,
  useAcceptLiveChatRequest,
  useRejectLiveChatRequest,
  useCloseLiveChatRequest,
  useSendLiveChatMessage,
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{
        borderColor: accent ? "hsl(var(--primary) / 0.3)" : "rgba(255,255,255,0.07)",
        background: accent ? "hsl(var(--primary) / 0.06)" : "rgba(255,255,255,0.02)",
      }}
    >
      <div className="text-3xl font-black mb-1"
        style={{ color: accent ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
        {value}
      </div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">{label}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-9 h-5 rounded-full transition-all duration-200 focus:outline-none shrink-0"
        style={{
          background: checked ? "hsl(var(--primary))" : "rgba(255,255,255,0.10)",
          border: `1px solid ${checked ? "hsl(var(--primary) / 0.5)" : "rgba(255,255,255,0.12)"}`,
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
          style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
        />
      </button>
      <span className="text-xs text-muted-foreground/50 group-hover:text-muted-foreground/80 transition-colors">{label}</span>
    </label>
  );
}

const statusColors: Record<string, string> = {
  new: "text-primary",
  contacted: "text-blue-400",
  converted: "text-green-400",
  closed: "text-muted-foreground/40",
};
const ticketStatusColors: Record<string, string> = {
  pending: "text-yellow-400",
  in_progress: "text-blue-400",
  resolved: "text-green-400",
  cancelled: "text-muted-foreground/40",
};

type ProdFormType = {
  id: string; name: string; nameAr: string; price: string; tag: string; tagAr: string;
  desc: string; descAr: string; timeline: string; timelineAr: string;
  includes: string; includesAr: string; accent: string; visible: boolean; demoUrl: string;
};

function ProdFormPanel({
  form, setForm, saving, isNew, onSave, onCancel,
}: {
  form: ProdFormType;
  setForm: React.Dispatch<React.SetStateAction<ProdFormType>>;
  saving: boolean;
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [translating, setTranslating] = useState(false);

  const f = (field: keyof ProdFormType, val: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const inputCls = "w-full rounded-xl border border-white/[0.09] px-3 py-2 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-colors";
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1";

  async function autoTranslate() {
    if (!form.name && !form.desc) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tag: form.tag,
          desc: form.desc,
          timeline: form.timeline,
          includes: form.includes.split("\n").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("translate failed");
      const data = await res.json() as {
        nameAr?: string; tagAr?: string; descAr?: string; timelineAr?: string; includesAr?: string[];
      };
      setForm(prev => ({
        ...prev,
        nameAr: data.nameAr ?? prev.nameAr,
        tagAr: data.tagAr ?? prev.tagAr,
        descAr: data.descAr ?? prev.descAr,
        timelineAr: data.timelineAr ?? prev.timelineAr,
        includesAr: Array.isArray(data.includesAr) ? data.includesAr.join("\n") : prev.includesAr,
      }));
    } catch (e) {
      console.error("translate error", e);
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/20 p-5 space-y-4" style={{ background: "rgba(201,168,76,0.04)" }}>
      {isNew && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Product ID *</label>
            <input className={inputCls} value={form.id} onChange={e => f("id", e.target.value)} placeholder="e.g. premium" />
          </div>
          <div>
            <label className={labelCls}>Price (SAR) *</label>
            <input className={inputCls} type="number" value={form.price} onChange={e => f("price", e.target.value)} placeholder="0" />
          </div>
        </div>
      )}
      {!isNew && (
        <div>
          <label className={labelCls}>Price (SAR)</label>
          <input className={inputCls} type="number" value={form.price} onChange={e => f("price", e.target.value)} placeholder="0" />
        </div>
      )}

      {/* EN fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Name (EN) *</label>
          <input className={inputCls} value={form.name} onChange={e => f("name", e.target.value)} placeholder="Launch Store" />
        </div>
        <div>
          <label className={labelCls}>Name (AR)</label>
          <input className={inputCls} value={form.nameAr} onChange={e => f("nameAr", e.target.value)} placeholder="متجر البداية" dir="rtl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Tag (EN)</label>
          <input className={inputCls} value={form.tag} onChange={e => f("tag", e.target.value)} placeholder="Starter" />
        </div>
        <div>
          <label className={labelCls}>Tag (AR)</label>
          <input className={inputCls} value={form.tagAr} onChange={e => f("tagAr", e.target.value)} placeholder="البداية" dir="rtl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Description (EN)</label>
          <textarea className={inputCls + " resize-none"} rows={3} value={form.desc} onChange={e => f("desc", e.target.value)} placeholder="Short description..." />
        </div>
        <div>
          <label className={labelCls}>Description (AR)</label>
          <textarea className={inputCls + " resize-none"} rows={3} value={form.descAr} onChange={e => f("descAr", e.target.value)} placeholder="وصف قصير..." dir="rtl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Timeline (EN)</label>
          <input className={inputCls} value={form.timeline} onChange={e => f("timeline", e.target.value)} placeholder="2–3 weeks" />
        </div>
        <div>
          <label className={labelCls}>Timeline (AR)</label>
          <input className={inputCls} value={form.timelineAr} onChange={e => f("timelineAr", e.target.value)} placeholder="2–3 أسابيع" dir="rtl" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>What's Included (EN) — one per line</label>
          <textarea className={inputCls + " resize-none"} rows={5} value={form.includes} onChange={e => f("includes", e.target.value)} placeholder={"Feature one\nFeature two\nFeature three"} />
        </div>
        <div>
          <label className={labelCls}>What's Included (AR) — one per line</label>
          <textarea className={inputCls + " resize-none"} rows={5} value={form.includesAr} onChange={e => f("includesAr", e.target.value)} placeholder={"الميزة الأولى\nالميزة الثانية"} dir="rtl" />
        </div>
      </div>

      {/* Auto-translate button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={autoTranslate}
          disabled={translating || (!form.name && !form.desc)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
          style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", color: "rgba(201,168,76,0.9)" }}
        >
          {translating ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Translating…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              ✨ Auto-fill Arabic from English
            </>
          )}
        </button>
      </div>

      {/* Demo URL + Accent + Visible */}
      <div>
        <label className={labelCls}>Demo URL (optional)</label>
        <input className={inputCls} value={form.demoUrl} onChange={e => f("demoUrl", e.target.value)} placeholder="https://your-demo-store.com" />
        <p className="text-[10px] text-muted-foreground/30 mt-1">Customers will see a "Live Demo" button that opens this URL in an embedded preview</p>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className={labelCls}>Accent colour</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.accent} onChange={e => f("accent", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
            <span className="text-xs font-mono text-muted-foreground/40">{form.accent}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground/60">
            <input type="checkbox" checked={form.visible} onChange={e => f("visible", e.target.checked)} className="w-4 h-4 accent-primary rounded" />
            Visible to customers
          </label>
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          disabled={saving || !form.name}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: "hsl(var(--primary))", color: "#fff" }}
        >
          {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all text-muted-foreground/60 hover:text-muted-foreground"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  /* ── admin auth state ── */
  const [authState, setAuthState] = useState<"checking" | "login" | "authenticated">("checking");
  const [loginEmail, setLoginEmail]     = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError]     = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("maris_admin_token");
    if (!token) { setAuthState("login"); return; }
    fetch("/api/admin/verify", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((d: { valid?: boolean }) => setAuthState(d.valid ? "authenticated" : "login"))
      .catch(() => setAuthState("login"));
  }, []);

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json() as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setLoginError(data.error ?? "Invalid credentials");
        return;
      }
      sessionStorage.setItem("maris_admin_token", data.token);
      setAuthState("authenticated");
    } catch {
      setLoginError("Connection error. Try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleAdminLogout() {
    sessionStorage.removeItem("maris_admin_token");
    setAuthState("login");
    setLoginEmail("");
    setLoginPassword("");
  }

  const [tab, setTab] = useState<"overview" | "products" | "ratings" | "livechat" | "workspace">("overview");

  /* ── workspace admin state ── */
  type WsProject = {
    id: number; title: string; status: string; milestone: string | null;
    edd: string | null; orderRef: string | null; description: string | null;
    storeUrl: string | null; createdAt: string;
    clientName: string | null; clientEmail: string | null; clientPhone: string | null;
  };
  type WsMessage = { id: number; projectId: number; sender: string; content: string; createdAt: string };
  type WsChangeOrder = {
    id: number; projectId: number; amount: string; reasonCategory: string;
    details: string; status: string; adminNote: string | null;
    quotedAmount: string | null; requestedBy: string; createdAt: string;
  };
  const [wsProjects, setWsProjects] = useState<WsProject[]>([]);
  const [wsLoading, setWsLoading] = useState(false);
  const [selectedWsProject, setSelectedWsProject] = useState<WsProject | null>(null);
  const [wsMessages, setWsMessages] = useState<WsMessage[]>([]);
  const [wsChangeOrders, setWsChangeOrders] = useState<WsChangeOrder[]>([]);
  const [wsAdminMsg, setWsAdminMsg] = useState("");
  const [wsSendingMsg, setWsSendingMsg] = useState(false);
  const [wsPanel, setWsPanel] = useState<"messages" | "changes" | "settings">("messages");
  const [wsNewProjectForm, setWsNewProjectForm] = useState(false);
  const [wsForm, setWsForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "", title: "",
    description: "", orderRef: "", edd: "", milestone: "discovery", status: "scoping",
  });
  const [wsSavingProject, setWsSavingProject] = useState(false);
  const [wsSurchargeForm, setWsSurchargeForm] = useState<{
    open: boolean; amount: string; reasonCategory: string; details: string;
  }>({ open: false, amount: "", reasonCategory: "modification", details: "" });
  const [wsSubmittingSurcharge, setWsSubmittingSurcharge] = useState(false);
  const [wsQuoteForm, setWsQuoteForm] = useState<{
    open: boolean; coId: number | null; adminNote: string; quotedAmount: string;
  }>({ open: false, coId: null, adminNote: "", quotedAmount: "" });
  const [wsSubmittingQuote, setWsSubmittingQuote] = useState(false);
  const wsMessagesEndRef = useRef<HTMLDivElement>(null);

  /* ── live chat admin state ── */
  const [activeChatId, setActiveChatId]   = useState<number | null>(null);
  const [adminMsgInput, setAdminMsgInput] = useState("");
  const [adminLocalMsgs, setAdminLocalMsgs] = useState<{ id: number; senderRole: string; content: string }[]>([]);
  const [lastAdminMsgId, setLastAdminMsgId] = useState(0);
  const adminMsgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adminBottomRef  = useRef<HTMLDivElement>(null);

  /* product management state */
  const emptyProdForm: ProdFormType = {
    id: "", name: "", nameAr: "", price: "", tag: "", tagAr: "",
    desc: "", descAr: "", timeline: "", timelineAr: "",
    includes: "", includesAr: "", accent: "#C9A84C", visible: true, demoUrl: "",
  };
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [prodForm, setProdForm] = useState<ProdFormType>(emptyProdForm);
  const [prodSaving, setProdSaving] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: leads, isLoading: leadsLoading } = useListLeads();
  const { data: tickets, isLoading: ticketsLoading } = useListTickets();
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = useListProductSettings();
  const { data: allRatings, isLoading: ratingsLoading, refetch: refetchRatings } = useListRatings({});
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useListProducts();
  const updateSettings = useUpdateProductSettings();
  const deleteRating   = useDeleteRating();
  const createProduct  = useCreateProduct();
  const updateProduct  = useUpdateProduct();
  const deleteProduct  = useDeleteProduct();

  /* live chat mutations */
  const acceptRequest = useAcceptLiveChatRequest();
  const rejectRequest = useRejectLiveChatRequest();
  const closeChatMut  = useCloseLiveChatRequest();
  const sendAdminMsg  = useSendLiveChatMessage();
  const { data: allLiveChatRequests, refetch: refetchLiveChat } = useListLiveChatRequests({});

  function prodToForm(p: Product): ProdFormType {
    return {
      id: p.id, name: p.name, nameAr: p.nameAr, price: String(p.price),
      tag: p.tag, tagAr: p.tagAr, desc: p.desc, descAr: p.descAr,
      timeline: p.timeline, timelineAr: p.timelineAr,
      includes: p.includes.join("\n"), includesAr: p.includesAr.join("\n"),
      accent: p.accent, visible: p.visible, demoUrl: p.demoUrl ?? "",
    };
  }

  function startEditProduct(p: Product) {
    setAddingProduct(false);
    setEditingProductId(p.id);
    setProdForm(prodToForm(p));
  }

  function startAddProduct() {
    setEditingProductId(null);
    setAddingProduct(true);
    setProdForm(emptyProdForm);
  }

  function cancelProdForm() {
    setEditingProductId(null);
    setAddingProduct(false);
    setProdForm(emptyProdForm);
  }

  async function saveProdForm() {
    setProdSaving(true);
    try {
      const payload = {
        name: prodForm.name, nameAr: prodForm.nameAr,
        price: parseInt(prodForm.price) || 0,
        tag: prodForm.tag, tagAr: prodForm.tagAr,
        desc: prodForm.desc, descAr: prodForm.descAr,
        timeline: prodForm.timeline, timelineAr: prodForm.timelineAr,
        includes: prodForm.includes.split("\n").map(s => s.trim()).filter(Boolean),
        includesAr: prodForm.includesAr.split("\n").map(s => s.trim()).filter(Boolean),
        accent: prodForm.accent, visible: prodForm.visible,
        demoUrl: prodForm.demoUrl || null,
        accentBright: prodForm.accent + "cc",
        gradient: `linear-gradient(135deg, ${prodForm.accent}40 0%, ${prodForm.accent}10 100%)`,
      };
      if (addingProduct) {
        await createProduct.mutateAsync({ data: { id: prodForm.id, ...payload } });
      } else if (editingProductId) {
        await updateProduct.mutateAsync({ id: editingProductId, data: payload });
      }
      await refetchProducts();
      cancelProdForm();
    } finally {
      setProdSaving(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm(`Delete product "${id}"? This cannot be undone.`)) return;
    await deleteProduct.mutateAsync({ id });
    refetchProducts();
  }

  async function handleToggle(productId: string, field: "listed" | "ratingsEnabled", value: boolean) {
    const current = settings?.find(s => s.productId === productId);
    await updateSettings.mutateAsync({
      productId,
      data: {
        listed:         field === "listed"          ? value : (current?.listed ?? true),
        ratingsEnabled: field === "ratingsEnabled"  ? value : (current?.ratingsEnabled ?? false),
      },
    });
    refetchSettings();
  }

  async function handleDeleteRating(id: number) {
    await deleteRating.mutateAsync({ id });
    refetchRatings();
  }

  /* live chat helpers */
  async function handleAccept(id: number) {
    await acceptRequest.mutateAsync({ id });
    setActiveChatId(id);
    setAdminLocalMsgs([]);
    setLastAdminMsgId(0);
    refetchLiveChat();
  }

  async function handleReject(id: number) {
    await rejectRequest.mutateAsync({ id });
    if (activeChatId === id) setActiveChatId(null);
    refetchLiveChat();
  }

  async function handleCloseAdminChat(id: number) {
    await closeChatMut.mutateAsync({ id });
    setActiveChatId(null);
    setAdminLocalMsgs([]);
    setLastAdminMsgId(0);
    refetchLiveChat();
  }

  async function handleAdminSendMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!adminMsgInput.trim() || !activeChatId) return;
    const optimistic = { id: Date.now(), senderRole: "agent", content: adminMsgInput.trim() };
    setAdminLocalMsgs(prev => [...prev, optimistic]);
    const sent = adminMsgInput.trim();
    setAdminMsgInput("");
    try {
      const msg = await sendAdminMsg.mutateAsync({ id: activeChatId, data: { senderRole: "agent", content: sent } });
      setAdminLocalMsgs(prev => prev.map(m => m.id === optimistic.id ? msg : m));
      setLastAdminMsgId(prev => Math.max(prev, msg.id));
    } catch {
      setAdminLocalMsgs(prev => prev.filter(m => m.id !== optimistic.id));
    }
  }

  /* poll active chat for visitor replies */
  const pollAdminMessages = useCallback(async () => {
    if (!activeChatId) return;
    try {
      const url = lastAdminMsgId > 0
        ? `/api/live-chat/${activeChatId}/messages?after=${lastAdminMsgId}`
        : `/api/live-chat/${activeChatId}/messages`;
      const res = await fetch(url);
      if (!res.ok) return;
      const msgs: { id: number; senderRole: string; content: string }[] = await res.json();
      if (msgs.length > 0) {
        setAdminLocalMsgs(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newOnes = msgs.filter(m => !existingIds.has(m.id));
          return [...prev, ...newOnes];
        });
        setLastAdminMsgId(msgs[msgs.length - 1].id);
      }
    } catch { /* ignore */ }
  }, [activeChatId, lastAdminMsgId]);

  useEffect(() => {
    if (adminMsgPollRef.current) clearInterval(adminMsgPollRef.current);
    if (activeChatId) {
      adminMsgPollRef.current = setInterval(pollAdminMessages, 2500);
    }
    return () => { if (adminMsgPollRef.current) clearInterval(adminMsgPollRef.current); };
  }, [activeChatId, pollAdminMessages]);

  /* init admin messages when chat opens */
  useEffect(() => {
    if (!activeChatId) return;
    (async () => {
      try {
        const res = await fetch(`/api/live-chat/${activeChatId}/messages`);
        if (res.ok) {
          const msgs: { id: number; senderRole: string; content: string }[] = await res.json();
          setAdminLocalMsgs(msgs);
          if (msgs.length > 0) setLastAdminMsgId(msgs[msgs.length - 1].id);
        }
      } catch { /* ignore */ }
    })();
  }, [activeChatId]);

  /* scroll admin chat bottom */
  useEffect(() => { adminBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [adminLocalMsgs]);

  /* auto-refresh live chat list every 5s when on that tab */
  useEffect(() => {
    if (tab !== "livechat") return;
    const iv = setInterval(refetchLiveChat, 5000);
    return () => clearInterval(iv);
  }, [tab, refetchLiveChat]);

  /* ── workspace data loading ── */
  useEffect(() => {
    if (tab !== "workspace") return;
    (async () => {
      setWsLoading(true);
      try {
        const res = await fetch("/api/admin/workspace/projects");
        if (res.ok) setWsProjects(await res.json());
      } finally {
        setWsLoading(false);
      }
    })();
  }, [tab]);

  useEffect(() => {
    wsMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [wsMessages]);

  async function wsRefreshProjectData(projectId: number) {
    const [msgsRes, cosRes] = await Promise.all([
      fetch(`/api/admin/workspace/projects/${projectId}/messages`),
      fetch(`/api/admin/workspace/projects/${projectId}/change-orders`),
    ]);
    if (msgsRes.ok) setWsMessages(await msgsRes.json());
    if (cosRes.ok) setWsChangeOrders(await cosRes.json());
  }

  async function wsSelectProject(p: (typeof wsProjects)[0]) {
    setSelectedWsProject(p);
    setWsPanel("messages");
    wsRefreshProjectData(p.id);
  }

  async function wsUpdateProject(id: number, patch: Record<string, unknown>) {
    const res = await fetch(`/api/admin/workspace/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setWsProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      if (selectedWsProject?.id === id) setSelectedWsProject(prev => prev ? { ...prev, ...updated } : null);
    }
  }

  async function wsSendAdminMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!wsAdminMsg.trim() || !selectedWsProject) return;
    setWsSendingMsg(true);
    try {
      const res = await fetch(`/api/admin/workspace/projects/${selectedWsProject.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: wsAdminMsg.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setWsMessages(prev => [...prev, msg]);
        setWsAdminMsg("");
      }
    } finally {
      setWsSendingMsg(false);
    }
  }

  async function wsCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setWsSavingProject(true);
    try {
      const res = await fetch("/api/admin/workspace/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wsForm),
      });
      if (res.ok) {
        const proj = await res.json();
        setWsProjects(prev => [proj, ...prev]);
        setWsNewProjectForm(false);
        setWsForm({ clientName: "", clientEmail: "", clientPhone: "", title: "", description: "", orderRef: "", edd: "", milestone: "discovery", status: "scoping" });
      }
    } finally {
      setWsSavingProject(false);
    }
  }

  async function wsAddSurcharge(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWsProject) return;
    setWsSubmittingSurcharge(true);
    try {
      const res = await fetch(`/api/admin/workspace/projects/${selectedWsProject.id}/change-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: wsSurchargeForm.amount,
          reasonCategory: wsSurchargeForm.reasonCategory,
          details: wsSurchargeForm.details,
        }),
      });
      if (res.ok) {
        const co = await res.json();
        setWsChangeOrders(prev => [co, ...prev]);
        setWsSurchargeForm({ open: false, amount: "", reasonCategory: "modification", details: "" });
      }
    } finally {
      setWsSubmittingSurcharge(false);
    }
  }

  async function wsSubmitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!wsQuoteForm.coId || !selectedWsProject) return;
    setWsSubmittingQuote(true);
    try {
      const res = await fetch(`/api/admin/workspace/projects/${selectedWsProject.id}/change-orders/${wsQuoteForm.coId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "quoted", adminNote: wsQuoteForm.adminNote, quotedAmount: wsQuoteForm.quotedAmount }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWsChangeOrders(prev => prev.map(co => co.id === wsQuoteForm.coId ? updated : co));
        setWsQuoteForm({ open: false, coId: null, adminNote: "", quotedAmount: "" });
      }
    } finally {
      setWsSubmittingQuote(false);
    }
  }

  /* ── auth gates ── */
  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authState === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(252 28% 3%)" }}>
        <div
          className="w-full max-w-sm rounded-2xl border p-8 space-y-6"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(201,168,76,0.2)", backdropFilter: "blur(20px)" }}
        >
          {/* Logo */}
          <div className="text-center space-y-1">
            <img src="/maris-logo.jpg" alt="MARIS" className="w-10 h-10 rounded-xl mx-auto mb-3 object-cover" />
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: "hsl(var(--primary) / 0.7)" }}>Admin Access</p>
            <h1 className="text-xl font-bold text-foreground">Sign in to Dashboard</h1>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            {loginError && (
              <p className="text-xs text-red-400/80 text-center">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              style={{ background: "hsl(var(--primary))", color: "#fff" }}
            >
              {loginLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview"   as const, label: "Overview" },
    { id: "products"   as const, label: "Products" },
    { id: "ratings"    as const, label: "Ratings" },
    { id: "livechat"   as const, label: "Live Chat" },
    { id: "workspace"  as const, label: "Workspace" },
  ];

  return (
    <div className="relative min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-5">

        <div className="mb-8">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: "hsl(var(--primary) / 0.7)" }}>
            Admin
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-foreground">Platform Dashboard</h1>
        </div>
        <button
          onClick={handleAdminLogout}
          className="absolute top-20 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/[0.06]">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all relative"
              style={{ color: tab === t.id ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }}
            >
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "hsl(var(--primary))" }} />
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────────────── */}
        {tab === "overview" && (
          <>
            {summaryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />)}
              </div>
            ) : summary && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                <StatCard label="Total Leads"      value={summary.totalLeads}        accent />
                <StatCard label="Active Projects"  value={summary.activeProjects} />
                <StatCard label="Delivered"        value={summary.deliveredProjects} />
                <StatCard label="Open Tickets"     value={summary.openTickets} />
                <StatCard label="Clients"          value={summary.totalClients} />
                <StatCard label="Signed Contracts" value={summary.signedContracts} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Leads */}
              <div>
                <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground/40 mb-4">Recent Leads</h2>
                {leadsLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }} />)}</div>
                ) : !leads?.length ? (
                  <div className="rounded-xl border border-white/[0.06] p-8 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-muted-foreground/40 text-sm">No leads yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leads.slice(0, 8).map(lead => (
                      <div key={lead.id} className="rounded-xl border border-white/[0.06] p-4 flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs truncate text-foreground">{lead.brandName}</span>
                            {lead.budgetRange && (
                              <span className="text-[9px] font-mono shrink-0" style={{ color: "hsl(var(--primary))" }}>{lead.budgetRange}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 font-mono truncate">
                            {lead.contactName} · {lead.contactEmail}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[9px] font-mono font-bold uppercase ${statusColors[lead.status] || "text-muted-foreground/40"}`}>
                            {lead.status}
                          </span>
                          <span className="text-[9px] text-muted-foreground/30 font-mono">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Tickets */}
              <div>
                <h2 className="text-xs font-bold tracking-widest uppercase text-muted-foreground/40 mb-4">Recent Tickets</h2>
                {ticketsLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }} />)}</div>
                ) : !tickets?.length ? (
                  <div className="rounded-xl border border-white/[0.06] p-8 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-muted-foreground/40 text-sm">No tickets yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tickets.slice(0, 8).map(ticket => (
                      <div key={ticket.id} className="rounded-xl border border-white/[0.06] p-4 flex items-center justify-between gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[9px] font-mono font-bold uppercase shrink-0 ${
                              ticket.type === "revision" ? "text-primary" :
                              ticket.type === "support" ? "text-blue-400" : "text-amber-400"
                            }`}>{ticket.type}</span>
                            <span className="font-semibold text-xs truncate text-foreground">{ticket.title}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground/40 font-mono">
                            {ticket.creditsCost} credit · {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase shrink-0 ${ticketStatusColors[ticket.status] || ""}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Products ─────────────────────────────────────────── */}
        {tab === "products" && (
          <div>
            {/* Add Product button */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-muted-foreground/50">
                Manage your product catalogue. Add, edit, delete, and control visibility.
              </p>
              {!addingProduct && !editingProductId && (
                <button
                  onClick={startAddProduct}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)", color: "hsl(var(--primary))" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add Product
                </button>
              )}
            </div>

            {/* Inline add form */}
            {addingProduct && (
              <ProdFormPanel
                form={prodForm} setForm={setProdForm} saving={prodSaving}
                isNew onSave={saveProdForm} onCancel={cancelProdForm}
              />
            )}

            {/* Products list */}
            {productsLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => {
                  const s = settings?.find(x => x.productId === product.id);
                  const listed = s?.listed ?? true;
                  const ratingsEnabled = s?.ratingsEnabled ?? true;
                  const isEditing = editingProductId === product.id;
                  return (
                    <div key={product.id} className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                      {/* Header row */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: `${product.accent}30`, border: `1px solid ${product.accent}40` }} />
                          <div>
                            <p className="text-sm font-bold text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground/40 font-mono">SAR {product.price.toLocaleString()} · {product.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Toggle checked={listed} onChange={v => handleToggle(product.id, "listed", v)} label="Listed" />
                          <Toggle checked={ratingsEnabled} onChange={v => handleToggle(product.id, "ratingsEnabled", v)} label="Ratings" />
                          {!isEditing ? (
                            <>
                              <button
                                onClick={() => startEditProduct(product)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                              >Edit</button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all text-red-400/60 hover:text-red-400"
                                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
                              >Delete</button>
                            </>
                          ) : (
                            <button
                              onClick={cancelProdForm}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all text-muted-foreground/50 hover:text-muted-foreground"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >Cancel</button>
                          )}
                        </div>
                      </div>
                      {/* Inline edit form */}
                      {isEditing && (
                        <div className="border-t border-white/[0.05] p-4">
                          <ProdFormPanel
                            form={prodForm} setForm={setProdForm} saving={prodSaving}
                            isNew={false} onSave={saveProdForm} onCancel={cancelProdForm}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Ratings ─────────────────────────────────────────── */}
        {tab === "ratings" && (
          <div>
            <p className="text-xs text-muted-foreground/50 mb-6">
              All submitted ratings across all products. Delete any rating from here.
            </p>
            {ratingsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }} />)}</div>
            ) : !allRatings?.length ? (
              <div className="rounded-xl border border-white/[0.06] p-10 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-muted-foreground/40 text-sm">No ratings yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allRatings.map(r => (
                  <div key={r.id} className="rounded-xl border border-white/[0.06] p-4 flex items-start justify-between gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-semibold text-xs text-foreground">{r.authorName}</span>
                        <span className="text-[10px] font-mono text-muted-foreground/30 uppercase">{r.productId}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} className="w-3 h-3" fill={star <= r.rating ? "hsl(var(--primary))" : "rgba(255,255,255,0.1)"} viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground/50 leading-relaxed">{r.comment}</p>}
                      <p className="text-[10px] text-muted-foreground/25 font-mono mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRating(r.id)}
                      className="text-red-400/40 hover:text-red-400 transition-colors shrink-0 p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Live Chat ─────────────────────────────────────────── */}
        {tab === "livechat" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Requests list */}
            <div>
              <p className="text-xs text-muted-foreground/50 mb-4">
                Incoming chat requests from visitors. Click <strong>Accept</strong> to open a live chat.
              </p>
              {!allLiveChatRequests?.length ? (
                <div className="rounded-xl border border-white/[0.06] p-8 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <p className="text-muted-foreground/40 text-sm">No live chat requests yet.</p>
                  <p className="text-muted-foreground/25 text-xs mt-1">Waiting for visitors to submit a request…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allLiveChatRequests.map((req: { id: number; visitorName: string; topic: string; status: string; createdAt: string }) => {
                    const isPending  = req.status === "pending";
                    const isAccepted = req.status === "accepted";
                    const isActive   = activeChatId === req.id;
                    return (
                      <div key={req.id}
                        className={`rounded-xl border p-4 transition-all ${isActive ? "border-primary/30" : "border-white/[0.06]"}`}
                        style={{ background: isActive ? "hsl(var(--primary) / 0.05)" : "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="text-xs font-bold text-foreground">{req.visitorName}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                isPending  ? "bg-yellow-400/10 text-yellow-400" :
                                isAccepted ? "bg-green-400/10 text-green-400"  :
                                "bg-white/5 text-muted-foreground/40"
                              }`}>
                                {req.status}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground/25">#{req.id}</span>
                            </div>
                            <p className="text-xs text-muted-foreground/60 truncate">{req.topic}</p>
                            <p className="text-[10px] text-muted-foreground/25 font-mono mt-0.5">{new Date(req.createdAt).toLocaleTimeString()}</p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            {isPending && (
                              <>
                                <button onClick={() => handleAccept(req.id)}
                                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95"
                                  style={{ background: "hsl(var(--primary))", color: "white" }}>
                                  Accept
                                </button>
                                <button onClick={() => handleReject(req.id)}
                                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/[0.08] text-muted-foreground/50 hover:text-red-400 hover:border-red-400/30 transition-colors">
                                  Reject
                                </button>
                              </>
                            )}
                            {isAccepted && !isActive && (
                              <button onClick={() => { setActiveChatId(req.id); setAdminLocalMsgs([]); setLastAdminMsgId(0); }}
                                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                                style={{ background: "rgba(74,222,128,0.15)", color: "rgb(74,222,128)", border: "1px solid rgba(74,222,128,0.3)" }}>
                                Open Chat
                              </button>
                            )}
                            {isAccepted && isActive && (
                              <button onClick={() => handleCloseAdminChat(req.id)}
                                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-400/20 text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-colors">
                                End Chat
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Active chat panel */}
            <div>
              {!activeChatId ? (
                <div className="rounded-xl border border-white/[0.06] p-8 text-center flex flex-col items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.02)", minHeight: 200 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
                    <svg className="w-5 h-5 text-primary/40" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground/40">No active chat</p>
                  <p className="text-xs text-muted-foreground/25">Accept a request to start chatting</p>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/20 overflow-hidden flex flex-col"
                  style={{ background: "hsl(252 28% 5%)", minHeight: 380, maxHeight: 500 }}>
                  {/* Chat header */}
                  <div className="px-4 py-2.5 flex items-center justify-between shrink-0"
                    style={{ background: "rgba(74,222,128,0.06)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <span className="text-xs font-semibold text-green-400">
                        Active Chat #{activeChatId}
                      </span>
                    </div>
                    <button onClick={() => handleCloseAdminChat(activeChatId)}
                      className="text-[10px] text-muted-foreground/40 hover:text-red-400 transition-colors uppercase tracking-wider font-bold">
                      End Chat
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ minHeight: 0 }}>
                    {adminLocalMsgs.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-xs text-muted-foreground/40">Chat is live. Waiting for visitor to write…</p>
                      </div>
                    )}
                    {adminLocalMsgs.map((msg) => (
                      msg.senderRole === "agent" ? (
                        <div key={msg.id} className="flex justify-end">
                          <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed text-foreground max-w-[80%]"
                            style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.25)" }}>
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div key={msg.id} className="flex gap-2 items-start">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-muted-foreground/60"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            V
                          </div>
                          <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed text-foreground/80 max-w-[80%]"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            {msg.content}
                          </div>
                        </div>
                      )
                    ))}
                    <div ref={adminBottomRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleAdminSendMsg}
                    className="shrink-0 p-3 pt-2 flex gap-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <input type="text" value={adminMsgInput} onChange={e => setAdminMsgInput(e.target.value)}
                      placeholder="Type a reply..."
                      className="flex-1 text-xs bg-transparent rounded-xl border border-white/[0.08] px-3 py-2.5 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors" />
                    <button type="submit" disabled={!adminMsgInput.trim()}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shrink-0"
                      style={{ background: "hsl(var(--primary))" }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Workspace Tab ──────────────────────────────────── */}
        {tab === "workspace" && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[600px]">

            {/* ─ Left: Project List ─ */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">Projects</p>
                <button
                  onClick={() => setWsNewProjectForm(v => !v)}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "hsl(var(--primary))" }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New
                </button>
              </div>

              {wsNewProjectForm && (
                <form onSubmit={wsCreateProject} className="rounded-xl p-4 mb-2 flex flex-col gap-2.5"
                  style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-1">New Project</p>
                  {[
                    { label: "Client Name *", key: "clientName", placeholder: "Ahmed Al-Rashidi", required: true },
                    { label: "Client Email *", key: "clientEmail", placeholder: "client@example.com", required: true },
                    { label: "Client Phone", key: "clientPhone", placeholder: "+966 5x xxx xxxx", required: false },
                    { label: "Project Title *", key: "title", placeholder: "Brand Store — Fashion", required: true },
                    { label: "Description", key: "description", placeholder: "Brief description…", required: false },
                    { label: "Order Ref (auto if blank)", key: "orderRef", placeholder: "MARIS-2025-001", required: false },
                    { label: "Est. Delivery Date", key: "edd", placeholder: "", required: false, type: "date" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-0.5">{f.label}</label>
                      <input
                        type={f.type ?? "text"}
                        required={f.required}
                        placeholder={f.placeholder}
                        value={wsForm[f.key as keyof typeof wsForm]}
                        onChange={e => setWsForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-0.5">Milestone</label>
                      <select value={wsForm.milestone} onChange={e => setWsForm(prev => ({ ...prev, milestone: e.target.value }))}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {["discovery","design","development","qa","delivered"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-0.5">Status</label>
                      <select value={wsForm.status} onChange={e => setWsForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {["scoping","in_progress","review","delivered","transferred"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={wsSavingProject}
                      className="flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all"
                      style={{ background: "hsl(268 72% 55%)", color: "#fff", opacity: wsSavingProject ? 0.6 : 1 }}>
                      {wsSavingProject ? "Creating…" : "Create Project"}
                    </button>
                    <button type="button" onClick={() => setWsNewProjectForm(false)}
                      className="px-3 py-1.5 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {wsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : wsProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[10px] text-muted-foreground/30">No projects yet.</p>
                </div>
              ) : (
                wsProjects.map(p => {
                  const isSelected = selectedWsProject?.id === p.id;
                  return (
                    <button key={p.id} onClick={() => wsSelectProject(p)}
                      className="w-full text-left rounded-xl p-3 transition-all"
                      style={{
                        background: isSelected ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.06)"}`,
                      }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[10px] font-bold text-foreground leading-tight truncate">{p.title}</p>
                        <span className="text-[8px] font-mono shrink-0" style={{ color: "rgba(201,168,76,0.6)" }}>{p.orderRef ?? "—"}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground/40 truncate">{p.clientName ?? p.clientEmail ?? "—"}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground/25">{p.milestone ?? "—"}</span>
                        {p.edd && <span className="text-[8px] text-muted-foreground/25">{new Date(p.edd).toLocaleDateString("en-GB", { day:"2-digit",month:"short" })}</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* ─ Right: Project Detail ─ */}
            {!selectedWsProject ? (
              <div className="flex items-center justify-center rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="text-center">
                  <svg className="w-10 h-10 mx-auto mb-3 opacity-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                  </svg>
                  <p className="text-[10px] text-muted-foreground/25">Select a project to manage it</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden flex flex-col" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Project header */}
                <div className="px-5 py-4 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground/30 mb-0.5">{selectedWsProject.orderRef}</p>
                      <h3 className="text-sm font-bold text-foreground">{selectedWsProject.title}</h3>
                      <p className="text-[10px] text-muted-foreground/40 mt-0.5">{selectedWsProject.clientName} · {selectedWsProject.clientEmail}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/workspace`)}
                      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all shrink-0"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
                      title="Copy client workspace URL"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                      Client Link
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <select
                      value={selectedWsProject.milestone ?? "discovery"}
                      onChange={e => wsUpdateProject(selectedWsProject.id, { milestone: e.target.value })}
                      className="text-[9px] font-bold uppercase rounded-lg px-2 py-1 focus:outline-none"
                      style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "hsl(var(--primary))" }}
                    >
                      {["discovery","design","development","qa","delivered"].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                      value={selectedWsProject.status}
                      onChange={e => wsUpdateProject(selectedWsProject.id, { status: e.target.value })}
                      className="text-[9px] font-bold uppercase rounded-lg px-2 py-1 focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                    >
                      {["scoping","in_progress","review","delivered","transferred"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                      type="date"
                      value={selectedWsProject.edd ? new Date(selectedWsProject.edd).toISOString().split("T")[0] : ""}
                      onChange={e => wsUpdateProject(selectedWsProject.id, { edd: e.target.value || null })}
                      className="text-[9px] rounded-lg px-2 py-1 focus:outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                      title="Estimated Delivery Date"
                    />
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.01)" }}>
                  {[
                    { id: "messages" as const, label: "Messages", count: wsMessages.length },
                    { id: "changes" as const, label: "Change Orders", count: wsChangeOrders.filter(c => c.status === "pending_review").length },
                    { id: "settings" as const, label: "Settings", count: 0 },
                  ].map(st => (
                    <button key={st.id} onClick={() => setWsPanel(st.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all relative"
                      style={{ color: wsPanel === st.id ? "hsl(var(--primary))" : "rgba(255,255,255,0.3)" }}
                    >
                      {st.label}
                      {st.count > 0 && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: wsPanel === st.id ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.08)" }}>{st.count}</span>
                      )}
                      {wsPanel === st.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: "hsl(var(--primary))" }} />}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button onClick={() => wsRefreshProjectData(selectedWsProject.id)} className="px-3 py-2.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors" title="Refresh">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                </div>

                {/* Messages */}
                {wsPanel === "messages" && (
                  <div className="flex flex-col flex-1" style={{ minHeight: "400px" }}>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ maxHeight: "380px" }}>
                      {wsMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-[10px] text-muted-foreground/25">No messages yet.</p>
                        </div>
                      ) : wsMessages.map(msg => {
                        const isAdmin = msg.sender === "admin";
                        return (
                          <div key={msg.id} className={`flex gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold"
                              style={{ background: isAdmin ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${isAdmin ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                              {isAdmin ? "A" : "C"}
                            </div>
                            <div className={`flex flex-col gap-0.5 max-w-[75%] ${isAdmin ? "items-end" : "items-start"}`}>
                              <p className="text-[8px] text-muted-foreground/25">
                                {isAdmin ? "You (Admin)" : selectedWsProject.clientName ?? "Client"} · {new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
                              </p>
                              <div className="rounded-xl px-3 py-2 text-xs leading-relaxed"
                                style={{ background: isAdmin ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${isAdmin ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.07)"}`, color: "rgba(220,222,240,0.9)" }}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={wsMessagesEndRef} />
                    </div>
                    <form onSubmit={wsSendAdminMessage} className="flex gap-2 p-3 border-t border-white/[0.06]" style={{ background: "rgba(255,255,255,0.01)" }}>
                      <input value={wsAdminMsg} onChange={e => setWsAdminMsg(e.target.value)}
                        placeholder="Send a message to the client…"
                        className="flex-1 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                      <button type="submit" disabled={wsSendingMsg || !wsAdminMsg.trim()}
                        className="px-3 py-2 rounded-lg transition-all"
                        style={{ background: "hsl(268 72% 55%)", opacity: wsSendingMsg || !wsAdminMsg.trim() ? 0.5 : 1 }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                      </button>
                    </form>
                  </div>
                )}

                {/* Change Orders */}
                {wsPanel === "changes" && (
                  <div className="flex flex-col gap-3 p-4 overflow-y-auto" style={{ maxHeight: "480px" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-muted-foreground/30">Change requests for this project</p>
                      <button onClick={() => setWsSurchargeForm(prev => ({ ...prev, open: true }))}
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "hsl(var(--primary))" }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Add Surcharge
                      </button>
                    </div>

                    {wsSurchargeForm.open && (
                      <form onSubmit={wsAddSurcharge} className="rounded-xl p-4" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-3">Manual Surcharge</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-1">Amount (SAR)</label>
                            <input type="number" min="0" step="50" required value={wsSurchargeForm.amount}
                              onChange={e => setWsSurchargeForm(prev => ({ ...prev, amount: e.target.value }))}
                              placeholder="500"
                              className="w-full text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-1">Category</label>
                            <select value={wsSurchargeForm.reasonCategory} onChange={e => setWsSurchargeForm(prev => ({ ...prev, reasonCategory: e.target.value }))}
                              className="w-full text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                              <option value="modification">Modification</option>
                              <option value="new_feature">New Feature</option>
                              <option value="design_change">Design Change</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-1">Details for Client</label>
                          <textarea required rows={3} value={wsSurchargeForm.details}
                            onChange={e => setWsSurchargeForm(prev => ({ ...prev, details: e.target.value }))}
                            placeholder="Describe what the client requested and what this charge covers…"
                            className="w-full text-xs rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none resize-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={wsSubmittingSurcharge}
                            className="px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all"
                            style={{ background: "hsl(268 72% 55%)", color: "#fff", opacity: wsSubmittingSurcharge ? 0.5 : 1 }}>
                            {wsSubmittingSurcharge ? "Adding…" : "Send to Client"}
                          </button>
                          <button type="button" onClick={() => setWsSurchargeForm(prev => ({ ...prev, open: false }))}
                            className="px-3 py-1.5 text-[9px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {wsChangeOrders.length === 0 && !wsSurchargeForm.open ? (
                      <div className="py-8 text-center"><p className="text-[10px] text-muted-foreground/25">No change orders yet.</p></div>
                    ) : wsChangeOrders.map(co => (
                      <div key={co.id} className="rounded-xl p-4"
                        style={{ background: co.status === "pending_review" ? "rgba(251,191,36,0.03)" : "rgba(255,255,255,0.02)", border: `1px solid ${co.status === "pending_review" ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                              style={{ color: co.status === "pending_review" ? "rgba(251,191,36,0.9)" : co.status === "approved" ? "rgba(16,185,129,0.9)" : co.status === "quoted" ? "rgba(201,168,76,0.9)" : "rgba(239,68,68,0.9)", background: co.status === "pending_review" ? "rgba(251,191,36,0.1)" : co.status === "approved" ? "rgba(16,185,129,0.1)" : co.status === "quoted" ? "rgba(201,168,76,0.1)" : "rgba(239,68,68,0.1)" }}>
                              {co.status.replace("_", " ")}
                            </span>
                            <span className="text-[8px] text-muted-foreground/30 uppercase">{co.reasonCategory.replace("_", " ")}</span>
                          </div>
                          {co.quotedAmount && parseFloat(co.quotedAmount) > 0 && (
                            <span className="text-xs font-black shrink-0" style={{ color: "hsl(var(--primary))" }}>+{parseFloat(co.quotedAmount).toLocaleString("en-SA")} SAR</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/60 leading-relaxed mb-2">{co.details}</p>
                        {co.adminNote && <p className="text-[10px] text-muted-foreground/40 italic mb-2">Note: {co.adminNote}</p>}

                        {co.status === "pending_review" && (
                          <button onClick={() => setWsQuoteForm({ open: true, coId: co.id, adminNote: "", quotedAmount: "" })}
                            className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all"
                            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "hsl(var(--primary))" }}>
                            Respond with Quote
                          </button>
                        )}

                        {wsQuoteForm.open && wsQuoteForm.coId === co.id && (
                          <form onSubmit={wsSubmitQuote} className="mt-3 p-3 rounded-lg flex flex-col gap-2"
                            style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-1">Quoted Amount (SAR)</label>
                              <input type="number" min="0" step="50" value={wsQuoteForm.quotedAmount}
                                onChange={e => setWsQuoteForm(prev => ({ ...prev, quotedAmount: e.target.value }))}
                                placeholder="0"
                                className="w-full text-xs rounded px-2 py-1 text-foreground focus:outline-none"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-1">Note to Client</label>
                              <textarea rows={2} value={wsQuoteForm.adminNote}
                                onChange={e => setWsQuoteForm(prev => ({ ...prev, adminNote: e.target.value }))}
                                placeholder="Explain the quote…"
                                className="w-full text-xs rounded px-2 py-1 text-foreground focus:outline-none resize-none"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" disabled={wsSubmittingQuote}
                                className="px-3 py-1 text-[9px] font-bold rounded-lg transition-all"
                                style={{ background: "hsl(268 72% 55%)", color: "#fff", opacity: wsSubmittingQuote ? 0.5 : 1 }}>
                                {wsSubmittingQuote ? "Sending…" : "Send Quote"}
                              </button>
                              <button type="button" onClick={() => setWsQuoteForm({ open: false, coId: null, adminNote: "", quotedAmount: "" })}
                                className="px-3 py-1 text-[9px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Settings */}
                {wsPanel === "settings" && (
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: "480px" }}>
                    <p className="text-[10px] text-muted-foreground/30 uppercase tracking-widest font-bold">Project Settings</p>
                    {[
                      { label: "Project Title", key: "title", type: "text", val: selectedWsProject.title },
                      { label: "Description", key: "description", type: "text", val: selectedWsProject.description ?? "" },
                      { label: "Store URL (Live)", key: "storeUrl", type: "url", val: selectedWsProject.storeUrl ?? "" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 block mb-1">{f.label}</label>
                        <input type={f.type} defaultValue={f.val}
                          onBlur={e => wsUpdateProject(selectedWsProject.id, { [f.key]: e.target.value })}
                          className="w-full text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
                      </div>
                    ))}
                    <div className="pt-2 border-t border-white/[0.05]">
                      <p className="text-[9px] font-mono text-muted-foreground/20">Ref: {selectedWsProject.orderRef}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
