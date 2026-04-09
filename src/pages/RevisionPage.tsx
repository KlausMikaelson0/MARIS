import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";

export default function RevisionPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const TICKET_TYPES = [
    {
      type: isAr ? "تعديل" : "Revision",
      code: "REV",
      credits: 1,
      turnaround: isAr ? "72 ساعة" : "72 hours",
      accent: "hsl(var(--primary))",
      accentFill: "hsl(var(--primary) / 0.08)",
      accentBorder: "hsl(var(--primary) / 0.25)",
      includes: isAr ? [
        "طلب تغيير واحد محدد",
        "ما يصل إلى ساعتين من التطوير",
        "تحديثات المحتوى (نصوص، صور، أسعار)",
        "تعديلات طفيفة في التخطيط",
        "إصلاح خطأ إذا كان النطاق واضحاً",
      ] : [
        "1 focused change request",
        "Up to 2 hours of development",
        "Content updates (text, images, prices)",
        "Minor layout adjustments",
        "Bug fix if scope is clear",
      ],
    },
    {
      type: isAr ? "دعم" : "Support",
      code: "SUP",
      credits: 1,
      turnaround: isAr ? "48 ساعة" : "48 hours",
      accent: "#60a5fa",
      accentFill: "rgba(96,165,250,0.08)",
      accentBorder: "rgba(96,165,250,0.25)",
      includes: isAr ? [
        "استكشاف الأخطاء التقنية",
        "مشاكل بوابة الدفع",
        "دعم تكامل التطبيقات",
        "تشخيص الأداء",
        "ساعة واحدة من التحقيق",
      ] : [
        "Technical troubleshooting",
        "Payment gateway issues",
        "App integration support",
        "Performance diagnostics",
        "1 hour of investigation",
      ],
    },
    {
      type: isAr ? "تحديث" : "Update",
      code: "UPD",
      credits: 2,
      turnaround: isAr ? "5 أيام عمل" : "5 business days",
      accent: "#c084fc",
      accentFill: "rgba(192,132,252,0.08)",
      accentBorder: "rgba(192,132,252,0.25)",
      includes: isAr ? [
        "إضافات ميزات جديدة",
        "تصنيفات منتجات جديدة",
        "إنشاء قالب صفحة",
        "إعداد تكامل التطبيقات",
        "ما يصل إلى 5 ساعات من التطوير",
      ] : [
        "Feature additions",
        "New product categories",
        "Page template creation",
        "App integration setup",
        "Up to 5 hours of development",
      ],
    },
  ];

  const STEPS = isAr ? [
    { n: "01", title: "اشترِ رصيداً", desc: "اشترِ رصيد التعديلات من خزنة العميل. يتم التحقق من الرصيد فوراً." },
    { n: "02", title: "أرسل تذكرة", desc: "افتح تذكرة جديدة من بوابة الصيانة في خزنتك. صف التعديل بوضوح." },
    { n: "03", title: "التحقق", desc: "يتحقق MARIS من التذكرة مقابل رصيدك ونطاق العمل. يبدأ العمل فقط بعد التأكيد." },
    { n: "04", title: "التسليم", desc: "تُسلَّم التغييرات خلال المدة المحددة. لا يُنفَّذ أي عمل دون تذكرة موثّقة." },
  ] : [
    { n: "01", title: "Purchase Credits", desc: "Buy Revision Credits through your Client Vault. Credits are verified instantly." },
    { n: "02", title: "Submit Ticket", desc: "Open a new ticket from the Maintenance Gateway in your vault. Describe the change clearly." },
    { n: "03", title: "Verification", desc: "MARIS verifies the ticket against your available credits and scope. Work begins only after confirmation." },
    { n: "04", title: "Delivery", desc: "Changes are delivered within the turnaround window. No work proceeds without a verified ticket." },
  ];

  const FAQS = isAr ? [
    { q: "ما الذي يُعدّ 'خارج النطاق'؟", a: "أي شيء غير مذكور صراحةً في الموجز الأصلي ووثيقة النطاق المُؤكَّدة. إضافة صفحات جديدة، تغيير تخطيطات أساسية، تكامل تطبيقات جديدة، أو تعديل مسارات الدفع — كلها تعديلات خارج النطاق." },
    { q: "هل يمكنني دمج تعديلات متعددة في تذكرة واحدة؟", a: "إذا كانت التغييرات بسيطة وتقع ضمن ميزانية ساعات نوع التذكرة، نعم. للطلبات المركّبة الأكبر، قد تكون هناك حاجة لتذاكر متعددة." },
    { q: "ماذا لو اكتشفت خطأً بعد التسليم؟", a: "تُقيَّم الأخطاء التي تقع بوضوح ضمن نطاق التسليم الأصلي كل حالة على حدة خلال 7 أيام من التسليم. بعد ذلك، تستلزم جميع الإصلاحات تذكرة دعم." },
    { q: "هل تنتهي صلاحية الرصيد؟", a: "الرصيد صالح لمدة 12 شهراً من تاريخ الشراء." },
  ] : [
    { q: "What counts as 'out of scope'?", a: "Anything not explicitly detailed in the original project brief and confirmed scope document. Adding new pages, changing core layouts, integrating new apps, or modifying checkout flows are all out-of-scope changes." },
    { q: "Can I bundle multiple changes into one ticket?", a: "If the changes are minor and fall under a single ticket type's hour budget, yes. For larger compound requests, multiple tickets may be required." },
    { q: "What if I find a bug after delivery?", a: "Bugs clearly within the original scope are assessed case-by-case within 7 days of delivery. After that, all fixes require a Support ticket." },
    { q: "Do credits expire?", a: "Credits are valid for 12 months from the date of purchase." },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-5">

        {/* Header */}
        <div className="max-w-3xl mb-14">
          <span
            className="text-[10px] font-mono tracking-[0.3em] uppercase"
            style={{ color: "hsl(var(--primary) / 0.7)" }}
          >
            {isAr ? "بروتوكول التعديلات" : "Revision Protocol"}
          </span>
          <h1
            className="font-bold tracking-tight mt-2 mb-4 text-foreground"
            style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "-0.04em" }}
          >
            {isAr ? "تذاكر التعديل المدفوعة مسبقاً" : "Pre-paid Revision Tickets"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isAr
              ? "كل طلب تغيير بعد نطاق التسليم الأصلي يستلزم تذكرة تعديل موثّقة. بدون استثناء. هذا يحمي الطرفين ويضمن جودة العمل."
              : "Every change request beyond the initial delivery scope requires a verified Revision Ticket. No exceptions. This protects both parties and ensures quality work."
            }
          </p>
        </div>

        {/* Formal statement */}
        <div
          className="rounded-xl p-5 mb-14 border-l-4"
          style={{
            background: "hsl(var(--primary) / 0.05)",
            borderLeftColor: "hsl(var(--primary) / 0.5)",
            borderTopColor: "transparent", borderRightColor: "transparent", borderBottomColor: "transparent",
          }}
        >
          <p className="text-xs font-mono leading-relaxed">
            <span className="font-bold uppercase tracking-widest" style={{ color: "hsl(var(--primary) / 0.8)" }}>
              {isAr ? "بيان رسمي — بروتوكول التعديلات: " : "REVISION PROTOCOL — FORMAL STATEMENT: "}
            </span>
            <span className="text-muted-foreground/70">
              {isAr
                ? "لن يُنفَّذ أي عمل تطوير إضافي أو تعديلات أو تحديثات أو تحسينات خارج نطاق المشروع الأصلي المُتفق عليه، إلا إذا تم شراء تذكرة تعديل والتحقق منها في خزنة العميل. لن يُعالَج أي طلب تغيير خارج هذا البروتوكول."
                : "No additional development work, modifications, updates, or improvements will be performed outside the initial agreed project scope unless a Revision Ticket has been purchased and verified in the Client Vault. Verbal requests or emails requesting out-of-scope changes will not be actioned without a valid ticket."
              }
            </span>
          </p>
        </div>

        {/* Ticket types */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 mb-5">
          {isAr ? "أنواع التذاكر" : "Ticket Types"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {TICKET_TYPES.map(t => (
            <div
              key={t.code}
              className="rounded-xl p-5 border"
              style={{ background: t.accentFill, borderColor: t.accentBorder }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div
                    className="text-[9px] font-black font-mono tracking-widest px-2 py-0.5 rounded mb-2 inline-block"
                    style={{ background: t.accent, color: "hsl(228 12% 6%)" }}
                  >{t.code}</div>
                  <h3 className="text-base font-bold text-foreground">{t.type}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: t.accent }}>{t.credits}</div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/40">
                    {isAr ? "رصيد" : `credit${t.credits > 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40 mb-3">
                {isAr ? "وقت التسليم: " : "Turnaround: "}{t.turnaround}
              </div>
              <ul className="space-y-1.5">
                {t.includes.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                    <span className="shrink-0 mt-0.5" style={{ color: t.accent }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Protocol steps */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 mb-5">
          {isAr ? "كيف يعمل البروتوكول" : "How the Protocol Works"}
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {STEPS.map(step => (
            <div
              key={step.n}
              className="rounded-xl border border-white/[0.06] p-5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="text-3xl font-black mb-3"
                style={{
                  background: "hsl(var(--primary) / 0.2)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.05em",
                }}
              >{step.n}</div>
              <h3 className="font-bold text-sm text-foreground mb-1.5">{step.title}</h3>
              <p className="text-xs text-muted-foreground/50 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 mb-5">
          {isAr ? "أسئلة شائعة" : "Common Questions"}
        </h2>
        <div className="space-y-2 mb-14">
          {FAQS.map(faq => (
            <div
              key={faq.q}
              className="rounded-xl border border-white/[0.06] p-5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <h4 className="text-sm font-bold text-foreground mb-2">{faq.q}</h4>
              <p className="text-xs text-muted-foreground/50 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="rounded-xl border border-white/[0.07] p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div>
            <h3 className="font-bold text-base text-foreground mb-1">
              {isAr ? "هل أنت مستعد لشراء رصيد؟" : "Ready to purchase credits?"}
            </h3>
            <p className="text-sm text-muted-foreground/60">
              {isAr ? "سجّل دخولك إلى خزنة العميل لشراء رصيد التعديلات وإرسال التذاكر." : "Log in to your Client Vault to buy Revision Credits and submit tickets."}
            </p>
          </div>
          <Link href="/vault" className="btn-primary whitespace-nowrap" style={{ padding: "0.75rem 1.5rem" }}>
            {isAr ? "فتح خزنة العميل" : "Open Client Vault"}
          </Link>
        </div>

      </div>
    </div>
  );
}
