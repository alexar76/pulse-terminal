export type Locale = 'en' | 'ru' | 'es' | 'fr' | 'zh';

export const LOCALES: Locale[] = ['en', 'ru', 'es', 'fr', 'zh'];

export type MessageTree = {
  [key: string]: string | MessageTree;
};

export type LocaleMessages = MessageTree;
