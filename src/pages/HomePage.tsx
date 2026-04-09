import { useState } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useListProducts, useListRatings } from "@workspace/api-client-react";
import type { Product, Rating } from "@workspace/api-client-react";

/* ── Shared product catalogue (legacy stub — data now comes from API) ── */
export const PRODUCTS: Product[] = [];

const _legacyFallback = [
  {
    id: "launch",
    name: "Launch Store",
    nameAr: "متجر البداية",
    price: 5900,
    tag: "Starter",
    tagAr: "البداية",
    desc: "A complete digital store setup to get your brand live fast. Theme selection, product setup, and full handover.",
    descAr: "إعداد متجر رقمي كامل للإطلاق السريع. اختيار قالب، إعداد المنتجات، وتسليم شامل.",
    timeline: "2–3 weeks",
    timelineAr: "2–3 أسابيع",
    demoUrl: "",
    accent: "#C9A84C",
    accentBright: "#e5c97a",
    gradient: "linear-gradient(135deg, #1a1208 0%, #110d04 60%, #0a0802 100%)",
    includes: [
      "Premium custom theme selection & setup",
      "Up to 30 products configured",
      "Homepage, About, Contact & Policy pages",
      "Payment gateway configuration",
      "Mobile-optimized layout",
      "Domain connection & DNS",
      "SEO meta configuration",
      "Full handover documentation",
    ],
    includesAr: [
      "اختيار وإعداد قالب مخصص متميز",
      "إعداد ما يصل إلى 30 منتجاً",
      "الصفحات الأساسية كاملة",
      "ضبط بوابة الدفع",
      "تصميم متجاوب للجوال",
      "ربط النطاق وإعداد DNS",
      "إعداد SEO الأساسي",
      "توثيق التسليم الكامل",
    ],
  },
  {
    id: "brand",
    name: "Brand Store",
    nameAr: "متجر العلامة",
    price: 12900,
    tag: "Most Popular",
    tagAr: "الأكثر طلباً",
    desc: "A fully custom digital store built around your brand identity. Custom theme, 100 products, full marketing stack.",
    descAr: "متجر رقمي مخصص بالكامل حول هوية علامتك. قالب مخصص، 100 منتج، منظومة تسويق.",
    timeline: "3–5 weeks",
    timelineAr: "3–5 أسابيع",
    demoUrl: "",
    accent: "#C9A84C",
    accentBright: "#e5c97a",
    gradient: "linear-gradient(135deg, #1c1508 0%, #130f05 60%, #0a0802 100%)",
    includes: [
      "Fully custom theme design & development",
      "Up to 100 products + collections",
      "Complete brand integration",
      "Conversion-optimized product pages",
      "Discount & promotions engine",
      "Email capture + analytics (GA4, Meta Pixel)",
      "30-day post-launch support",
      "Full handover documentation",
    ],
    includesAr: [
      "تصميم قالب مخصص بالكامل",
      "ما يصل إلى 100 منتج وتصنيفات",
      "تكامل العلامة التجارية الكامل",
      "صفحات منتج محسّنة للتحويل",
      "نظام خصومات وعروض",
      "بريد إلكتروني وتحليلات (GA4 + Meta Pixel)",
      "دعم 30 يوماً بعد الإطلاق",
      "توثيق التسليم الكامل",
    ],
  },
  {
    id: "elite",
    name: "Elite Platform",
    nameAr: "منصة النخبة",
    price: 27900,
    tag: "Enterprise",
    tagAr: "مؤسسي",
    desc: "Enterprise digital store with unlimited products, full brand identity, enterprise integrations, and custom checkout.",
    descAr: "متجر مؤسسي مع منتجات غير محدودة، هوية كاملة، تكاملات مؤسسية، ودفع مخصص.",
    timeline: "5–7 weeks",
    timelineAr: "5–7 أسابيع",
    demoUrl: "",
    accent: "#B8960C",
    accentBright: "#d4ad3a",
    gradient: "linear-gradient(135deg, #181205 0%, #100d03 60%, #080601 100%)",
    includes: [
      "Enterprise store setup & configuration",
      "Unlimited products & collections",
      "Custom checkout extensions",
      "Multi-currency & multi-language",
      "ERP / CRM / 3PL integrations",
      "Loyalty & rewards programme",
      "Full brand identity system",
      "60-day post-launch support",
    ],
    includesAr: [
      "إعداد المنصة المؤسسية",
      "منتجات وتصنيفات غير محدودة",
      "إضافات دفع مخصصة",
      "متعدد العملات واللغات",
      "تكاملات ERP/CRM/3PL",
      "برنامج الولاء والمكافآت",
      "نظام هوية علامة تجارية كامل",
      "دعم 60 يوماً بعد الإطلاق",
    ],
  },
  {
    id: "custom",
    name: "Custom Build",
    nameAr: "بناء مخصص",
    price: 50,
    tag: "Bespoke",
    tagAr: "حسب الطلب",
    desc: "Something outside our standard packages? Pay SAR 50 to submit your requirements and receive a detailed custom quote.",
    descAr: "تحتاج شيئاً خارج باقاتنا؟ ادفع 50 ريال لتقديم متطلباتك واستلام عرض سعر مفصّل.",
    timeline: "Quote in 48h",
    timelineAr: "عرض خلال 48 ساعة",
    demoUrl: "",
    accent: "#A08520",
    accentBright: "#c9a84c",
    gradient: "linear-gradient(135deg, #171205 0%, #100d03 60%, #080601 100%)",
    includes: [
      "Requirements intake form",
      "30-min scoping call with the team",
      "Detailed written proposal",
      "Timeline & deliverables breakdown",
      "Fixed-price quote (no surprises)",
      "SAR 50 credited toward your project",
    ],
    includesAr: [
      "نموذج استلام المتطلبات",
      "مكالمة تحديد نطاق 30 دقيقة مع الفريق",
      "مقترح مكتوب مفصّل",
      "جدول زمني وتوزيع المخرجات",
      "عرض سعر ثابت (بلا مفاجآت)",
      "يُحتسب الـ50 ريال من تكلفة المشروع",
    ],
  },
];

/* ── Product Image Visual ─────────────────────────────────── */
function ProductImage({ product }: { product: Product }) {
  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ background: product.gradient }}
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(${product.accentBright} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top ambient glow */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full"
        style={{ background: `radial-gradient(ellipse, ${product.accent}50, transparent 70%)`, filter: "blur(40px)" }}
      />

      {/* Faux browser chrome */}
      <div className="absolute inset-x-6 top-8 bottom-8 rounded-xl overflow-hidden"
        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(4px)" }}>

        {/* Browser bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06]">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <div className="flex-1 mx-2 h-4 rounded bg-white/[0.06] flex items-center px-2">
            <span className="text-[7px] text-white/20 font-mono truncate">mystore.example.com</span>
          </div>
        </div>

        {/* Faux store content */}
        <div className="p-3 flex flex-col gap-2">
          {/* Nav bar */}
          <div className="h-5 rounded" style={{ background: `${product.accent}20` }}>
            <div className="flex items-center justify-between h-full px-2 gap-1">
              <div className="h-1.5 w-6 rounded" style={{ background: product.accent + "60" }} />
              <div className="flex gap-1.5">
                {[1,2,3].map(i => <div key={i} className="h-1 w-4 rounded bg-white/10" />)}
              </div>
              <div className="h-1.5 w-8 rounded" style={{ background: product.accent + "40" }} />
            </div>
          </div>

          {/* Hero banner */}
          <div className="h-14 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${product.accent}30, ${product.accent}10)`, border: `1px solid ${product.accent}20` }}>
            <div className="text-center">
              <div className="h-1.5 w-14 rounded mx-auto mb-1" style={{ background: product.accentBright + "80" }} />
              <div className="h-1 w-8 rounded mx-auto" style={{ background: product.accent + "50" }} />
            </div>
          </div>

          {/* Product mini-grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="h-6" style={{ background: `${product.accent}${20 + i * 6}` }} />
                <div className="p-1">
                  <div className="h-1 w-full rounded bg-white/10 mb-1" />
                  <div className="h-1 w-2/3 rounded" style={{ background: product.accent + "40" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${product.accent}20, transparent)` }}
      />
    </div>
  );
}

/* ── Home page ────────────────────────────────────────────── */
const TICKER_EN = ["Custom Digital Stores", "Contract-First", "Fixed Scope & Price", "Saudi Arabia Studio", "47+ Stores Built", "As-Is Delivery", "Enterprise Builds", "Full Brand Integration"];
const TICKER_AR = ["متاجر رقمية مخصصة", "عقد أولاً", "نطاق وسعر ثابت", "استوديو المملكة العربية السعودية", "+47 متجراً تم بناؤه", "تسليم كما هو", "مشاريع مؤسسية", "تكامل العلامة التجارية الكامل"];

export default function HomePage() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const { theme, accent } = useTheme();
  const isLight = theme === "light";
  const p = "201,168,76";
  const sd = isLight ? `rgba(${p},0.05)` : "rgba(201,168,76,0.03)";   // section dark bg — subtle gold tint
  const sa = isLight ? `rgba(${p},0.08)` : "rgba(201,168,76,0.04)";   // section alt bg
  const sb = isLight ? `rgba(${p},0.03)` : "rgba(201,168,76,0.02)";   // section subtle bg
  const bd = isLight ? `rgba(${p},0.14)` : "rgba(201,168,76,0.12)";   // border dark — gold tinted

  const [certModal, setCertModal] = useState<{ title: string; titleAr: string; pdf: string } | null>(null);
  const [hoveredCert, setHoveredCert] = useState<string | null>(null);
  const { data: products = [], isLoading: productsLoading } = useListProducts({ visible: "true" as unknown as boolean });

  return (
    <main className="pt-16 min-h-screen">

      {/* ── HERO — centered luxury layout ──────────────────── */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: bd, minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* Deep radial glow behind center */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(201,168,76,0.07) 0%, transparent 70%)" }} />
        {/* Ambient bottom glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 30% at 50% 100%, rgba(201,168,76,0.06) 0%, transparent 60%)" }} />
        {/* Grain texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

        {/* Horizontal rule lines — decorative */}
        <div className="absolute top-0 inset-x-0 h-px pointer-events-none" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.15) 30%, rgba(201,168,76,0.15) 70%, transparent)" }} />
        <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.12) 30%, rgba(201,168,76,0.12) 70%, transparent)" }} />

        {/* Main centered content */}
        <div className="relative w-full max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center">

          {/* Logo + Studio name */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: "rgba(201,168,76,0.18)" }} />
              <img src="/maris-logo.jpg" alt="MARIS" className="relative w-16 h-16 rounded-2xl object-cover shadow-2xl" style={{ boxShadow: "0 0 0 1px rgba(201,168,76,0.25), 0 8px 32px rgba(0,0,0,0.5)" }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-px w-8" style={{ background: "rgba(201,168,76,0.35)" }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.45em]" style={{ color: "rgba(201,168,76,0.65)" }}>
                {isAr ? "استوديو التجارة الإلكترونية · المملكة العربية السعودية" : "E-Commerce Studio · Saudi Arabia"}
              </span>
              <div className="h-px w-8" style={{ background: "rgba(201,168,76,0.35)" }} />
            </div>
          </div>

          {/* Main heading — stacked centered */}
          {isAr ? (
            <h1 className="mb-8" style={{ lineHeight: 0.9 }}>
              <span style={{ display: "block", fontFamily: "var(--app-font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(2.8rem,7vw,5.5rem)", color: "rgba(240,238,232,0.9)", letterSpacing: "0.01em" }}>
                متاجر رقمية
              </span>
              <span style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: "clamp(3.2rem,8vw,6.5rem)", color: "hsl(var(--primary))", letterSpacing: "-0.05em", lineHeight: 0.88 }}>
                تُحوِّل
              </span>
              <span style={{ display: "block", fontFamily: "var(--app-font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(2.8rem,7vw,5.5rem)", color: "rgba(240,238,232,0.9)", letterSpacing: "0.01em" }}>
                الزوار.
              </span>
            </h1>
          ) : (
            <h1 className="mb-8" style={{ lineHeight: 0.9 }}>
              <span style={{ display: "block", fontFamily: "var(--app-font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(2.8rem,7vw,5.5rem)", color: "rgba(240,238,232,0.9)", letterSpacing: "0.01em" }}>
                Digital
              </span>
              <span style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: "clamp(3.2rem,8vw,6.5rem)", color: "hsl(var(--primary))", letterSpacing: "-0.05em", lineHeight: 0.88 }}>
                STORES
              </span>
              <span style={{ display: "block", fontFamily: "var(--app-font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(2.8rem,7vw,5.5rem)", color: "rgba(240,238,232,0.9)", letterSpacing: "0.01em" }}>
                That Convert.
              </span>
            </h1>
          )}

          {/* Subtitle */}
          <p className="text-sm leading-relaxed mb-10 max-w-md" style={{ color: "rgba(255,255,255,0.38)" }}>
            {isAr
              ? "نبني متاجر رقمية مخصصة احترافية للعلامات التجارية السعودية — بعقد أولاً، سعر ثابت، وتسليم شامل."
              : "We build premium custom e-commerce stores for Saudi brands — contract-first, fixed price, complete handover."}
          </p>

          {/* CTA buttons */}
          <div className={`flex ${isAr ? "flex-row-reverse" : "flex-row"} gap-3 mb-16`}>
            <Link href="/build">
              <button className="px-8 py-3.5 font-bold text-sm tracking-widest transition-opacity hover:opacity-85"
                style={{ background: "hsl(var(--primary))", color: "#0a0804", letterSpacing: "0.12em" }}>
                {isAr ? "← ابدأ مشروعك" : "START A PROJECT →"}
              </button>
            </Link>
            <a href="#products">
              <button className="px-8 py-3.5 text-sm tracking-widest border transition-all hover:border-primary/40"
                style={{ borderColor: "rgba(201,168,76,0.25)", color: "rgba(255,255,255,0.48)", letterSpacing: "0.1em" }}>
                {isAr ? "عرض الباقات" : "VIEW PACKAGES"}
              </button>
            </a>
          </div>

          {/* Gold divider */}
          <div className="w-full flex items-center gap-4 mb-10">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.18))" }} />
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(201,168,76,0.4)" }} />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,0.18))" }} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
            {[
              { n: "47+",   l: isAr ? "متجر مُسلَّم" : "Stores Delivered" },
              { n: "100%",  l: isAr ? "عقد قبل البدء دائماً" : "Contract-First Always" },
              { n: "5,900", l: isAr ? "ريال — أقل سعر" : "SAR Starting Price" },
              { n: "KSA",   l: isAr ? "المملكة العربية السعودية" : "Saudi Arabia" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-black" style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", letterSpacing: "-0.04em", color: "hsl(var(--primary))" }}>{s.n}</span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-center" style={{ color: "rgba(255,255,255,0.25)" }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom marquee ticker */}
        <div className="absolute bottom-0 inset-x-0 border-t overflow-hidden" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          <div className="marquee-fade py-2.5">
            <div className="marquee" style={{ "--marquee-speed": "30s" } as React.CSSProperties}>
              {[...(isAr ? TICKER_AR : TICKER_EN), ...(isAr ? TICKER_AR : TICKER_EN)].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3 mx-6 text-[8px] font-mono uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.35)" }}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "rgba(201,168,76,0.4)" }} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Studio Statement — Manifesto ─────────────────────── */}
      <div className="border-b" style={{ borderColor: bd }}>
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className={`max-w-3xl ${isAr ? "mr-auto" : ""}`}>
            <p className="font-mono text-[9px] uppercase mb-10" style={{ letterSpacing: "0.45em", color: "rgba(201,168,76,0.5)" }}>
              {isAr ? "فلسفتنا" : "Our Philosophy"}
            </p>
            <blockquote style={{
              fontFamily: "var(--app-font-display)",
              fontSize: "clamp(1.7rem,3.8vw,2.9rem)",
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.3,
              color: isLight ? "#1a1209" : "rgba(240,238,232,0.90)",
              letterSpacing: "0.005em",
              direction: isAr ? "rtl" : "ltr",
            }}>
              {isAr
                ? '"نحن لا نبني قوالب جاهزة. نحن نبني الموطن الرقمي الدائم لعلامتك التجارية."'
                : '"We don\'t build templates. We build your brand\'s permanent home on the internet."'}
            </blockquote>
            <div className={`flex items-center gap-5 mt-10 ${isAr ? "flex-row-reverse" : ""}`}>
              <div className="w-16 h-px shrink-0" style={{ background: "rgba(201,168,76,0.45)" }} />
              <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.35em", color: "rgba(201,168,76,0.6)" }}>
                {isAr ? "استوديو ماريس · المملكة العربية السعودية" : "MARIS Studio · Saudi Arabia"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── [Accreditations moved below Reviews] ── */}
      <div style={{ display: "none" }}>
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(201,168,76,0.05) 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto px-5">
          {/* Section heading */}
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "rgba(201,168,76,0.7)" }}>
              {isAr ? "الوثائق الرسمية" : "Official Documentation"}
            </p>
            <h2
              className="font-black mb-3"
              style={{
                fontSize: "clamp(1.4rem,3vw,2rem)", letterSpacing: "-0.04em",
                background: "linear-gradient(160deg, #e0e2ee 0%, #9a9caa 50%, #d8dae4 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
            >
              {isAr ? "الاعتمادات والثقة" : "Accreditations & Trust"}
            </h2>
            <p className="text-xs text-muted-foreground/40 max-w-md mx-auto">
              {isAr ? "اضغط على أي شهادة للاطلاع على الوثيقة الرسمية والتحقق منها" : "Click any diploma to view and verify the official document"}
            </p>
          </div>

          {/* Diploma gallery */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* ─── Diploma 1 — Freelance License ────────────────── */}
            {(() => {
              const isHov = hoveredCert === "freelance";
              return (
                <button
                  onClick={() => setCertModal({ title: "Freelance Registration Certificate", titleAr: "شهادة تسجيل المستقل", pdf: "/cert-freelancer.pdf" })}
                  onMouseEnter={() => setHoveredCert("freelance")}
                  onMouseLeave={() => setHoveredCert(null)}
                  className="w-full text-left relative rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    filter: isHov ? "grayscale(0) brightness(1)" : "grayscale(0.65) brightness(0.55)",
                    transform: isHov ? "translateY(-3px)" : "translateY(0)",
                    boxShadow: isHov ? "0 0 60px rgba(201,168,76,0.35), 0 0 120px rgba(201,168,76,0.12), inset 0 0 0 1px rgba(201,168,76,0.4)" : "inset 0 0 0 1px rgba(255,255,255,0.07)",
                    transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)",
                    background: "linear-gradient(145deg, rgba(18,14,38,0.95) 0%, rgba(12,9,28,0.98) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Outer frame border */}
                  <div className="absolute inset-2 rounded-xl pointer-events-none" style={{ border: "1px solid rgba(201,168,76,0.18)" }} />
                  <div className="absolute inset-3 rounded-lg pointer-events-none" style={{ border: "1px solid rgba(201,168,76,0.08)" }} />

                  {/* Ambient glow inside */}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%)" }} />

                  {/* Corner ornaments */}
                  {[["top-3 left-3","border-t border-l"],["top-3 right-3","border-t border-r"],["bottom-3 left-3","border-b border-l"],["bottom-3 right-3","border-b border-r"]].map(([pos, borders], i) => (
                    <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none ${borders}`} style={{ borderColor: "rgba(201,168,76,0.35)" }} />
                  ))}

                  {/* Content */}
                  <div className="relative z-10 p-7 flex flex-col gap-5">
                    {/* Issuer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
                          <svg className="w-4 h-4" fill="none" stroke="rgba(201,168,76,0.9)" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(201,168,76,0.75)" }}>
                            {isAr ? "وزارة الموارد البشرية" : "Ministry of Human Resources"}
                          </p>
                          <p className="text-[8px] text-muted-foreground/40">
                            {isAr ? "والتنمية الاجتماعية — المملكة العربية السعودية" : "& Social Development · Saudi Arabia"}
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "rgb(52,211,153)", border: "1px solid rgba(16,185,129,0.22)" }}>
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        {isAr ? "موثّق" : "Verified"}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(201,168,76,0.5)" }} />
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
                    </div>

                    {/* Diploma title */}
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.35em] mb-1.5" style={{ color: "rgba(201,168,76,0.6)" }}>
                        {isAr ? "شهادة رسمية" : "Official Certificate"}
                      </p>
                      <h3 className="font-black leading-tight mb-1" style={{
                        fontSize: "1.15rem", letterSpacing: "-0.02em",
                        background: "linear-gradient(160deg, #e8e9f5 0%, #a0a2b8 50%, #d8dae4 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                      }}>
                        {isAr ? "تسجيل مستقل — ترخيص مزاولة النشاط" : "Freelance Registration License"}
                      </h3>
                      <p className="text-[9px]" style={{ color: "rgba(201,168,76,0.7)" }}>
                        {isAr ? "تطوير وممارسة التجارة الإلكترونية" : "E-Commerce Developer & Practitioner"}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(201,168,76,0.5)" }} />
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
                    </div>

                    {/* Description */}
                    <p className="text-[10px] leading-relaxed text-center" style={{ color: "rgba(180,182,200,0.65)" }}>
                      {isAr
                        ? "مطوّر ومزاول معتمد للتجارة الإلكترونية، مسجّل رسمياً لدى وزارة الموارد البشرية والتنمية الاجتماعية."
                        : "Certified E-Commerce Developer & Practitioner, officially registered with the Ministry of Human Resources and Social Development."}
                    </p>

                    {/* Verification & Validity row */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: "rgba(201,168,76,0.5)" }}>
                          {isAr ? "رقم التحقق" : "Verification No."}
                        </p>
                        <p className="text-[10px] font-mono" style={{ color: "rgba(200,202,220,0.6)" }}>
                          190706671-FL
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: "rgba(201,168,76,0.5)" }}>
                          {isAr ? "صالح حتى" : "Valid Until"}
                        </p>
                        <p className="text-[10px] font-mono" style={{ color: "rgba(200,202,220,0.6)" }}>
                          {isAr ? "يناير 2027" : "Jan 2027"}
                        </p>
                      </div>
                    </div>

                    {/* Click hint */}
                    <div className="text-center pt-1" style={{ opacity: isHov ? 1 : 0, transition: "opacity 0.3s ease" }}>
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: "rgba(201,168,76,0.75)" }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {isAr ? "اضغط لعرض الوثيقة" : "Click to View Document"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })()}

            {/* ─── Diploma 2 — Monsha'at / Doroob Certifications ─── */}
            {(() => {
              const isHov = hoveredCert === "doroob";
              return (
                <div className="flex flex-col gap-4">
                  {[
                    { id: "doroob-ec", title: "E-Commerce Essentials", titleAr: "أساسيات التجارة الإلكترونية", pdf: "/cert-ecommerce-essentials.pdf" },
                    { id: "doroob-es", title: "Product & E-Store Testing", titleAr: "اختبار المنتج والمتجر الإلكتروني", pdf: "/cert-estore.pdf" },
                  ].map(cert => {
                    const isCertHov = hoveredCert === cert.id;
                    return (
                      <button
                        key={cert.id}
                        onClick={() => setCertModal({ title: cert.title, titleAr: cert.titleAr, pdf: cert.pdf })}
                        onMouseEnter={() => setHoveredCert(cert.id)}
                        onMouseLeave={() => setHoveredCert(null)}
                        className="w-full text-left relative rounded-2xl overflow-hidden flex-1"
                        style={{
                          filter: isCertHov ? "grayscale(0) brightness(1)" : "grayscale(0.65) brightness(0.55)",
                          transform: isCertHov ? "translateY(-3px)" : "translateY(0)",
                          boxShadow: isCertHov ? "0 0 50px rgba(201,168,76,0.35), 0 0 100px rgba(201,168,76,0.1), inset 0 0 0 1px rgba(201,168,76,0.4)" : "inset 0 0 0 1px rgba(255,255,255,0.07)",
                          transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)",
                          background: "linear-gradient(145deg, rgba(16,14,38,0.95) 0%, rgba(10,9,28,0.98) 100%)",
                          backdropFilter: "blur(20px)",
                        }}
                      >
                        {/* Frames */}
                        <div className="absolute inset-2 rounded-xl pointer-events-none" style={{ border: "1px solid rgba(201,168,76,0.18)" }} />
                        <div className="absolute inset-3 rounded-lg pointer-events-none" style={{ border: "1px solid rgba(201,168,76,0.08)" }} />

                        {/* Glow */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 70%)" }} />

                        {/* Corners */}
                        {[["top-3 left-3","border-t border-l"],["top-3 right-3","border-t border-r"],["bottom-3 left-3","border-b border-l"],["bottom-3 right-3","border-b border-r"]].map(([pos, borders], i) => (
                          <div key={i} className={`absolute ${pos} w-4 h-4 pointer-events-none ${borders}`} style={{ borderColor: "rgba(201,168,76,0.35)" }} />
                        ))}

                        <div className="relative z-10 p-6 flex flex-col gap-4">
                          {/* Issuer row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="rgba(129,140,248,0.9)" strokeWidth={1.5} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(129,140,248,0.75)" }}>
                                  {isAr ? "منشآت × دروب" : "Monsha'at × Doroob"}
                                </p>
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "rgb(52,211,153)", border: "1px solid rgba(16,185,129,0.22)" }}>
                              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              {isAr ? "معتمد" : "Certified"}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
                            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(201,168,76,0.5)" }} />
                            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent)" }} />
                          </div>

                          {/* Certificate title */}
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "rgba(201,168,76,0.55)" }}>
                              {isAr ? "شهادة اجتياز" : "Certificate of Completion"}
                            </p>
                            <h4 className="font-bold text-sm leading-snug" style={{
                              background: "linear-gradient(160deg, #e2e4f0 0%, #9496aa 50%, #d6d8e2 100%)",
                              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}>
                              {isAr ? cert.titleAr : cert.title}
                            </h4>
                          </div>

                          {/* Bottom row */}
                          <div className="flex items-center justify-between">
                            <p className="text-[9px]" style={{ color: "rgba(160,162,180,0.5)" }}>
                              {isAr ? "يناير 2025 · ساعتان" : "Jan 2025 · 2 hrs"}
                            </p>
                            <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider" style={{ color: "rgba(201,168,76,0.6)", opacity: isCertHov ? 1 : 0, transition: "opacity 0.3s ease" }}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {isAr ? "عرض" : "View"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Shared description box */}
                  <div className="rounded-xl p-4 text-center" style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)" }}>
                    <p className="text-[10px] leading-relaxed" style={{ color: "rgba(180,182,210,0.6)" }}>
                      {isAr
                        ? "شهادتا إتمام احترافيتان في أساسيات التجارة الإلكترونية واختبار المنتج والمتجر الإلكتروني من أكاديمية منشآت."
                        : "Professional Certification in 'The Essentials of E-Commerce' and 'Product & E-Store Testing' from Monsha'at Academy."}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Certificate PDF Modal ────────────────────────────── */}
      {certModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}
          onClick={() => setCertModal(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl border overflow-hidden flex flex-col"
            style={{
              background: "hsl(20 10% 6%)",
              borderColor: "rgba(201,168,76,0.25)",
              maxHeight: "90vh",
              boxShadow: "0 0 80px rgba(201,168,76,0.15)",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                <p className="text-sm font-bold text-foreground">{isAr ? certModal.titleAr : certModal.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Close */}
                <button
                  onClick={() => setCertModal(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF viewer */}
            <div className="flex-1 overflow-hidden" style={{ minHeight: "520px", background: "#f5f5f5" }}>
              <object
                data={`${certModal.pdf}#toolbar=0&navpanes=0`}
                type="application/pdf"
                className="w-full border-0"
                style={{ minHeight: "520px", height: "100%" }}
              >
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(`${window.location.origin}${certModal.pdf}`)}&embedded=true`}
                  className="w-full h-full border-0"
                  style={{ minHeight: "520px" }}
                  title={isAr ? certModal.titleAr : certModal.title}
                />
              </object>
            </div>
          </div>
        </div>
      )}

      {/* ── Product grid — editorial pricing cards ─────────── */}
      <div id="products" className="max-w-6xl mx-auto px-5 py-16">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10 pb-4 border-b" style={{ borderColor: bd }}>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-1.5" style={{ color: "rgba(201,168,76,0.65)" }}>
              {isAr ? "الباقات" : "Our Packages"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", fontWeight: 900, letterSpacing: "-0.04em", color: isLight ? "#0a0804" : "#fff" }}>
              {isAr ? "اختر باقتك" : "Choose Your Build"}
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest hidden md:block" style={{ color: "rgba(201,168,76,0.4)" }}>
            {isAr ? "السعودية فقط" : "Saudi Arabia Only"}
          </span>
        </div>

        {/* Loading skeleton */}
        {productsLoading && (
          <div className="grid md:grid-cols-2 gap-5">
            {[0,1,2,3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden" style={{ border: `1px solid ${bd}` }}>
                <div className="h-52 bg-white/[0.04]" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-32 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/[0.06]" />
                  <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product cards — 2×2 grid with visual mockup */}
        <div className="grid md:grid-cols-2 gap-5">
          {products.map((product) => {
            const name  = isAr ? product.nameAr  : product.name;
            const tag   = isAr ? product.tagAr   : product.tag;
            const desc  = isAr ? product.descAr  : product.desc;
            const time  = isAr ? product.timelineAr : product.timeline;
            const feats = (isAr ? product.includesAr : product.includes).slice(0, 4);
            const ac = product.accent || "#C9A84C";

            return (
              <Link key={product.id} href={`/product/${product.id}`} className="block group">
                <article
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.025)",
                    border: `1px solid ${isLight ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.07)"}`,
                    boxShadow: "0 2px 24px rgba(0,0,0,0.18)",
                    transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.3s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.28), 0 0 0 1px ${ac}40`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${ac}45`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 24px rgba(0,0,0,0.18)";
                    (e.currentTarget as HTMLElement).style.borderColor = isLight ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.07)";
                  }}
                >
                  {/* ── Visual mockup ── */}
                  <div className="relative h-52 overflow-hidden shrink-0">
                    <ProductImage product={product} />
                    {/* Gold shimmer sweep on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `linear-gradient(135deg, transparent 40%, ${ac}10 60%, transparent 80%)` }} />
                  </div>

                  {/* Thin gold separator line */}
                  <div className="h-px w-full shrink-0" style={{ background: `linear-gradient(to right, transparent, ${ac}40, transparent)` }} />

                  {/* ── Card body ── */}
                  <div className="flex flex-col flex-1 p-6 gap-4">
                    {/* Header: name + tag + price */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold" style={{ fontSize: "1.15rem", letterSpacing: "-0.03em", color: isLight ? "#0a0804" : "rgba(240,238,232,0.95)" }}>
                            {name}
                          </h3>
                          <span className="text-[7px] font-bold uppercase shrink-0"
                            style={{ color: `${ac}`, border: `1px solid ${ac}35`, background: `${ac}10`, padding: "2px 7px", letterSpacing: "0.22em" }}>
                            {tag}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.35)" }}>
                          {desc}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-black whitespace-nowrap" style={{ fontSize: "1.15rem", letterSpacing: "-0.04em", color: "hsl(var(--primary))" }}>
                          SAR {product.price.toLocaleString()}
                        </p>
                        <p className="font-mono text-[9px] mt-0.5" style={{ color: `${ac}70` }}>{time}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 flex-1">
                      {feats.map((feat, fi) => (
                        <div key={fi} className="flex items-start gap-1.5">
                          <span className="mt-[3px] shrink-0" style={{ color: `${ac}80`, fontSize: "0.55rem" }}>◆</span>
                          <span style={{ fontSize: "0.68rem", lineHeight: 1.55, color: isLight ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.38)" }}>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: `${ac}18` }}>
                      <span className="text-[9px] font-mono uppercase" style={{ color: `${ac}55`, letterSpacing: "0.2em" }}>{time}</span>
                      <div className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
                        style={{ color: ac }}>
                        <span className="text-[10px] font-bold uppercase" style={{ letterSpacing: "0.18em" }}>
                          {isAr ? "التفاصيل" : "View Details"}
                        </span>
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── How it works — clean horizontal steps ──────────── */}
      <div className="border-t border-b py-16" style={{ background: sd, borderColor: bd }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row md:items-start gap-12">
            {/* Left: Section label */}
            <div className="md:w-44 shrink-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-2" style={{ color: "rgba(201,168,76,0.65)" }}>
                {isAr ? "العملية" : "The Process"}
              </p>
              <h2 style={{ fontSize: "clamp(1.4rem,2.5vw,1.9rem)", fontWeight: 900, letterSpacing: "-0.04em", color: isLight ? "#0a0804" : "#fff" }}>
                {isAr ? "كيف نعمل" : "How it works"}
              </h2>
              <p className="text-xs mt-2" style={{ color: isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)" }}>
                {isAr ? "أربع خطوات — بلا مفاجآت" : "Four steps. No surprises."}
              </p>
            </div>

            {/* Right: Steps */}
            <div className="flex-1 divide-y" style={{ borderColor: bd }}>
              {[
                { step: "01", title: isAr ? "اختر باقتك" : "Choose your package", desc: isAr ? "تصفح الباقات الأربع واختر ما يناسب علامتك وميزانيتك." : "Browse 4 packages and pick what fits your brand and budget." },
                { step: "02", title: isAr ? "وقّع العقد" : "Sign the contract",    desc: isAr ? "لا يبدأ أي عمل بدون عقد موقّع. الشفافية والحماية للطرفين." : "No work starts without a signed contract — protecting both sides." },
                { step: "03", title: isAr ? "نبني متجرك" : "We build your store",  desc: isAr ? "فريقنا يبني وفق المتفق عليه. تحديثات مستمرة طوال المشروع." : "Our team builds to spec with regular updates throughout." },
                { step: "04", title: isAr ? "استلم ملكيتك" : "You own it",          desc: isAr ? "تسليم شامل — بيانات دخول كاملة، توثيق، ولا قيود." : "Full handover — all credentials, documentation, zero strings." },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-6 py-5">
                  <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: "rgba(201,168,76,0.45)", minWidth: "2rem" }}>{s.step}</span>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:gap-6">
                    <p className="font-bold text-sm sm:w-44 shrink-0 mb-1 sm:mb-0" style={{ color: isLight ? "#0a0804" : "#fff", letterSpacing: "-0.015em" }}>{s.title}</p>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.38)" }}>{s.desc}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[9px]" style={{ color: "rgba(201,168,76,0.3)" }}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────────── */}
      <ReviewsSection isAr={isAr} />

      {/* ── Accreditations & Trust (compact) ─────────────────── */}
      <div className="border-t py-10" style={{ background: sd, borderColor: bd }}>
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(201,168,76,0.6)" }}>
                {isAr ? "الوثائق الرسمية" : "Official Accreditations"}
              </p>
              <h3 className="font-black" style={{ fontSize: "1.1rem", letterSpacing: "-0.03em", color: "rgba(220,222,240,0.85)" }}>
                {isAr ? "الاعتمادات والثقة" : "Accreditations & Trust"}
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground/30 hidden sm:block max-w-xs text-right">
              {isAr ? "اضغط على أي شهادة لعرض الوثيقة الرسمية" : "Click any certificate to view the official document"}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                id: "freelance",
                issuer: isAr ? "وزارة الموارد البشرية" : "Ministry of Human Resources",
                title: isAr ? "تسجيل مستقل — ترخيص مزاولة النشاط" : "Freelance Registration License",
                badge: isAr ? "موثّق" : "Verified",
                ref: "190706671-FL",
                pdf: "/cert-freelancer.pdf",
                titleEn: "Freelance Registration Certificate",
                titleAr: "شهادة تسجيل المستقل",
                accent: "rgba(201,168,76,",
              },
              {
                id: "doroob-ec",
                issuer: isAr ? "منشآت × دروب" : "Monsha'at × Doroob",
                title: isAr ? "أساسيات التجارة الإلكترونية" : "E-Commerce Essentials",
                badge: isAr ? "معتمد" : "Certified",
                ref: "DOC-EC-2025",
                pdf: "/cert-ecommerce-essentials.pdf",
                titleEn: "E-Commerce Essentials",
                titleAr: "أساسيات التجارة الإلكترونية",
                accent: "rgba(201,168,76,",
              },
              {
                id: "doroob-es",
                issuer: isAr ? "منشآت × دروب" : "Monsha'at × Doroob",
                title: isAr ? "اختبار المنتج والمتجر الإلكتروني" : "Product & E-Store Testing",
                badge: isAr ? "معتمد" : "Certified",
                ref: "DOC-ES-2025",
                pdf: "/cert-estore.pdf",
                titleEn: "Product & E-Store Testing",
                titleAr: "اختبار المنتج والمتجر الإلكتروني",
                accent: "rgba(201,168,76,",
              },
            ].map(cert => {
              const isHov = hoveredCert === cert.id;
              const a = cert.accent;
              return (
                <button
                  key={cert.id}
                  onClick={() => setCertModal({ title: cert.titleEn, titleAr: cert.titleAr, pdf: cert.pdf })}
                  onMouseEnter={() => setHoveredCert(cert.id)}
                  onMouseLeave={() => setHoveredCert(null)}
                  className="w-full text-left rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: isHov ? `${a}0.06)` : "rgba(255,255,255,0.025)",
                    border: `1px solid ${isHov ? `${a}0.4)` : "rgba(255,255,255,0.07)"}`,
                    boxShadow: isHov ? `0 0 30px ${a}0.12), 0 4px 20px rgba(0,0,0,0.3)` : "none",
                    transform: isHov ? "translateY(-2px)" : "translateY(0)",
                    filter: isHov ? "grayscale(0) brightness(1)" : "grayscale(0.5) brightness(0.7)",
                  }}
                >
                  {/* Corner ornaments */}
                  {[["top-2 left-2","border-t border-l"],["top-2 right-2","border-t border-r"],["bottom-2 left-2","border-b border-l"],["bottom-2 right-2","border-b border-r"]].map(([pos, brd], i) => (
                    <div key={i} className={`absolute ${pos} w-3 h-3 pointer-events-none ${brd}`} style={{ borderColor: `${a}0.4)` }} />
                  ))}
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: `${a}0.7)` }}>{cert.issuer}</p>
                    <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.12)", color: "rgb(52,211,153)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <svg className="w-2 h-2 inline mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {cert.badge}
                    </span>
                  </div>
                  <p className="font-bold text-xs leading-snug" style={{ color: "rgba(220,222,240,0.85)" }}>{cert.title}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: `${a}0.12)` }}>
                    <span className="text-[8px] font-mono" style={{ color: `${a}0.5)` }}>{cert.ref}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: `${a}${isHov ? "0.8)" : "0.4)"}`, opacity: isHov ? 1 : 0.5 }}>
                      <svg className="w-2.5 h-2.5 inline mr-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {isAr ? "عرض" : "View"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <FaqSection isAr={isAr} />

    </main>
  );
}

/* ── Reviews component ───────────────────────────────────── */
function StarRow({ rating, accent }: { rating: number; accent: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={i <= rating ? accent : "rgba(255,255,255,0.1)"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const PRODUCT_ACCENTS: Record<string, string> = {
  launch: "#C9A84C",
  brand: "#D4AF37",
  elite: "#B8960C",
  custom: "#A08520",
};

function ReviewsSection({ isAr }: { isAr: boolean }) {
  const { data: ratings = [] } = useListRatings({});
  const { data: products = [] } = useListProducts();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const sectionBg = isLight ? "rgba(201,168,76,0.07)" : "rgba(201,168,76,0.03)";
  const borderC = isLight ? "rgba(201,168,76,0.14)" : "rgba(201,168,76,0.10)";

  if (ratings.length === 0) return null;

  const productName = (id: string) => {
    const p = products.find(p => p.id === id);
    if (!p) return id;
    return isAr ? p.nameAr : p.name;
  };

  const accentFor = (id: string) => PRODUCT_ACCENTS[id] ?? "#C9A84C";

  return (
    <div className="border-t py-16" style={{ background: sectionBg, borderColor: borderC }}>
      <div className="max-w-6xl mx-auto px-5">
        {/* Heading */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              className="font-bold text-foreground mb-2"
              style={{ fontSize: "clamp(1.2rem,2.5vw,1.75rem)", letterSpacing: "-0.025em" }}
            >
              {isAr ? "ما يقوله عملاؤنا" : "What Our Clients Say"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isAr ? "تقييمات حقيقية من عملائنا — بلا تعديل." : "Real reviews from real clients — unedited."}
            </p>
          </div>
          {/* Average stars */}
          {ratings.length > 0 && (() => {
            const avg = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
            return (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill={i <= Math.round(avg) ? "#C9A84C" : "rgba(201,168,76,0.12)"}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-muted-foreground/50">
                  {avg.toFixed(1)} / 5 &nbsp;·&nbsp; {ratings.length} {isAr ? "تقييم" : "reviews"}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Marquee track */}
      </div>

      <style>{`
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .marquee-track { will-change: transform; }
        .marquee-track:hover { animation-play-state: paused !important; }
      `}</style>

      <div style={{ overflow: "hidden", maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
        <div
          className="marquee-track flex gap-4"
          style={{
            width: "max-content",
            animation: `${isAr ? "marquee-rtl" : "marquee-ltr"} ${Math.max(20, ratings.length * 6)}s linear infinite`,
          }}
        >
          {[...ratings, ...ratings].map((r: Rating, idx) => {
            const accent = accentFor(r.productId);
            return (
              <div
                key={`${r.id}-${idx}`}
                className="rounded-2xl border p-5 flex flex-col gap-4 shrink-0 transition-all duration-300"
                style={{
                  width: "300px",
                  background: "rgba(255,255,255,0.02)",
                  borderColor: `${accent}20`,
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${accent}50`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${accent}20`)}
              >
                {/* Stars */}
                <StarRow rating={r.rating} accent={accent} />

                {/* Comment */}
                {r.comment && (
                  <p
                    className="text-sm text-foreground/80 leading-relaxed flex-1"
                    style={{ direction: /[\u0600-\u06FF]/.test(r.comment) ? "rtl" : "ltr" }}
                  >
                    "{r.comment}"
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0"
                      style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
                    >
                      {r.authorName.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-foreground/70 truncate max-w-[110px]">{r.authorName}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
                    style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}
                  >
                    {productName(r.productId)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ component ───────────────────────────────────────── */
function FaqSection({ isAr }: { isAr: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";
  const itemBg = isLight ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.03)";
  const itemBorder = isLight ? "rgba(201,168,76,0.14)" : "rgba(201,168,76,0.10)";
  const faqs = isAr ? [
    { q: "ماذا أحتاج لتقديمه؟", a: "شعار العلامة التجارية، الألوان، الخطوط، قائمة المنتجات، وأي مراجع تصميمية. سنرشدك خلال نموذج استلام مفصّل." },
    { q: "كم تستغرق المدة؟", a: "من 2 إلى 7 أسابيع حسب الباقة. تبدأ المدة بعد توقيع العقد وتقديم المواد." },
    { q: "كيف يعمل نظام التعديلات؟", a: "التعديلات بعد التسليم تُعالج عبر تذاكر التعديل المتاحة في خزنة العميل. كل تذكرة تغطي تعديلاً محدداً بسعر ثابت." },
    { q: "ما خيارات الدفع؟", a: "50% دفعة أولى عند توقيع العقد، و50% عند التسليم — أو الدفع الكامل مقدماً. الدفع بالتحويل البنكي أو حسب الاتفاق." },
    { q: "هل يمكنني إدارة المتجر بنفسي بعد التسليم؟", a: "نعم. جميع الباقات تتضمن توثيقاً شاملاً وبيانات دخول كاملة. يمكنك إدارة المتجر بشكل مستقل تماماً." },
    { q: "هل يمكنني الإلغاء بعد التوقيع؟", a: "العقد ملزم بعد التوقيع. لا يُرجع المبلغ بعد بدء العمل. لذلك نحرص على أن يكون كل شيء واضحاً قبل البدء." },
  ] : [
    { q: "What do I need to provide?", a: "Your brand assets (logo, colors, fonts), product list, and any design references. We'll walk you through a detailed intake form." },
    { q: "How long does it take?", a: "2–7 weeks depending on the package. The timeline starts after the contract is signed and assets are submitted." },
    { q: "How does the revision system work?", a: "Post-delivery changes are handled through Revision Tickets available in your Client Vault. Each ticket covers a specific change at a fixed price." },
    { q: "How does payment work?", a: "50% upfront on contract signing + 50% on delivery — or full payment upfront. We accept bank transfer or as agreed." },
    { q: "Can I manage the store myself after handover?", a: "Yes. All packages include full handover documentation and all credentials. You'll have complete independent control." },
    { q: "Can I cancel after signing?", a: "The contract is binding once signed. No refunds after work commences. That's why we make sure everything is clear before we start." },
  ];

  return (
    <div className="border-t py-16" style={{ borderColor: itemBorder }}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid md:grid-cols-[280px_1fr] gap-12 items-start">
          <div>
            <h2
              className="font-bold text-foreground mb-2"
              style={{ fontSize: "clamp(1.2rem,2.5vw,1.75rem)", letterSpacing: "-0.025em" }}
            >
              {isAr ? "الأسئلة الشائعة" : "FAQ"}
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              {isAr ? "أسئلة يطرحها معظم العملاء قبل الشراء." : "Questions most clients ask before ordering."}
            </p>
            <a
              href="mailto:studiomaris@outlook.com"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-primary transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              studiomaris@outlook.com
            </a>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ background: itemBg, border: `1px solid ${itemBorder}` }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-foreground" style={{ letterSpacing: "-0.01em" }}>{faq.q}</span>
                  <svg
                    className="w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform duration-200"
                    style={{ transform: open === i ? "rotate(180deg)" : "none" }}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {open === i && (
                  <div className="px-5 pb-4 border-t border-white/[0.04]">
                    <p className="text-sm text-muted-foreground/70 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
