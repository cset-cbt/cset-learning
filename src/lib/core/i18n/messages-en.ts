import { adminEn } from '../../features/admin/i18n-en';
import { coursesEn } from '../../features/courses/i18n-en';
import { exercisesEn } from '../../features/exercises/i18n-en';
import { lessonsEn } from '../../features/lessons/i18n-en';
import { quizzesEn } from '../../features/quizzes/i18n-en';
import { coreEn } from './core-en';
import type { MessageKey } from './messages-vi';

// Typed against the Vietnamese keys, so a missing English translation fails `bun run check`.
export const messagesEn: Record<MessageKey, string> = {
  ...coreEn,
  ...coursesEn,
  ...lessonsEn,
  ...quizzesEn,
  ...exercisesEn,
  ...adminEn
};
