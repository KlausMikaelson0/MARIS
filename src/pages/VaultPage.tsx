import { useState } from "react";
import { useListProjects, useListContracts, useListTickets, useCreateTicket } from "@workspace/api-client-react";

const VAULT_PIN = "MARIS";

function ProjectsTab() {
  const { data: projects, isLoading } = useListProjects();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="h-20 bg-card border border-white/8 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="border border-white/8 bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No projects found in your vault.</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    scoping: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    review: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    delivered: "text-green-400 bg-green-400/10 border-green-400/20",
    transferred: "text-electric bg-electric/10 border-electric/20",
  };

  return (
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.id} className="border border-white/8 bg-card p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-sm tracking-wide truncate">{p.title}</h3>
              {p.category && (
                <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider shrink-0">{p.category}</span>
              )}
            </div>
            {p.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{p.description}</p>
            )}
            <p className="text-[10px] text-muted-foreground/40 font-mono">
              Created {new Date(p.createdAt).toLocaleDateString()}
              {p.deliveredAt && ` — Delivered ${new Date(p.deliveredAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border ${statusColors[p.status] || "text-muted-foreground bg-muted border-white/10"}`}>
              {p.status.replace("_", " ")}
            </span>
            {p.storeUrl && (
              <a
                href={p.storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-electric font-mono hover:underline"
              >
                Open Store →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContractsTab() {
  const { data: contracts, isLoading } = useListContracts();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1,2].map((i) => <div key={i} className="h-16 bg-card border border-white/8 animate-pulse" />)}
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="border border-white/8 bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">No contracts in your vault.</p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    service_agreement: "Service Agreement",
    nda: "NDA",
    revision_scope: "Revision Scope",
  };

  const statusColors: Record<string, string> = {
    signed: "text-green-400 border-green-400/30",
    pending: "text-yellow-400 border-yellow-400/30",
    expired: "text-red-400 border-red-400/30",
  };

  return (
    <div className="space-y-3">
      {contracts.map((c) => (
        <div key={c.id} className="border border-white/8 bg-card p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border border-white/15 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-0.5">{typeLabels[c.type] || c.type}</h3>
              <p className="text-[10px] text-muted-foreground font-mono">
                Signed by {c.signedByName} · {c.signedAt ? new Date(c.signedAt).toLocaleDateString() : "Pending"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border ${statusColors[c.status] || ""}`}>
              {c.status}
            </span>
            {c.documentUrl && (
              <a
                href={c.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-electric font-mono hover:underline"
              >
                Download PDF
              </a>
            )}
          </div>
        </div>
      ))}

      <div className="border border-yellow-500/15 bg-yellow-500/5 p-4 mt-4">
        <p className="text-yellow-500/70 text-xs font-mono">
          Signed contracts are legally binding. The As-Is Finality Clause in your Service Agreement means the store is delivered as-is upon transfer.
        </p>
      </div>
    </div>
  );
}

function TicketsTab() {
  const { data: tickets, isLoading, refetch } = useListTickets();
  const createTicket = useCreateTicket();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "revision" as const, title: "", description: "", creditsCost: 1 });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    try {
      await createTicket.mutateAsync({
        data: {
          clientId: 1,
          type: form.type,
          title: form.title,
          description: form.description,
          creditsCost: form.creditsCost,
        },
      });
      setShowForm(false);
      setForm({ type: "revision", title: "", description: "", creditsCost: 1 });
      setSubmitted(true);
      refetch();
    } catch {
    }
  }

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 border-yellow-400/30",
    in_progress: "text-blue-400 border-blue-400/30",
    resolved: "text-green-400 border-green-400/30",
    cancelled: "text-muted-foreground border-white/15",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-muted-foreground">
          Manage your support and revision requests. All work requires a verified ticket.
        </p>
        <button
          onClick={() => { setShowForm(true); setSubmitted(false); }}
          className="px-4 py-2 bg-electric text-[hsl(228_12%_6%)] text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          + New Ticket
        </button>
      </div>

      {submitted && (
        <div className="border border-green-400/20 bg-green-400/5 p-4 mb-5">
          <p className="text-green-400 text-xs font-mono">Ticket submitted successfully. Our team will review within 24 hours.</p>
        </div>
      )}

      {showForm && (
        <div className="border border-electric/20 bg-card p-6 mb-5">
          <h4 className="text-sm font-bold tracking-wide mb-4">New Ticket</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Ticket Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "revision" | "support" | "update" }))}
                className="w-full bg-background border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-electric"
              >
                <option value="revision">Revision (1 credit)</option>
                <option value="support">Support (1 credit)</option>
                <option value="update">Update (2 credits)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Brief description of the request"
                className="w-full bg-background border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-electric"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe what needs to be done in detail..."
                rows={4}
                className="w-full bg-background border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-electric resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-white/15 text-sm font-medium tracking-wider uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.title || !form.description || createTicket.isPending}
                className="flex-1 py-3 bg-electric text-[hsl(228_12%_6%)] font-bold text-sm tracking-wider uppercase disabled:opacity-30"
              >
                {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-card border border-white/8 animate-pulse" />)}
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div className="border border-white/8 bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm mb-2">No tickets yet.</p>
          <p className="text-xs text-muted-foreground/50">Submit a ticket to request changes or support.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="border border-white/8 bg-card p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border ${
                    t.type === "revision" ? "text-electric border-electric/30" :
                    t.type === "support" ? "text-blue-400 border-blue-400/30" :
                    "text-amber-400 border-amber-400/30"
                  }`}>
                    {t.type}
                  </span>
                  <h3 className="font-semibold text-sm truncate">{t.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{t.description}</p>
                <p className="text-[10px] text-muted-foreground/40 font-mono">
                  {t.creditsCost} credit{t.creditsCost > 1 ? "s" : ""} · {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 border shrink-0 ${statusColors[t.status] || ""}`}>
                {t.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VaultPage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "contracts" | "support">("projects");

  function handleUnlock() {
    if (pin.toUpperCase() === VAULT_PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 border border-electric/30 bg-electric/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-electric" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-electric">Client Vault</span>
            <h1 className="text-2xl font-black tracking-tight mt-2">Secure Access</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter your vault access code to continue.</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="Access Code"
              className={`w-full bg-card border px-4 py-3 text-sm text-center font-mono tracking-widest uppercase focus:outline-none transition-colors ${
                pinError ? "border-destructive" : "border-white/10 focus:border-electric"
              }`}
            />
            {pinError && <p className="text-destructive text-xs text-center font-mono">Invalid access code.</p>}
            <button
              onClick={handleUnlock}
              className="w-full py-4 bg-electric text-[hsl(228_12%_6%)] font-bold text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Access Vault
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/30 text-center mt-6 font-mono">
            Demo: use code "MARIS"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-electric">Client Vault</span>
            <h1 className="text-2xl font-black tracking-tight mt-1">Your Dashboard</h1>
          </div>
          <button
            onClick={() => setUnlocked(false)}
            className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-wider hover:text-muted-foreground transition-colors"
          >
            Lock Vault
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 mb-8">
          {[
            { key: "projects", label: "Projects" },
            { key: "contracts", label: "Contracts" },
            { key: "support", label: "Support & Revisions" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-5 py-3 text-xs font-medium tracking-wider uppercase transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-electric text-electric"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "contracts" && <ContractsTab />}
        {activeTab === "support" && <TicketsTab />}
      </div>
    </div>
  );
}
