import en from './en.json';
import ja from './ja.json';

export type Locale = 'en' | 'ja';

const dictionaries = { en, ja } as const;

export type TranslationKey = keyof typeof en;

export function t(locale: Locale, key: TranslationKey): string {
  const dict = dictionaries[locale] as Record<string, string>;
  return dict[key] ?? (dictionaries.en as Record<string, string>)[key] ?? key;
}

export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean === '/' ? '/' : clean}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ja' : 'en';
}
