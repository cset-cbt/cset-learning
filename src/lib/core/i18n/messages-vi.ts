import { adminVi } from '../../features/admin/i18n-vi';
import { coursesVi } from '../../features/courses/i18n-vi';
import { exercisesVi } from '../../features/exercises/i18n-vi';
import { lessonsVi } from '../../features/lessons/i18n-vi';
import { quizzesVi } from '../../features/quizzes/i18n-vi';
import { coreVi } from './core-vi';

// Vietnamese is the source of truth: every key must also exist in messages-en.ts.
export const messagesVi = {
  ...coreVi,
  ...coursesVi,
  ...lessonsVi,
  ...quizzesVi,
  ...exercisesVi,
  ...adminVi
};

export type MessageKey = keyof typeof messagesVi;
