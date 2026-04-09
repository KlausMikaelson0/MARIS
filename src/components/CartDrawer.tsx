import { useEffect } from "react";
import { Link } from "wouter";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count } = useCart();
  const { lang } = useLang();
  const isAr = lang === "ar";

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[90] transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 bottom-0 z-[100] w-full sm:w-[400px] flex flex-col"
        style={{
          right: isAr ? "auto" : 0,
          left: isAr ? 0 : "auto",
          background: "hsl(252 22% 5%)",
          borderLeft: isAr ? "none" : "1px solid rgba(255,255,255,0.07)",
          borderRight: isAr ? "1px solid rgba(255,255,255,0.07)" : "none",
          transform: isOpen ? "translateX(0)" : isAr ? "translateX(-100%)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="font-bold text-foreground text-base" style={{ letterSpacing: "-0.02em" }}>
              {isAr ? "السلة" : "Your Basket"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {count > 0
                ? isAr ? `${count} ${count === 1 ? "منتج" : "منتجات"}` : `${count} item${count !== 1 ? "s" : ""}`
                : isAr ? "فارغة" : "Empty"}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <svg className="w-6 h-6 text-muted-foreground/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isAr ? "السلة فارغة" : "Your basket is empty"}</p>
                <p className="text-xs text-muted-foreground/40 mt-1">{isAr ? "أضف منتجاً للبدء" : "Add a package to get started"}</p>
              </div>
              <button onClick={closeCart} className="btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.7rem" }}>
                {isAr ? "تصفح المنتجات" : "Browse packages"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="rounded-xl p-4 border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Visual dot */}
                    <div
                      className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ background: `${item.accent}22`, border: `1px solid ${item.accent}40` }}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: item.accent }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate" style={{ letterSpacing: "-0.015em" }}>
                        {isAr ? item.nameAr : item.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        SAR {item.price.toLocaleString()} {isAr ? "/ رخصة" : "/ license"}
                      </p>
                    </div>

                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground/30 hover:text-red-400 transition-colors mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Qty + line total */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/[0.16] transition-all text-sm font-bold"
                      >−</button>
                      <span className="w-6 text-center text-sm font-bold text-foreground">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/[0.16] transition-all text-sm font-bold"
                      >+</button>
                    </div>
                    <span className="text-sm font-bold text-foreground" style={{ letterSpacing: "-0.03em" }}>
                      SAR {(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{isAr ? "المجموع" : "Total"}</span>
              <span
                className="text-xl font-bold"
                style={{
                  letterSpacing: "-0.04em",
                  background: "linear-gradient(135deg, #c07af5, #9d5cdb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                SAR {total.toLocaleString()}
              </span>
            </div>
            <Link
              href="/build"
              onClick={closeCart}
              className="btn-primary w-full justify-center"
              style={{ padding: "0.85rem", fontSize: "0.75rem" }}
            >
              {isAr ? "متابعة الطلب" : "Proceed to Order"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <p className="text-[10px] text-muted-foreground/30 text-center mt-3 leading-relaxed">
              {isAr ? "سيتم التواصل معك قبل أي إجراء. لا تُحفظ بيانات الدفع." : "We'll contact you before anything starts. No payment stored here."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
