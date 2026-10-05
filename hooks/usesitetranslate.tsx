"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  TRANSLATE_CONTAINER_ID,
  type LanguageCode,
  type LanguageOption,
} from "@/lib/languages";

const STORAGE_KEY = "mastertable:lang";
const SCRIPT_ID = "google-translate-script";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
    __gtPatched?: boolean;
  }
}

const isSupported = (code: string | null): code is LanguageCode =>
  !!code && LANGUAGES.some((l) => l.value === code);

function setCookie(lang: string) {
  const host = window.location.hostname;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";

  if (lang === DEFAULT_LANGUAGE) {
    document.cookie = `googtrans=; ${expire}; path=/`;
    document.cookie = `googtrans=; ${expire}; path=/; domain=${host}`;
    document.cookie = `googtrans=; ${expire}; path=/; domain=.${host}`;
  } else {
    const value = `/${DEFAULT_LANGUAGE}/${lang}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${host}`;
  }
}

function detectInitialLanguage(): LanguageCode {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isSupported(saved)) return saved;
  } catch {}
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return isSupported(browser) ? browser : DEFAULT_LANGUAGE;
}

/**
 * Google Translate rewrites text nodes, which can make React throw
 * "removeChild" / "insertBefore" errors. These guards prevent the crash.
 */
function patchDomForTranslate() {
  if (window.__gtPatched) return;
  window.__gtPatched = true;

  const origRemove = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) return child;
    return origRemove.call(this, child) as T;
  };

  const origInsert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    ref: Node | null,
  ): T {
    if (ref && ref.parentNode !== this) return newNode;
    return origInsert.call(this, newNode, ref) as T;
  };
}

export function useSiteTranslate() {
  const [currentLanguage, setCurrentLanguage] =
    useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    patchDomForTranslate();

    const lang = detectInitialLanguage();
    setCurrentLanguage(lang);
    setCookie(lang); // must be set BEFORE the script loads so it auto-translates
    document.documentElement.lang = lang;

    if (document.getElementById(SCRIPT_ID)) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: DEFAULT_LANGUAGE,
          includedLanguages: LANGUAGES.map((l) => l.value).join(","),
          autoDisplay: false,
        },
        TRANSLATE_CONTAINER_ID,
      );
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const changeLanguage = useCallback((code: string) => {
    if (!isSupported(code)) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {}

    setCookie(code);
    setCurrentLanguage(code);
    document.documentElement.lang = code;

    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");

    // Back to English, or widget not ready yet: reload is the only clean reset
    if (code === DEFAULT_LANGUAGE || !combo) {
      window.location.reload();
      return;
    }

    combo.value = code;
    combo.dispatchEvent(new Event("change"));
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    languages: LANGUAGES as unknown as LanguageOption[],
  };
}
