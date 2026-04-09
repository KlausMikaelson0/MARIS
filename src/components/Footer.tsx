import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";

export default function Footer() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  return (
    <footer className="border-t border-white/[0.05] mt-8">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src="/maris-logo.jpg" alt="MARIS" className="w-8 h-8 rounded-lg object-cover" />
              <span
                className="text-sm font-bold"
                style={{
                  background: "linear-gradient(160deg, #e0e2ee 0%, #9a9caa 50%, #d8dae4 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  letterSpacing: "0.1em",
                }}
              >MARIS</span>
            </div>
            <p className="text-xs text-muted-foreground/40 leading-relaxed max-w-[200px]">
              {isAr ? "استوديو التجارة الإلكترونية المتميز في المملكة العربية السعودية — متاجر رقمية بعقد ثابت وسعر محدد." : "Premium e-commerce studio in Saudi Arabia. Fixed-scope stores, contract-first."}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 mb-1">
              {isAr ? "روابط" : "Links"}
            </p>
            {[
              { href: "/",                  label: isAr ? "المنتجات"    : "Products" },
              { href: "/build",             label: isAr ? "ابدأ مشروعاً" : "Start a Project" },
              { href: "/vault",             label: isAr ? "خزنة العميل"  : "Client Vault" },
              { href: "/revision-tickets",  label: isAr ? "التعديلات"   : "Revisions" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors w-fit">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/30 mb-1">
              {isAr ? "تواصل معنا" : "Contact"}
            </p>
            <a
              href="mailto:studiomaris@outlook.com"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-primary transition-colors"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              studiomaris@outlook.com
            </a>
            <p className="text-xs text-muted-foreground/30 mt-1">
              {isAr ? "المملكة العربية السعودية" : "Saudi Arabia"}
            </p>
          </div>
        </div>

        {/* Trust authority badges */}
        <div className="border-t border-white/[0.04] mt-8 pt-6 mb-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-center mb-4" style={{ color: "rgba(201,168,76,0.4)" }}>
            {isAr ? "معتمد لدى" : "Accredited By"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              {
                nameEn: "Ministry of Human Resources",
                nameAr: "وزارة الموارد البشرية",
                abbr: "MHRSD",
                color: "rgba(201,168,76,0.7)",
                bg: "rgba(201,168,76,0.08)",
                border: "rgba(201,168,76,0.2)",
                icon: (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                ),
              },
              {
                nameEn: "Monsha'at",
                nameAr: "منشآت",
                abbr: "Monsha'at",
                color: "rgba(201,168,76,0.75)",
                bg: "rgba(201,168,76,0.08)",
                border: "rgba(201,168,76,0.2)",
                icon: (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                ),
              },
              {
                nameEn: "Doroob Academy",
                nameAr: "أكاديمية دروب",
                abbr: "Doroob",
                color: "rgba(201,168,76,0.75)",
                bg: "rgba(201,168,76,0.08)",
                border: "rgba(201,168,76,0.2)",
                icon: (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
              },
            ].map(badge => (
              <div
                key={badge.abbr}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}
              >
                {badge.icon}
                <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                  {isAr ? badge.nameAr : badge.nameEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/[0.04] pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground/25">
            © {new Date().getFullYear()} MARIS Studio. {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/20">
            {isAr ? "§ جميع المشاريع تُسلَّم كما هي" : "§ All projects delivered as-is"}
          </p>
        </div>
      </div>
    </footer>
  );
}
