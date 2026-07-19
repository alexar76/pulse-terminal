export type Locale = 'en' | 'ru' | 'es';

export const LOCALES: Locale[] = ['en', 'ru', 'es'];

export type MessageTree = {
  [key: string]: string | MessageTree;
};

export type LocaleMessages = MessageTree;
