import { gradeQuestion } from './grade-question';
import type { QuestionSpec } from './question-types';

export interface GradableQuestion {
  id: string;
  points: number;
  spec: QuestionSpec;
}

export interface QuizGrade {
  earnedPoints: number;
  totalPoints: number;
  scorePercent: number;
  passed: boolean;
  detail: { questionId: string; correct: boolean; earned: number }[];
}

export function gradeQuiz(
  questions: GradableQuestion[],
  answers: Record<string, unknown>,
  passPercent: number
): QuizGrade {
  const totalPoints = questions.reduce((total, question) => total + question.points, 0);
  const detail = questions.map((question) => {
    const correct = gradeQuestion(question.spec, answers[question.id]);
    return { questionId: question.id, correct, earned: correct ? question.points : 0 };
  });
  const earnedPoints = detail.reduce((total, entry) => total + entry.earned, 0);
  const scorePercent = totalPoints === 0 ? 0 : Math.round((100 * earnedPoints) / totalPoints);
  return {
    earnedPoints,
    totalPoints,
    scorePercent,
    passed: totalPoints > 0 && scorePercent >= passPercent,
    detail
  };
}
