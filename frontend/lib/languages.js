// Keep in sync with backend/src/constants/languages.js
export const LANGUAGES = {
  en: { name: 'English', native: 'English', speech: 'en-US' },
  es: { name: 'Spanish', native: 'Español', speech: 'es-ES' },
  fr: { name: 'French', native: 'Français', speech: 'fr-FR' },
  de: { name: 'German', native: 'Deutsch', speech: 'de-DE' },
  pt: { name: 'Portuguese', native: 'Português', speech: 'pt-BR' },
  hi: { name: 'Hindi', native: 'हिन्दी', speech: 'hi-IN' },
  ur: { name: 'Urdu', native: 'اردو', speech: 'ur-PK', rtl: true },
  ar: { name: 'Arabic', native: 'العربية', speech: 'ar-SA', rtl: true },
  zh: { name: 'Mandarin', native: '中文', speech: 'zh-CN' },
  tl: { name: 'Tagalog', native: 'Tagalog', speech: 'fil-PH' },
  vi: { name: 'Vietnamese', native: 'Tiếng Việt', speech: 'vi-VN' },
};

export const LANGUAGE_OPTIONS = Object.entries(LANGUAGES).map(([code, l]) => ({
  code,
  label: l.name === l.native ? l.name : `${l.name} · ${l.native}`,
}));

export const langName = (code) => LANGUAGES[code]?.name ?? code;
export const langNative = (code) => LANGUAGES[code]?.native ?? code;
export const speechTag = (code) => LANGUAGES[code]?.speech ?? code;
export const isRtl = (code) => Boolean(LANGUAGES[code]?.rtl);
