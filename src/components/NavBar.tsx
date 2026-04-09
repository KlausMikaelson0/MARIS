import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useUser, useClerk, Show } from "@clerk/react";

export default function NavBar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { accent, toggleAccent } = useTheme();
  const { lang, toggleLang } = useLang();
  const { count, openCart } = useCart();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const menuRef = useRef<HTMLDivElement>(null);

  const links = [
    { href: "/",      label: lang === "ar" ? "المنتجات" : "Products" },
    { href: "/vault", label: lang === "ar" ? "خزنة العميل" : "Client Vault" },
    { href: "/revision-tickets", label: lang === "ar" ? "التعديلات" : "Revisions" },
  ];

  useEffect(() => {
    function h(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06]"
      style={{ background: "var(--nav-bg)", backdropFilter: "blur(24px)" }}
    >
      {/* 1px gold trim at very top */}
      <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent 0%, rgba(201,168,76,0.55) 30%, rgba(201,168,76,0.55) 70%, transparent 100%)" }} />
      <div className="max-w-6xl mx-auto px-5 h-[63px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <img src="/maris-logo.jpg" alt="MARIS" className="w-9 h-9 rounded-lg object-cover object-center" />
          <span className="font-bold uppercase hidden sm:block"
            style={{
              background: "linear-gradient(160deg, #f0d88a 0%, #C9A84C 45%, #a07828 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.2em",
              fontSize: "0.8rem",
            }}>
            MARIS
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`relative px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 group/link ${
                location === l.href
                  ? ""
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={location === l.href ? { color: "hsl(var(--primary))" } : {}}>
              {l.label}
              {/* animated underline sweep */}
              <span className="absolute bottom-0 left-4 right-4 h-px transition-all duration-300 ease-out"
                style={{
                  background: "hsl(var(--primary))",
                  opacity: location === l.href ? 1 : 0,
                  transform: location === l.href ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                }} />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={toggleLang}
            className="h-7 px-2.5 rounded-md text-[11px] font-semibold border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/[0.14] transition-all">
            {lang === "en" ? "عربي" : "EN"}
          </button>

          {/* Cart */}
          <button onClick={openCart}
            className="relative w-8 h-8 rounded-md flex items-center justify-center border border-white/[0.08] text-muted-foreground hover:text-foreground hover:border-white/[0.14] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: "hsl(var(--primary))" }}>
                {count}
              </span>
            )}
          </button>

          <div className="hidden md:block w-px h-4 bg-white/[0.08] mx-1" />

          {/* Auth section — desktop */}
          {isLoaded && (
            <>
              <Show when="signed-out">
                <div className="hidden md:flex items-center gap-1.5">
                  <Link href="/sign-in"
                    className="h-8 px-3.5 rounded-lg text-[12px] font-semibold border border-white/[0.09] text-muted-foreground hover:text-foreground hover:border-white/[0.18] transition-all flex items-center">
                    {lang === "ar" ? "دخول" : "Sign in"}
                  </Link>
                  <Link href="/sign-up"
                    className="hidden md:inline-flex h-8 px-3.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90 items-center"
                    style={{ background: "hsl(var(--primary))", color: "white" }}>
                    {lang === "ar" ? "إنشاء حساب" : "Sign up"}
                  </Link>
                </div>
              </Show>

              <Show when="signed-in">
                {/* User avatar dropdown */}
                <div className="relative hidden md:block" ref={menuRef}>
                  <button onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 h-8 px-2 rounded-lg border border-white/[0.08] hover:border-white/[0.18] transition-all">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "hsl(var(--primary))" }}>
                        {(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase()}
                      </div>
                    )}
                    <span className="text-[12px] font-medium text-foreground/80 max-w-[90px] truncate hidden lg:block">
                      {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
                    </span>
                    <svg className={`w-3 h-3 text-muted-foreground/50 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-10 w-52 rounded-xl shadow-2xl overflow-hidden z-50"
                      style={{ background: "hsl(252 28% 6%)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-xs font-bold text-foreground truncate">
                          {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName ?? "Account"}
                        </p>
                        <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        <Link href="/vault" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04] transition-colors">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          {lang === "ar" ? "خزنة العميل" : "Client Vault"}
                        </Link>
                        <Link href="/revision-tickets" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04] transition-colors">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          {lang === "ar" ? "التعديلات" : "Revisions"}
                        </Link>
                        <div className="h-px bg-white/[0.06] my-1" />
                        <button onClick={() => { signOut({ redirectUrl: "/" }); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors text-left">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          {lang === "ar" ? "تسجيل الخروج" : "Sign out"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Show>
            </>
          )}

          <Link href="/build"
            className="hidden md:inline-flex btn-primary"
            style={{ padding: "0.5rem 1.25rem", fontSize: "0.7rem" }}>
            {lang === "ar" ? "ابدأ مشروعاً" : "Start a Project"}
          </Link>

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden w-7 h-7 flex items-center justify-center text-muted-foreground">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-16 inset-x-0 border-b border-border bg-card px-5 py-3 flex flex-col gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04]">
              {l.label}
            </Link>
          ))}

          {isLoaded && (
            <>
              <Show when="signed-out">
                <div className="flex gap-2 mt-2">
                  <Link href="/sign-in" onClick={() => setOpen(false)}
                    className="flex-1 h-10 flex items-center justify-center rounded-lg text-sm font-semibold border border-white/[0.09] text-muted-foreground hover:text-foreground transition-all">
                    {lang === "ar" ? "دخول" : "Sign in"}
                  </Link>
                  <Link href="/sign-up" onClick={() => setOpen(false)}
                    className="flex-1 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "hsl(var(--primary))", color: "white" }}>
                    {lang === "ar" ? "إنشاء حساب" : "Sign up"}
                  </Link>
                </div>
              </Show>
              <Show when="signed-in">
                <div className="mt-1 px-3 py-2 flex items-center gap-2.5 rounded-lg border border-white/[0.06]"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: "hsl(var(--primary))" }}>
                      {(user?.firstName?.[0] ?? "U").toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user?.firstName ?? "Account"}</p>
                    <p className="text-[10px] text-muted-foreground/50 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </div>
                  <button onClick={() => { signOut({ redirectUrl: "/" }); setOpen(false); }}
                    className="text-[11px] text-red-400/60 hover:text-red-400 transition-colors font-medium shrink-0">
                    {lang === "ar" ? "خروج" : "Sign out"}
                  </button>
                </div>
              </Show>
            </>
          )}

          <Link href="/build" onClick={() => setOpen(false)} className="btn-primary mt-2 justify-center">
            {lang === "ar" ? "ابدأ مشروعاً" : "Start a Project"}
          </Link>
        </div>
      )}
    </header>
  );
}
