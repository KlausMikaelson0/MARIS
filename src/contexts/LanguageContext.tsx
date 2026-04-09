import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextValue {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggleLang: () => {},
  t: (k) => k,
  isRTL: false,
});

import { translations } from "@/translations";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem("maris-lang");
    if (stored === "ar" || stored === "en") return stored as Language;
    return "en";
  });

  const isRTL = lang === "ar";

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    localStorage.setItem("maris-lang", lang);
  }, [lang, isRTL]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  const t = (key: string): string => {
    const map = translations[lang] as Record<string, string>;
    return map?.[key] ?? translations["en"][key as keyof typeof translations["en"]] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
