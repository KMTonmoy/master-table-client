export const DEFAULT_LANGUAGE = "en";
export const TRANSLATE_CONTAINER_ID = "google_translate_element";

export const LANGUAGES = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "bn", label: "বাংলা (Bangla)", flag: "🇧🇩" },
  { value: "ru", label: "Русский (Russian)", flag: "🇷🇺" },
  { value: "hi", label: "हिन्दी (Hindi)", flag: "🇮🇳" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["value"];

export type LanguageOption = {
  value: string;
  label: string;
  flag: string;
};
