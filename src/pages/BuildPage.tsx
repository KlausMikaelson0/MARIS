import { useState } from "react";
import { useCreateLead } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";

const TOS_TEXT = `SERVICE AGREEMENT — MARIS STUDIO

Last Updated: April 2025

1. SCOPE OF SERVICES
MARIS Studio ("Studio") agrees to design and develop a custom e-commerce platform ("the Store") as specified in the project brief submitted through the Custom Build Portal. The scope is limited strictly to the deliverables agreed upon during the discovery phase.

2. CONTRACT-FIRST POLICY
No work shall commence until this Service Agreement has been electronically signed by the client. By signing, the client acknowledges they have read, understood, and agreed to all terms herein.

3. AS-IS FINALITY CLAUSE
THE STORE IS DELIVERED "AS-IS" UPON SUCCESSFUL TRANSFER OF OWNERSHIP. THE STUDIO'S LIABILITY AND ALL OBLIGATIONS END AT THE POINT OF FINAL DELIVERY AND TRANSFER. The client accepts the Store in its completed state. Any defects, omissions, or desired changes reported after transfer are not covered under the original agreement.

4. REVISION PROTOCOL
No additional development work, modifications, updates, or improvements shall be performed outside the initial agreed scope unless a Revision Ticket has been purchased and verified in the Client Vault. Verbal or written requests for changes outside this protocol will not be accepted or actioned.

5. PAYMENT TERMS
Full payment or 50% upfront + 50% on delivery, as selected by the client. Final project pricing is confirmed after brief review. Payment must be made per the schedule defined in the project proposal.

6. INTELLECTUAL PROPERTY
Upon receipt of full payment, all intellectual property rights for the delivered Store are transferred to the client. MARIS Studio retains the right to display the work in its portfolio.

7. CONFIDENTIALITY
Both parties agree to maintain confidentiality regarding project details, pricing, and business information shared during the engagement.

8. LIMITATION OF LIABILITY
To the maximum extent permitted by law, MARIS Studio's total liability shall not exceed the total fees paid for the specific project. The Studio is not liable for any indirect, consequential, or incidental damages.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the Kingdom of Saudi Arabia.

10. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties and supersedes all prior discussions, representations, or agreements. Any modifications must be made in writing and signed by both parties.

By electronically signing below, you confirm that you have read, understood, and agree to be bound by all terms of this Service Agreement.`;

const BUDGET_OPTIONS = [
  "5,000 - 10,000 SAR",
  "10,000 - 20,000 SAR",
  "20,000 - 40,000 SAR",
  "40,000 - 80,000 SAR",
  "80,000+ SAR",
  "To be discussed",
];

const inputCls = "w-full rounded-xl border border-white/[0.09] px-4 py-3 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2";

export default function BuildPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    brandName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    projectBrief: "",
    budgetRange: "",
    signatureName: "",
    tosAccepted: false,
    asIsAccepted: false,
    paymentMethod: "split" as "full" | "split",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLang();
  const isAr = lang === "ar";

  const createLead = useCreateLead();

  const canProceedStep1 = form.brandName && form.contactName && form.contactEmail;
  const canProceedStep2 = form.projectBrief;
  const canProceedStep3 = form.tosAccepted && form.asIsAccepted && form.signatureName.trim().length > 2;

  function updateForm(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!canProceedStep3) return;
    setError(null);
    try {
      await createLead.mutateAsync({
        data: {
          brandName: form.brandName,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || null,
          projectBrief: form.projectBrief,
          budgetRange: form.budgetRange || null,
          tosAccepted: true,
        },
      });
      setSubmitted(true);
    } catch {
      setError(isAr ? "حدث خطأ. حاول مجدداً." : "Submission failed. Please try again.");
    }
  }

  /* ── Confirmation screen ─────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-5">
        <div className="max-w-md w-full">
          <div
            className="rounded-2xl border border-white/[0.07] p-8 text-center"
            style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(16px)" }}
          >
            {/* Success icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "hsl(var(--primary) / 0.12)", border: "1px solid hsl(var(--primary) / 0.30)" }}
            >
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2
              className="font-bold text-foreground mb-2"
              style={{ fontSize: "1.5rem", letterSpacing: "-0.03em" }}
            >
              {isAr ? "تم استلام مشروعك" : "Brief Received"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {isAr
                ? `سيراجع فريقنا طلبك ويردّ عليك خلال 24 ساعة على ${form.contactEmail}.`
                : `Our team will review your brief and respond within 24 hours to ${form.contactEmail}.`
              }
            </p>

            {/* Payment reminder */}
            <div
              className="rounded-xl p-4 text-left mb-6 border border-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "hsl(var(--primary) / 0.7)" }}>
                {isAr ? "خيار الدفع المحدد" : "Selected Payment"}
              </p>
              <p className="text-sm text-foreground font-medium">
                {form.paymentMethod === "full"
                  ? (isAr ? "الدفع الكامل مقدماً" : "Full payment upfront")
                  : (isAr ? "50% الآن · 50% عند التسليم" : "50% now · 50% on delivery")
                }
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1">
                {isAr ? "سيتم تأكيد تفاصيل الدفع مع العرض." : "Payment details will be confirmed with your proposal."}
              </p>
            </div>

            {/* As-Is reminder */}
            <div
              className="rounded-xl p-3 mb-6 border border-yellow-500/15"
              style={{ background: "hsl(45 90% 50% / 0.05)" }}
            >
              <p className="text-xs text-yellow-500/60 leading-relaxed">
                <span className="font-bold text-yellow-500/80">{isAr ? "تذكير: " : "Reminder: "}</span>
                {isAr
                  ? "لقد وقّعت على عقد الخدمة. التسليم يكون كما هو. أي تعديل بعد التسليم يتطلب تذكرة تعديل."
                  : "You've signed the Service Agreement. The project is delivered as-is. Post-delivery changes require a Revision Ticket."
                }
              </p>
            </div>

            <a
              href="/"
              className="btn-outline w-full justify-center"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {isAr ? "العودة إلى الاستوديو" : "Return to Studio"}
            </a>

            <p className="mt-4 text-xs text-muted-foreground/30">
              {isAr ? "تواصل: " : "Contact: "}
              <a href="mailto:studiomaris@outlook.com" className="hover:text-primary transition-colors">
                studiomaris@outlook.com
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────── */
  const STEPS = isAr
    ? ["تفاصيل العلامة", "تفاصيل المشروع", "التوقيع"]
    : ["Brand Details", "Project Brief", "Sign Agreement"];

  return (
    <div className="min-h-screen pt-16 pb-16">
      <div className="max-w-2xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="mb-10">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase"
            style={{ color: "hsl(var(--primary) / 0.7)" }}>
            {isAr ? "بوابة المشاريع" : "Custom Build Portal"}
          </span>
          <h1
            className="font-bold text-foreground mt-2"
            style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", letterSpacing: "-0.03em" }}
          >
            {isAr ? "ابدأ مشروعك" : "Start Your Project"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {isAr ? "قدّم موجزك بدون أي تكلفة. نراجع كل طلب شخصياً." : "Submit your brief at no cost. We review every submission personally."}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {[1,2,3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all"
                style={
                  step > s
                    ? { background: "hsl(var(--primary))", color: "#fff" }
                    : step === s
                    ? { border: "1px solid hsl(var(--primary))", color: "hsl(var(--primary))", background: "hsl(var(--primary) / 0.08)" }
                    : { border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" }
                }
              >
                {step > s ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : s}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-mono hidden sm:block ${step === s ? "text-primary" : "text-muted-foreground/30"}`}>
                {STEPS[s - 1]}
              </span>
              {s < 3 && (
                <div className="flex-1 h-px transition-colors" style={{ background: step > s ? "hsl(var(--primary) / 0.4)" : "rgba(255,255,255,0.06)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Brand Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>{isAr ? "اسم العلامة التجارية *" : "Brand Name *"}</label>
              <input type="text" value={form.brandName} onChange={e => updateForm("brandName", e.target.value)}
                placeholder={isAr ? "مثال: لوكس كلوزيت" : "e.g. Luxe Closet"} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "اسم المسؤول *" : "Contact Name *"}</label>
              <input type="text" value={form.contactName} onChange={e => updateForm("contactName", e.target.value)}
                placeholder={isAr ? "اسمك الكامل" : "Your full name"} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "البريد الإلكتروني *" : "Email Address *"}</label>
              <input type="email" value={form.contactEmail} onChange={e => updateForm("contactEmail", e.target.value)}
                placeholder="you@brand.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "رقم الهاتف (اختياري)" : "Phone (Optional)"}</label>
              <input type="tel" value={form.contactPhone} onChange={e => updateForm("contactPhone", e.target.value)}
                placeholder="+966 5X XXX XXXX" className={inputCls} />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="btn-primary w-full justify-center mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ padding: "0.85rem" }}
            >
              {isAr ? "متابعة" : "Continue to Project Brief"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}

        {/* Step 2 — Project Brief */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>{isAr ? "موجز المشروع *" : "Project Brief *"}</label>
              <p className="text-xs text-muted-foreground/50 mb-3">
                {isAr ? "صف علامتك، جمهورك المستهدف، وما تحتاج بناءه. أضف أي مراجع أو مصادر إلهام." : "Describe your brand, target audience, and what you need built. Include references or inspirations."}
              </p>
              <textarea
                value={form.projectBrief}
                onChange={e => updateForm("projectBrief", e.target.value)}
                placeholder={isAr ? "أخبرنا عن علامتك، المتجر الذي تتصوره، وأي متطلبات محددة..." : "Tell us about your brand, the store you envision, and any specific requirements..."}
                rows={8} className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>{isAr ? "نطاق الميزانية" : "Budget Range"}</label>
              <select value={form.budgetRange} onChange={e => updateForm("budgetRange", e.target.value)} className={inputCls}>
                <option value="">{isAr ? "اختر نطاقاً" : "Select a range"}</option>
                {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="btn-outline flex-1" style={{ padding: "0.85rem" }}>
                {isAr ? "رجوع" : "Back"}
              </button>
              <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                className="btn-primary flex-1 justify-center disabled:opacity-30 disabled:cursor-not-allowed" style={{ padding: "0.85rem" }}>
                {isAr ? "مراجعة الاتفاقية" : "Review Agreement"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Agreement + Payment */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Contract */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "hsl(var(--primary) / 0.8)" }}>
                {isAr ? "اتفاقية الخدمة" : "Service Agreement"}
              </h3>
              <p className="text-xs text-muted-foreground/50 mb-3">
                {isAr ? "يجب قراءة وتوقيع هذه الاتفاقية قبل الإرسال. وثيقة قانونية ملزمة." : "You must read and sign this agreement before submitting. This is a legally binding document."}
              </p>
              <div
                className="rounded-xl border border-white/[0.07] p-4 h-56 overflow-y-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground/50"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                {TOS_TEXT}
              </div>
            </div>

            {/* As-Is callout */}
            <div className="rounded-xl p-4 border border-yellow-500/15" style={{ background: "hsl(45 90% 50% / 0.05)" }}>
              <p className="text-yellow-500/70 text-xs leading-relaxed font-mono">
                <span className="text-yellow-400/90 font-bold uppercase tracking-widest">
                  {isAr ? "بند التسليم النهائي كما هو: " : "As-Is Finality Clause: "}
                </span>
                {isAr
                  ? "يُسلَّم المشروع كما هو عند التحويل النهائي. تنتهي مسؤولية MARIS عند التسليم. التعديلات اللاحقة تتطلب تذكرة تعديل."
                  : "The project is delivered as-is upon final transfer. MARIS liability ends at delivery. Post-delivery modifications require a Revision Ticket."
                }
              </p>
            </div>

            {/* Payment method */}
            <div>
              <label className={labelCls}>{isAr ? "طريقة الدفع *" : "Payment Method *"}</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    val: "split" as const,
                    title: isAr ? "50% الآن · 50% عند التسليم" : "50% Now · 50% on Delivery",
                    desc: isAr ? "دفعة أولى لبدء العمل، والباقي عند الاستلام" : "Deposit to start, balance on handover",
                    recommended: true,
                  },
                  {
                    val: "full" as const,
                    title: isAr ? "الدفع الكامل مقدماً" : "Full Payment Upfront",
                    desc: isAr ? "دفع المبلغ كاملاً قبل بدء العمل" : "Pay the full amount before we start",
                    recommended: false,
                  },
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => updateForm("paymentMethod", opt.val)}
                    className="relative rounded-xl border p-4 text-left transition-all duration-150"
                    style={{
                      background: form.paymentMethod === opt.val ? "hsl(var(--primary) / 0.08)" : "rgba(255,255,255,0.02)",
                      borderColor: form.paymentMethod === opt.val ? "hsl(var(--primary) / 0.45)" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {opt.recommended && (
                      <span
                        className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary) / 0.8)" }}
                      >
                        {isAr ? "الأكثر شيوعاً" : "Most Common"}
                      </span>
                    )}
                    <div
                      className="w-4 h-4 rounded-full border flex items-center justify-center mb-3 transition-all"
                      style={{
                        borderColor: form.paymentMethod === opt.val ? "hsl(var(--primary))" : "rgba(255,255,255,0.15)",
                        background: form.paymentMethod === opt.val ? "hsl(var(--primary))" : "transparent",
                      }}
                    >
                      {form.paymentMethod === opt.val && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1" style={{ letterSpacing: "-0.015em" }}>{opt.title}</p>
                    <p className="text-[11px] text-muted-foreground/50">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Signature */}
            <div>
              <label className={labelCls}>{isAr ? "التوقيع الإلكتروني *" : "Electronic Signature *"}</label>
              <input
                type="text"
                value={form.signatureName}
                onChange={e => updateForm("signatureName", e.target.value)}
                placeholder={isAr ? "اكتب اسمك القانوني الكامل" : "Type your full legal name"}
                className={`${inputCls} italic font-mono`}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              {[
                {
                  key: "tosAccepted" as const,
                  label: isAr
                    ? "لقد قرأت اتفاقية الخدمة وأوافق على جميع بنودها وشروطها."
                    : "I have read and understood the Service Agreement in full and agree to be bound by all its terms.",
                },
                {
                  key: "asIsAccepted" as const,
                  label: isAr
                    ? "أقرّ بأن المشروع يُسلَّم كما هو عند التحويل النهائي. مسؤولية MARIS تنتهي عند التسليم. التعديلات اللاحقة تتطلب تذكرة تعديل."
                    : "I acknowledge the project is delivered as-is upon final transfer. MARIS liability ends at delivery. Post-delivery changes require a Revision Ticket.",
                },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all border"
                    style={{
                      background: form[key] ? "hsl(var(--primary))" : "transparent",
                      borderColor: form[key] ? "hsl(var(--primary))" : "rgba(255,255,255,0.12)",
                    }}
                    onClick={() => updateForm(key, !form[key])}
                  >
                    {form[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground/60 leading-relaxed group-hover:text-muted-foreground transition-colors">{label}</span>
                </label>
              ))}
            </div>

            {error && <p className="text-destructive text-xs font-mono">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline flex-1" style={{ padding: "0.85rem" }}>
                {isAr ? "رجوع" : "Back"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canProceedStep3 || createLead.isPending}
                className="btn-primary flex-1 justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ padding: "0.85rem" }}
              >
                {createLead.isPending
                  ? (isAr ? "جارٍ الإرسال..." : "Submitting...")
                  : (isAr ? "توقيع وإرسال الموجز" : "Sign & Submit Brief")
                }
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground/25 text-center font-mono">
              {isAr ? "الإرسال مجاني. التسعير يُؤكَّد بعد المراجعة." : "Submission is free. Pricing confirmed after review."}
              {" · "}
              <a href="mailto:studiomaris@outlook.com" className="hover:text-muted-foreground/50 transition-colors">
                studiomaris@outlook.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
