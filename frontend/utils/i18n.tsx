"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import enMessages from "../messages/en.json";
import hiMessages from "../messages/hi.json";

export type Locale = "en" | "hi";

export type Messages = typeof enMessages;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  t: (path: string, fallback?: string) => string;
}

const messageRegistry: Record<Locale, Messages> = {
  en: enMessages,
  hi: hiMessages,
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("preferred_locale") as Locale;
      if (saved && (saved === "en" || saved === "hi")) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Fallback
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("preferred_locale", newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const messages = messageRegistry[locale] || messageRegistry.en;

  const t = (path: string, fallback: string = ""): string => {
    const keys = path.split(".");
    let current: any = messages;
    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return fallback || path;
      }
    }
    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback safe context if used outside of provider
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      messages: enMessages,
      t: (path: string, fallback: string = "") => {
        const keys = path.split(".");
        let current: any = enMessages;
        for (const k of keys) {
          if (current && typeof current === "object" && k in current) {
            current = current[k];
          } else {
            return fallback || path;
          }
        }
        return typeof current === "string" ? current : fallback || path;
      },
    };
  }
  return context;
}
