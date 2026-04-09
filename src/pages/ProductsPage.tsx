import { Link } from "wouter";
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

const PACKAGES = [
  {
    id: "launch",
    nameKey: "Launch Store",
    nameArKey: "متجر البداية",
    price: "SAR 5,900",
    priceNote: "One-time, fixed price",
    priceNoteAr: "سعر ثابت، دفعة واحدة",
    tagline: "Everything you need to go live fast.",
    taglineAr: "كل ما تحتاجه للإطلاق السريع.",
    badge: null,
    featured: false,
    timeline: "2–3 Weeks",
    timelineAr: "2–3 أسابيع",
    includes: [
      "Premium custom theme selection & design",
      "Up to 30 products set up & organized",
      "Homepage, About, Contact & Policy pages",
      "Payment gateway configuration",
      "Mobile-optimized responsive layout",
      "Domain connection & DNS setup",
      "Basic SEO meta configuration",
      "Full handover documentation",
    ],
    includesAr: [
      "اختيار وتصميم قالب مخصص متميز",
      "إعداد وتنظيم ما يصل إلى 30 منتجاً",
      "صفحات: الرئيسية، عن الشركة، التواصل، والسياسات",
      "ضبط بوابة الدفع",
      "تصميم متجاوب محسّن للجوال",
      "ربط النطاق وإعداد DNS",
      "إعداد أساسي لـ SEO",
      "توثيق كامل للتسليم",
    ],
    notIncluded: ["Custom theme development", "Logo or brand identity work", "More than 30 products", "Third-party app integrations"],
    notIncludedAr: ["تطوير قالب مخصص", "تصميم الشعار أو هوية العلامة", "أكثر من 30 منتجاً", "تكامل تطبيقات خارجية"],
    cta: "Order Launch Store",
    ctaAr: "اطلب متجر البداية",
    ctaLink: "/build",
  },
  {
    id: "brand",
    nameKey: "Brand Store",
    nameArKey: "متجر العلامة",
    price: "SAR 12,900",
    priceNote: "One-time, fixed price",
    priceNoteAr: "سعر ثابت، دفعة واحدة",
    tagline: "A store that looks and feels like your brand.",
    taglineAr: "متجر يعكس روح علامتك التجارية.",
    badge: "Most Popular",
    badgeAr: "الأكثر طلباً",
    featured: true,
    timeline: "3–5 Weeks",
    timelineAr: "3–5 أسابيع",
    includes: [
      "Fully custom theme design & development",
      "Complete brand integration (fonts, colors, identity)",
      "Up to 100 products with custom collections",
      "Homepage with animated sections & lifestyle imagery",
      "Custom product pages with conversion-optimized layout",
      "Discount & promotions system",
      "Email capture & marketing integrations",
      "Abandoned cart & upsell setup",
      "Analytics & tracking (GA4, Meta Pixel)",
      "Full handover documentation + 30-day support window",
    ],
    includesAr: [
      "تصميم وتطوير قالب مخصص بالكامل",
      "تكامل العلامة التجارية كاملاً (خطوط، ألوان، هوية)",
      "ما يصل إلى 100 منتج مع تصنيفات مخصصة",
      "صفحة رئيسية بأقسام متحركة وصور احترافية",
      "صفحات منتج مخصصة محسّنة للتحويل",
      "نظام خصومات وعروض ترويجية",
      "تكاملات البريد الإلكتروني والتسويق",
      "إعداد عربة مهجورة وبيع إضافي (upsell)",
      "التحليلات والتتبع (GA4، Meta Pixel)",
      "توثيق كامل للتسليم + نافذة دعم لمدة 30 يوماً",
    ],
    notIncluded: ["Logo creation or brand identity system", "More than 100 products", "Multi-currency or multi-language", "Custom apps or complex automations"],
    notIncludedAr: ["إنشاء شعار أو نظام هوية العلامة", "أكثر من 100 منتج", "متعدد العملات أو متعدد اللغات", "تطبيقات مخصصة أو أتمتة معقدة"],
    cta: "Order Brand Store",
    ctaAr: "اطلب متجر العلامة",
    ctaLink: "/build",
  },
  {
    id: "elite",
    nameKey: "Elite Platform",
    nameArKey: "المنصة النخبة",
    price: "SAR 27,900",
    priceNote: "One-time, fixed price",
    priceNoteAr: "سعر ثابت، دفعة واحدة",
    tagline: "Enterprise-grade. No limits. Full ownership.",
    taglineAr: "درجة المؤسسات. بلا حدود. ملكية كاملة.",
    badge: null,
    featured: false,
    timeline: "5–7 Weeks",
    timelineAr: "5–7 أسابيع",
    includes: [
      "Enterprise platform setup & configuration",
      "Fully custom theme with unique design system",
      "Unlimited products & complex collection architecture",
      "Custom checkout extensions & checkout UI",
      "Multi-currency & multi-language support",
      "Third-party app integrations (ERP, CRM, 3PL)",
      "Custom discount logic & shipping rules",
      "Loyalty & rewards programme",
      "Advanced analytics dashboard",
      "Influencer / affiliate tracking system",
      "Performance optimization & Core Web Vitals tuning",
      "Full brand identity system (logo, guidelines, UI kit)",
      "Full handover documentation + 60-day support window",
    ],
    includesAr: [
      "إعداد وتهيئة المنصة المؤسسية",
      "قالب مخصص بالكامل بنظام تصميم فريد",
      "منتجات غير محدودة وهيكل تصنيفات معقد",
      "إضافات الدفع المخصصة وواجهة Checkout",
      "دعم متعدد العملات ومتعدد اللغات",
      "تكاملات تطبيقات خارجية (ERP، CRM، 3PL)",
      "منطق خصومات وشحن مخصص",
      "برنامج الولاء والمكافآت",
      "لوحة تحليلات متقدمة",
      "نظام تتبع المؤثرين والعمولات",
      "تحسين الأداء وضبط Core Web Vitals",
      "نظام هوية علامة تجارية كامل (شعار، دليل، UI kit)",
      "توثيق كامل للتسليم + نافذة دعم لمدة 60 يوماً",
    ],
    notIncluded: ["Ongoing content management", "Monthly retainer services"],
    notIncludedAr: ["إدارة المحتوى المستمرة", "خدمات الاستبقاء الشهري"],
    cta: "Order Elite Platform",
    ctaAr: "اطلب المنصة النخبة",
    ctaLink: "/build",
  },
];

const ADD_ONS_EN = [
  { name: "Brand Identity System",      price: "SAR 3,200", desc: "Logo design, color palette, typography selection, and a complete brand guideline document." },
  { name: "Product Photography Brief",  price: "SAR 1,500", desc: "Professional shot list, mood board, and creative brief to hand off to your photographer." },
  { name: "Copywriting Package",        price: "SAR 2,400", desc: "Homepage copy, product descriptions (up to 50), About page, and email welcome sequence." },
  { name: "Revision Ticket Bundle (5×)",price: "SAR 2,250", desc: "5 pre-purchased revision credits at a discounted rate. Valid for 12 months post-delivery." },
];
const ADD_ONS_AR = [
  { name: "نظام هوية العلامة التجارية",   price: "SAR 3,200", desc: "تصميم شعار، لوحة ألوان، اختيار خطوط، ووثيقة دليل علامة تجارية كاملة." },
  { name: "ملف تصوير المنتجات",            price: "SAR 1,500", desc: "قائمة لقطات احترافية، لوح مزاج، وملف إبداعي تسلمه لمصورك." },
  { name: "باقة كتابة المحتوى",            price: "SAR 2,400", desc: "محتوى الصفحة الرئيسية، أوصاف المنتجات (حتى 50)، صفحة من نحن، وتسلسل بريد ترحيبي." },
  { name: "حزمة تذاكر تعديل (5×)",         price: "SAR 2,250", desc: "5 رصيد تعديل مسبق الشراء بسعر مخفض. صالحة لمدة 12 شهراً بعد التسليم." },
];

const STEPS_EN = [
  { n: "1", t: "Contract Sent",       d: "Service agreement emailed within 24 hours." },
  { n: "2", t: "You Sign",            d: "Digital signature locks the scope. No scope changes after this point." },
  { n: "3", t: "Brief Submitted",     d: "You fill in your brand brief form — assets, products, preferences." },
  { n: "4", t: "We Build",            d: "Studio takes over. Milestone check-ins only. No endless revisions." },
  { n: "5", t: "Store Transferred",   d: "Full handover. You own it completely. Liability ends at delivery." },
];
const STEPS_AR = [
  { n: "1", t: "إرسال العقد",     d: "تصلك اتفاقية الخدمة بالبريد خلال 24 ساعة." },
  { n: "2", t: "التوقيع",         d: "التوقيع الرقمي يقفل النطاق. لا تغييرات بعد هذه النقطة." },
  { n: "3", t: "تقديم الملف",     d: "تملأ نموذج ملف علامتك — الأصول، المنتجات، التفضيلات." },
  { n: "4", t: "نبدأ البناء",     d: "يتولى الاستوديو كل شيء. نقاط مراجعة للإنجازات فقط." },
  { n: "5", t: "نقل المتجر",      d: "تسليم كامل. تملكه بالكامل. المسؤولية تنتهي عند التسليم." },
];

const FAQS_EN = [
  { q: "What happens after I order?",                a: "You'll receive a service contract within 24 hours. Once signed and payment is confirmed, your project slot is booked and we get started." },
  { q: "Is the price really fixed?",                 a: "Yes. No hidden fees, no hourly billing, no scope creep charges. The price shown is the price you pay." },
  { q: "What if I want changes after delivery?",     a: "Delivered stores are transferred as-is. Changes after delivery require a Revision Ticket (SAR 450 each)." },
  { q: "Do you work with enterprise stores?",         a: "Yes. The Elite Platform package is purpose-built for enterprise-level requirements. Request a custom quote for multi-store or complex architecture." },
  { q: "What do I need to provide?",                 a: "Your brand assets (logo, images, copy) and your product catalogue. We handle the technical setup and everything else." },
  { q: "Can I upgrade between packages?",            a: "Upgrades must be decided before the contract is signed. Once scope is locked, it cannot be changed mid-project." },
];
const FAQS_AR = [
  { q: "ماذا يحدث بعد الطلب؟",                      a: "ستصلك اتفاقية الخدمة خلال 24 ساعة. بعد التوقيع وتأكيد الدفع، يُحجز مكانك في الجدول ونبدأ العمل." },
  { q: "هل السعر ثابت فعلاً؟",                       a: "نعم. لا رسوم مخفية، لا فوترة بالساعة، لا رسوم تضخم نطاق. السعر المعروض هو ما تدفعه." },
  { q: "ماذا لو أردت تغييرات بعد التسليم؟",          a: "المتاجر المسلّمة تُنقل كما هي. التغييرات بعد التسليم تستلزم تذكرة تعديل (SAR 450 لكل تذكرة)." },
  { q: "هل تعملون مع المتاجر المؤسسية؟",              a: "نعم. باقة المنصة النخبة مصمّمة للمتطلبات المؤسسية. اطلب عرض سعر مخصص للبنية متعددة المتاجر أو المعقدة." },
  { q: "ما الذي أحتاج تقديمه؟",                      a: "أصول علامتك التجارية (شعار، صور، محتوى)، وكتالوج منتجاتك. نتولى الإعداد التقني وكل شيء آخر." },
  { q: "هل يمكنني الترقية بين الباقات؟",              a: "يجب اتخاذ قرار الترقية قبل توقيع العقد. بعد قفل النطاق، لا يمكن تغييره في منتصف المشروع." },
];

export default function ProductsPage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const addons = isAr ? ADD_ONS_AR : ADD_ONS_EN;
  const steps  = isAr ? STEPS_AR  : STEPS_EN;
  const faqs   = isAr ? FAQS_AR   : FAQS_EN;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="pt-14 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative text-center px-5 py-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(192 100% 50% / 0.08) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/[0.05] text-[11px] font-semibold text-primary tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {t("products.label")}
          </div>
          <h1
            className="font-bold text-foreground mb-5"
            style={{ fontSize: "clamp(2.2rem,5.5vw,4.5rem)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
          >
            {t("products.h1a")}<br />
            <span className="text-gradient-cyan">{t("products.h1b")}</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t("products.sub")}
          </p>
        </div>
      </section>


      {/* ── PACKAGES ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PACKAGES.map(pkg => {
            const name       = isAr ? pkg.nameArKey : pkg.nameKey;
            const tagline    = isAr ? pkg.taglineAr : pkg.tagline;
            const badge      = isAr ? (pkg as any).badgeAr ?? pkg.badge : pkg.badge;
            const timeline   = isAr ? pkg.timelineAr : pkg.timeline;
            const priceNote  = isAr ? pkg.priceNoteAr : pkg.priceNote;
            const includes   = isAr ? pkg.includesAr : pkg.includes;
            const notIncl    = isAr ? pkg.notIncludedAr : pkg.notIncluded;
            const cta        = isAr ? pkg.ctaAr : pkg.cta;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300
                  ${pkg.featured
                    ? "border border-primary/30 bg-card shadow-[0_0_60px_hsl(var(--primary)/0.08)] md:-mt-5"
                    : "border border-white/[0.07] bg-card hover:border-white/[0.12]"
                  }`}
              >
                {/* Top glow line for featured */}
                {pkg.featured && (
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                )}

                {/* Badge */}
                {badge && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 border border-primary/25 text-primary">
                    {badge}
                  </div>
                )}

                {/* Header */}
                <div className="p-6 pb-5">
                  <p className="text-[10px] font-mono text-muted-foreground/45 uppercase tracking-widest mb-2">{tagline}</p>
                  <h2 className="text-xl font-bold text-foreground mb-5" style={{ letterSpacing: "-0.02em" }}>{name}</h2>

                  <div className="mb-1">
                    <span
                      className={`font-bold tracking-tight ${pkg.featured ? "text-primary" : "text-foreground"}`}
                      style={{ fontSize: "clamp(1.9rem,3.5vw,2.5rem)", letterSpacing: "-0.04em" }}
                    >
                      {pkg.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-xs text-muted-foreground/50">{priceNote}</span>
                    <span className="text-muted-foreground/20">·</span>
                    <span className="text-xs font-mono text-muted-foreground/50">{timeline}</span>
                  </div>

                  <Link
                    href={`${pkg.ctaLink}?package=${pkg.id}`}
                    className={pkg.featured ? "btn-primary w-full justify-center" : "btn-outline w-full justify-center"}
                  >
                    {cta}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>

                {/* Feature list */}
                <div className="px-6 pb-6 border-t border-white/[0.05] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/35 mb-4">
                    {t("products.included")}
                  </p>
                  <ul className="space-y-2.5">
                    {includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/75">
                        <svg className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.featured ? "text-primary" : "text-primary/60"}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {notIncl.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {notIncl.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground/30">
                          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom quote strip */}
        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-card px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-0.5">{t("products.custom.q")}</h3>
            <p className="text-xs text-muted-foreground">{t("products.custom.a")}</p>
          </div>
          <Link href="/build" className="btn-outline btn-sm shrink-0">{t("products.custom.btn")}</Link>
        </div>
      </section>


      {/* ── ADD-ONS ──────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] max-w-6xl mx-auto px-5 py-20">
        <div className="mb-10">
          <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-3">{t("products.addons.label")}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2" style={{ letterSpacing: "-0.03em" }}>
            {t("products.addons.h2")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("products.addons.sub")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {addons.map(a => (
            <div key={a.name} className="card-border p-5 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group">
              <div className="text-xl font-bold text-primary mb-1 group-hover:text-primary" style={{ letterSpacing: "-0.03em" }}>{a.price}</div>
              <h3 className="text-sm font-semibold text-foreground mb-2">{a.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── WHAT HAPPENS NEXT ────────────────────────────── */}
      <section className="border-t border-white/[0.05] max-w-6xl mx-auto px-5 py-20">
        <div className="mb-10">
          <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-3">{t("products.after.label")}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground" style={{ letterSpacing: "-0.03em" }}>
            {t("products.after.h2")}
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-5 left-[calc(10%+8px)] right-[calc(10%+8px)] h-px bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

          <div className="grid sm:grid-cols-3 md:grid-cols-5 gap-4">
            {steps.map((s, i) => (
              <div key={s.n} className="flex flex-col items-center text-center relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 z-10 transition-all duration-300
                  ${i === 0 || i === 4 ? "bg-primary/15 border-2 border-primary/40" : "bg-white/[0.04] border border-white/[0.1]"}`}>
                  <span className="text-[11px] font-bold text-primary font-mono">{s.n}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{s.t}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* As-Is notice */}
        <div className="mt-10 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.04] p-4">
          <p className="text-xs leading-relaxed text-yellow-600/80 dark:text-yellow-400/60">
            <span className="font-semibold text-yellow-500 dark:text-yellow-400">{t("finality.title")} — </span>
            {t("finality.body")}
          </p>
        </div>
      </section>


      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="border-t border-white/[0.05] max-w-6xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-3">{t("products.faq.label")}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground" style={{ letterSpacing: "-0.03em" }}>
              {t("products.faq.h2")}
            </h2>
          </div>
          <div className="md:col-span-3 divide-y divide-white/[0.05]">
            {faqs.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  className="w-full flex items-center justify-between gap-3 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={`text-sm font-semibold transition-colors ${openFaq === i ? "text-primary" : "text-foreground"}`}>
                    {faq.q}
                  </span>
                  <svg
                    className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180 text-primary" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed pr-8">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="relative rounded-2xl overflow-hidden border border-primary/15 bg-primary/[0.04] px-8 py-14 text-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, hsl(192 100% 50% / 0.10) 0%, transparent 70%)" }}
          />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3" style={{ letterSpacing: "-0.03em" }}>
              {t("products.bottom.h2a")} <span className="text-gradient-cyan">{t("products.bottom.h2b")}</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">{t("products.bottom.sub")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#"
                onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="btn-primary btn-lg glow-sm"
              >
                {t("products.order")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </a>
              <Link href="/build" className="btn-outline btn-lg">{t("cta.btn2")}</Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
