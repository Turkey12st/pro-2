import React, { createContext, useContext, useEffect, useState } from "react";
import i18n, { isRtlLanguage, LANGUAGE_STORAGE_KEY, SupportedLanguage } from "@/i18n/config";
import { useTranslation } from "react-i18next";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lng: SupportedLanguage) => void;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const [language, setLanguageState] = useState<SupportedLanguage>(
    (i18nInstance.language?.split("-")[0] as SupportedLanguage) || "ar"
  );

  const applyLanguage = (lng: SupportedLanguage) => {
    const rtl = isRtlLanguage(lng);
    document.documentElement.setAttribute("lang", lng);
    document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
  };

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  useEffect(() => {
    const handler = (lng: string) => {
      const short = (lng?.split("-")[0] as SupportedLanguage) || "ar";
      setLanguageState(short);
    };
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  const setLanguage = (lng: SupportedLanguage) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    i18n.changeLanguage(lng);
    setLanguageState(lng);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isRtl: isRtlLanguage(language) }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}