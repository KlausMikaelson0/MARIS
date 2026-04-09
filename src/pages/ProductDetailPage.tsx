import { useState } from "react";
import { Link, useParams } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import {
  useGetProduct,
  useListRatings,
  useCreateRating,
  useListProductSettings,
} from "@workspace/api-client-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLang();
  const { addItem, openCart } = useCart();
  const isAr = lang === "ar";

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Ratings
  const [ratingVal, setRatingVal] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingName, setRatingName] = useState("");
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const productId = id ?? "";
  const { data: product, isLoading: productLoading } = useGetProduct(productId, {
    query: { enabled: !!productId },
  });
  const { data: settingsList } = useListProductSettings();
  const { data: ratings, refetch: refetchRatings } = useListRatings({ productId });
  const createRating = useCreateRating();

  const productSettings = settingsList?.find(s => s.productId === productId);
  const ratingsEnabled = productSettings?.ratingsEnabled ?? true;

  async function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingVal || !ratingName.trim()) return;
    await createRating.mutateAsync({
      data: { productId, authorName: ratingName.trim(), rating: ratingVal, comment: ratingComment || null },
    });
    setRatingSubmitted(true);
    setRatingVal(0);
    setRatingName("");
    setRatingComment("");
    refetchRatings();
    setTimeout(() => setRatingSubmitted(false), 4000);
  }

  const avgRating = ratings?.length
    ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10
    : null;

  if (productLoading) {
    return (
      <div className="pt-32 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: "hsl(var(--primary) / 0.2)" }} />
          <p className="text-sm text-muted-foreground/40">{isAr ? "جارٍ التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 text-center text-muted-foreground">
        <p>{isAr ? "المنتج غير موجود" : "Product not found"}</p>
        <Link href="/" className="btn-outline mt-4 inline-flex" style={{ padding: "0.5rem 1.25rem", fontSize: "0.7rem" }}>
          {isAr ? "العودة" : "Go back"}
        </Link>
      </div>
    );
  }

  const name     = isAr ? product.nameAr     : product.name;
  const desc     = isAr ? product.descAr     : product.desc;
  const timeline = isAr ? product.timelineAr : product.timeline;
  const items    = isAr ? product.includesAr : product.includes;

  function handleAddToBasket() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product!.id,
        name: product!.name,
        nameAr: product!.nameAr,
        price: product!.price,
        accent: product!.accent,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
    <main className="pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-xs text-muted-foreground/40">
          <Link href="/" className="hover:text-muted-foreground transition-colors">
            {isAr ? "المنتجات" : "Products"}
          </Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={isAr ? "M15.75 19.5L8.25 12l7.5-7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
          </svg>
          <span className="text-muted-foreground/70">{name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: Product visual */}
          <div className="sticky top-24">
            {/* Main image */}
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{ paddingBottom: "80%", background: product.gradient, border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `radial-gradient(${product.accentBright} 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                style={{ background: `radial-gradient(ellipse, ${product.accent}40, transparent 70%)`, filter: "blur(50px)" }}
              />

              {/* Browser mockup */}
              <div className="absolute inset-x-8 top-8 bottom-8 rounded-xl overflow-hidden"
                style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(6px)" }}>
                {/* Bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  <div className="flex-1 mx-2 h-4 rounded bg-white/[0.06] flex items-center px-2">
                    <span className="text-[7px] text-white/20 font-mono">mystore.example.com</span>
                  </div>
                </div>
                {/* Store content */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-6 rounded-lg" style={{ background: `${product.accent}20`, border: `1px solid ${product.accent}15` }}>
                    <div className="flex items-center justify-between h-full px-3 gap-2">
                      <div className="h-2 w-8 rounded" style={{ background: product.accent + "70" }} />
                      <div className="flex gap-2">{[1,2,3].map(i=><div key={i} className="h-1.5 w-5 rounded bg-white/10"/>)}</div>
                      <div className="h-2 w-10 rounded" style={{ background: product.accent + "50" }} />
                    </div>
                  </div>
                  <div className="h-20 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${product.accent}35, ${product.accent}15)`, border: `1px solid ${product.accent}20` }}>
                    <div className="text-center">
                      <div className="h-2.5 w-24 rounded mx-auto mb-2" style={{ background: product.accentBright + "90" }} />
                      <div className="h-1.5 w-16 rounded mx-auto mb-3" style={{ background: product.accent + "60" }} />
                      <div className="h-5 w-16 mx-auto rounded-lg" style={{ background: product.accent + "80" }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3].map(i=>(
                      <div key={i} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="h-10" style={{ background: `${product.accent}${25+i*8}` }} />
                        <div className="p-1.5">
                          <div className="h-1.5 w-full rounded bg-white/10 mb-1" />
                          <div className="h-1.5 w-2/3 rounded" style={{ background: product.accent + "50" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ background: `${product.accent}25`, border: `1px solid ${product.accentBright}35`, color: product.accentBright, backdropFilter: "blur(8px)" }}
              >
                {isAr ? product.tagAr : product.tag}
              </div>
            </div>

            {/* Live Demo button — only shown when a URL is set */}
            {product.demoUrl && (
              <button
                onClick={() => setShowDemo(true)}
                className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-semibold uppercase tracking-widest transition-all duration-200 border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.09)",
                  color: "var(--silver, #b8bac8)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${product.accent}50`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isAr ? "معاينة مباشرة — جرّب قبل الشراء" : "Live Demo — Try Before You Buy"}
              </button>
            )}
          </div>

          {/* Right: Info + purchase */}
          <div>
            {/* Name */}
            <h1
              className="font-bold text-foreground mb-3"
              style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "-0.035em" }}
            >
              {name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${product.accent}18`, border: `1px solid ${product.accent}35`, color: product.accentBright }}
              >
                {isAr ? product.tagAr : product.tag}
              </span>
              <span className="text-xs text-muted-foreground/40 font-mono">
                ⏱ {timeline}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">{desc}</p>

            {/* Price display */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-bold"
                  style={{
                    fontSize: "clamp(2rem,4vw,3rem)",
                    letterSpacing: "-0.04em",
                    background: `linear-gradient(135deg, ${product.accentBright}, ${product.accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  SAR {(product.price * qty).toLocaleString()}
                </span>
                {qty > 1 && (
                  <span className="text-sm text-muted-foreground/40">
                    ({qty} × SAR {product.price.toLocaleString()})
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/35 mt-1">
                {isAr ? "سعر ثابت · مرة واحدة" : "Fixed price · One-time payment"}
              </p>
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-widest font-semibold mb-3">
                {isAr ? "عدد الرخص" : "Number of licenses"}
              </p>
              <div className="inline-flex items-center rounded-xl border border-white/[0.09] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all text-xl font-light border-r border-white/[0.06]"
                >
                  −
                </button>
                <div className="w-16 h-12 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.04em" }}>{qty}</span>
                </div>
                <button
                  onClick={() => setQty(q => Math.min(10, q + 1))}
                  className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all text-xl font-light border-l border-white/[0.06]"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA: Add to Basket */}
            <button
              onClick={handleAddToBasket}
              className="w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3 mb-3"
              style={{
                background: added
                  ? "hsl(142 70% 40%)"
                  : `linear-gradient(135deg, ${product.accent}, ${product.accentBright}80, ${product.accent})`,
                backgroundSize: added ? undefined : "200% 100%",
                color: "#fff",
                boxShadow: added
                  ? "0 0 20px hsl(142 70% 40% / 0.30)"
                  : `0 0 30px ${product.accent}50, 0 4px 20px ${product.accent}30`,
                border: "none",
              }}
            >
              {added ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {isAr ? "تمت الإضافة!" : "Added to Basket!"}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  {isAr ? "أضف إلى السلة" : "Add to Basket"}
                </>
              )}
            </button>

            {/* Or place order directly */}
            <Link
              href="/build"
              className="w-full rounded-xl py-3.5 text-sm font-semibold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 border border-white/[0.09] text-muted-foreground hover:text-foreground hover:border-white/[0.16]"
              style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)", letterSpacing: "0.06em" }}
            >
              {isAr ? "اطلب مباشرة" : "Place Order Directly"}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {/* Trust line */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground/30">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              {isAr ? "عقد موقّع قبل بدء أي عمل. لا تُحفظ بيانات الدفع." : "Signed contract before work starts. No payment data stored."}
            </div>

            {/* Includes */}
            <div className="mt-10 rounded-2xl border border-white/[0.06] p-6" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)" }}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4">
                {isAr ? "ما يشمله المنتج" : "What's included"}
              </p>
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground/70">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${product.accent}20`, border: `1px solid ${product.accent}40` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: product.accentBright }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* As-Is clause */}
            <p className="mt-6 text-[10px] text-muted-foreground/25 leading-relaxed font-mono">
              <span className="text-muted-foreground/40 font-semibold">§ As-Is —</span>{" "}
              {isAr
                ? "تُسلَّم جميع المشاريع كما هي. أي تعديل بعد التسليم يستلزم تذكرة تعديل."
                : "All projects are delivered as-is. Post-delivery changes require a Revision Ticket."
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── Ratings section — Amazon-style ─────────────────── */}
      {ratingsEnabled && (
        <div className="max-w-6xl mx-auto px-5 pb-16">
          <div className="border-t border-white/[0.05] pt-12">

            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-foreground" style={{ fontSize: "clamp(1.1rem,2vw,1.4rem)", letterSpacing: "-0.025em" }}>
                {isAr ? "تقييمات العملاء" : "Customer Reviews"}
              </h2>
              <button
                onClick={() => setShowReviewForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                style={{
                  background: showReviewForm ? `${product.accent}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${showReviewForm ? product.accent + "50" : "rgba(255,255,255,0.09)"}`,
                  color: showReviewForm ? product.accentBright : "rgba(255,255,255,0.6)",
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isAr ? "اكتب تقييماً" : "Write a Review"}
              </button>
            </div>

            {/* Rating overview + breakdown */}
            {ratings && ratings.length > 0 && avgRating && (
              <div
                className="rounded-2xl border border-white/[0.06] p-6 mb-8 flex flex-col sm:flex-row gap-8 items-start"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                {/* Big score */}
                <div className="flex flex-col items-center justify-center gap-2 shrink-0 min-w-[110px]">
                  <span
                    className="font-black leading-none"
                    style={{ fontSize: "3.5rem", letterSpacing: "-0.06em", color: product.accentBright }}
                  >{avgRating}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className="w-4 h-4" viewBox="0 0 20 20" fill={s <= Math.round(avgRating) ? product.accentBright : "rgba(255,255,255,0.1)"}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 text-center">
                    {isAr ? `${ratings.length} تقييم` : `${ratings.length} review${ratings.length !== 1 ? "s" : ""}`}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px self-stretch" style={{ background: "rgba(255,255,255,0.06)" }} />

                {/* Star breakdown bars */}
                <div className="flex-1 space-y-2 w-full">
                  {[5,4,3,2,1].map(star => {
                    const count = ratings.filter(r => r.rating === star).length;
                    const pct = ratings.length ? (count / ratings.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-10 shrink-0">
                          <span className="text-xs text-muted-foreground/60 font-mono">{star}</span>
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill={product.accentBright}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${product.accent}, ${product.accentBright})` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground/40 font-mono w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Write a review — inline form */}
            {showReviewForm && (
              <div
                className="rounded-2xl border p-6 mb-8 transition-all"
                style={{ background: `${product.accent}08`, borderColor: `${product.accent}30` }}
              >
                <h3 className="text-sm font-bold text-foreground mb-5">
                  {isAr ? "شارك تجربتك" : "Share Your Experience"}
                </h3>

                {ratingSubmitted ? (
                  <div className="text-center py-8">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: `${product.accent}20`, border: `1px solid ${product.accent}40` }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke={product.accentBright} strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-base font-bold text-foreground mb-1">{isAr ? "شكراً! تم إرسال تقييمك." : "Thank you! Review submitted."}</p>
                    <p className="text-xs text-muted-foreground/50">{isAr ? "تقييمك يساعد الآخرين في اتخاذ قرارهم." : "Your review helps others make the right choice."}</p>
                    <button
                      onClick={() => { setShowReviewForm(false); setRatingSubmitted(false); }}
                      className="mt-4 text-xs font-semibold underline underline-offset-2"
                      style={{ color: product.accentBright }}
                    >
                      {isAr ? "إغلاق" : "Close"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitRating} className="space-y-5">
                    {/* Star picker */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">
                        {isAr ? "تقييمك *" : "Your Rating *"}
                      </p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingVal(star)}
                            onMouseEnter={() => setRatingHover(star)}
                            onMouseLeave={() => setRatingHover(0)}
                            className="transition-transform hover:scale-125 active:scale-95"
                          >
                            <svg
                              className="w-9 h-9 transition-all duration-100 drop-shadow-lg"
                              viewBox="0 0 20 20"
                              fill={star <= (ratingHover || ratingVal) ? product.accentBright : "rgba(255,255,255,0.1)"}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        {ratingVal > 0 && (
                          <span className="self-center text-sm font-bold ml-1" style={{ color: product.accentBright }}>
                            {["", isAr ? "ضعيف" : "Poor", isAr ? "مقبول" : "Fair", isAr ? "جيد" : "Good", isAr ? "جيد جداً" : "Very Good", isAr ? "ممتاز" : "Excellent"][ratingVal]}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                          {isAr ? "اسمك *" : "Your Name *"}
                        </label>
                        <input
                          type="text"
                          value={ratingName}
                          onChange={e => setRatingName(e.target.value)}
                          placeholder={isAr ? "مثال: سارة العمري" : "e.g. Sarah Al-Omari"}
                          className="w-full rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/40 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                          {isAr ? "الباقة المستخدمة" : "Package Used"}
                        </label>
                        <input
                          type="text"
                          value={isAr ? product.nameAr : product.name}
                          readOnly
                          className="w-full rounded-xl border border-white/[0.05] px-3.5 py-2.5 text-sm bg-transparent text-muted-foreground/40 cursor-default"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1.5">
                        {isAr ? "تجربتك" : "Your Experience"}
                      </label>
                      <textarea
                        value={ratingComment}
                        onChange={e => setRatingComment(e.target.value)}
                        placeholder={isAr ? "ما الذي أعجبك في الخدمة؟ شارك تفاصيل تجربتك..." : "What did you love about the service? Share your story..."}
                        rows={4}
                        className="w-full rounded-xl border border-white/[0.09] px-3.5 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/40 transition-colors resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={!ratingVal || !ratingName.trim() || createRating.isPending}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                        style={{ background: `linear-gradient(135deg, ${product.accent}, ${product.accentBright})`, color: "#fff" }}
                      >
                        {createRating.isPending ? (isAr ? "جاري الإرسال..." : "Submitting…") : (isAr ? "إرسال التقييم" : "Submit Review")}
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Reviews list */}
            {!ratings?.length ? (
              <div
                className="rounded-2xl border border-white/[0.06] p-12 text-center"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <svg className="w-6 h-6 text-primary/50" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-foreground/60 mb-1">{isAr ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
                <p className="text-xs text-muted-foreground/40 mb-5">{isAr ? "كن أول من يشارك تجربته مع هذه الباقة." : "Be the first to share your experience with this package."}</p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-xl transition-all"
                  style={{ background: `${product.accent}15`, border: `1px solid ${product.accent}30`, color: product.accentBright }}
                >
                  {isAr ? "اكتب أول تقييم" : "Write the First Review"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ratings.map(r => {
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(r.createdAt).getTime();
                    const days = Math.floor(diff / 86400000);
                    if (days < 1) return isAr ? "اليوم" : "Today";
                    if (days < 7) return isAr ? `منذ ${days} أيام` : `${days}d ago`;
                    const weeks = Math.floor(days / 7);
                    if (weeks < 5) return isAr ? `منذ ${weeks} أسابيع` : `${weeks}w ago`;
                    return new Date(r.createdAt).toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", year: "numeric" });
                  })();

                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-white/[0.06] p-5 transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = `${product.accent}25`)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                    >
                      {/* Top row */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 select-none"
                          style={{ background: `${product.accent}25`, color: product.accentBright, border: `1px solid ${product.accent}30` }}
                        >
                          {r.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                            <span className="text-sm font-bold text-foreground">{r.authorName}</span>
                            {/* Verified badge */}
                            <span
                              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(16,185,129,0.1)", color: "rgb(52,211,153)", border: "1px solid rgba(16,185,129,0.2)" }}
                            >
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {isAr ? "عميل معتمد" : "Verified Client"}
                            </span>
                          </div>
                          {/* Stars + time */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <svg key={s} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={s <= r.rating ? product.accentBright : "rgba(255,255,255,0.1)"}>
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground/35 font-mono">{timeAgo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      {r.comment && (
                        <p
                          className="text-sm text-foreground/75 leading-relaxed pl-13"
                          style={{ paddingLeft: "3.25rem", direction: /[\u0600-\u06FF]/.test(r.comment) ? "rtl" : "ltr" }}
                        >
                          {r.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Mobile sticky bar ──────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.08] px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(6,5,10,0.96)", backdropFilter: "blur(24px)" }}
      >
        {/* Compact qty */}
        <div className="flex items-center rounded-xl border border-white/[0.09] overflow-hidden shrink-0">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground text-lg font-light border-r border-white/[0.06]"
          >−</button>
          <span className="w-8 text-center text-sm font-bold text-foreground">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(10, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground text-lg font-light border-l border-white/[0.06]"
          >+</button>
        </div>

        {/* Price + Add to basket */}
        <button
          onClick={handleAddToBasket}
          className="flex-1 rounded-xl py-3 text-sm font-bold uppercase tracking-widest flex items-center justify-between px-4 transition-all duration-200"
          style={{
            background: added ? "hsl(142 70% 40%)" : `linear-gradient(135deg, ${product.accent}, ${product.accentBright}80, ${product.accent})`,
            color: "#fff",
            boxShadow: added ? "0 0 20px hsl(142 70% 40% / 0.30)" : `0 0 20px ${product.accent}50`,
            border: "none",
          }}
        >
          <span>{added ? (isAr ? "تمت الإضافة ✓" : "Added ✓") : (isAr ? "أضف للسلة" : "Add to Basket")}</span>
          <span className="text-xs font-mono opacity-80">SAR {(product.price * qty).toLocaleString()}</span>
        </button>
      </div>
      {/* Bottom padding so content isn't hidden behind sticky bar on mobile */}
      <div className="md:hidden h-20" />
    </main>

    {/* Demo Modal */}
    {showDemo && product.demoUrl && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
        onClick={() => setShowDemo(false)}
      >
        <div
          className="relative w-full rounded-2xl overflow-hidden border"
          style={{
            maxWidth: "1100px",
            height: "80vh",
            background: "hsl(252 28% 5%)",
            borderColor: "rgba(201,168,76,0.25)",
            boxShadow: "0 0 80px rgba(201,168,76,0.15)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-[10px] font-mono text-muted-foreground/40 truncate max-w-[300px]">{product.demoUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
                style={{ background: "rgba(201,168,76,0.15)", color: "rgba(201,168,76,0.9)", border: "1px solid rgba(201,168,76,0.25)" }}
              >
                {isAr ? "فتح في تبويب" : "Open in Tab"}
              </a>
              <button
                onClick={() => setShowDemo(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* iframe */}
          <iframe
            src={product.demoUrl}
            className="w-full"
            style={{ height: "calc(80vh - 48px)", border: "none" }}
            title="Live Demo"
            allow="fullscreen"
          />
        </div>
      </div>
    )}
    </>
  );
}
