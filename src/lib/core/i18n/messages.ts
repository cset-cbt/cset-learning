import { messagesEn } from './messages-en';
import { messagesVi, type MessageKey } from './messages-vi';

export type Locale = 'vi' | 'en';
export type { MessageKey };

export const messages: Record<Locale, Record<MessageKey, string>> = {
  vi: messagesVi,
  en: messagesEn
};
