import { normalizeAnswerText } from './normalize-text';
import { parseDecimal } from './parse-decimal';
import { answerSchemas, type QuestionSpec } from './question-types';

export function gradeQuestion(spec: QuestionSpec, answer: unknown): boolean {
  switch (spec.kind) {
    case 'single_choice': {
      const parsed = answerSchemas.single_choice.safeParse(answer);
      return parsed.success && parsed.data === spec.answerKey.correctOptionId;
    }
    case 'multiple_choice': {
      const parsed = answerSchemas.multiple_choice.safeParse(answer);
      if (!parsed.success) return false;
      const selected = new Set(parsed.data);
      const correct = new Set(spec.answerKey.correctOptionIds);
      return selected.size === correct.size && [...correct].every((id) => selected.has(id));
    }
    case 'true_false': {
      const parsed = answerSchemas.true_false.safeParse(answer);
      return parsed.success && parsed.data === spec.answerKey.correct;
    }
    case 'short_answer': {
      const parsed = answerSchemas.short_answer.safeParse(answer);
      if (!parsed.success) return false;
      const normalized = normalizeAnswerText(parsed.data, spec.answerKey.caseSensitive);
      return spec.answerKey.accepted.some(
        (value) => normalizeAnswerText(value, spec.answerKey.caseSensitive) === normalized
      );
    }
    case 'numeric': {
      const parsed = answerSchemas.numeric.safeParse(answer);
      if (!parsed.success) return false;
      const value = parseDecimal(parsed.data);
      return value !== null && Math.abs(value - spec.answerKey.value) <= spec.answerKey.tolerance + 1e-9;
    }
    case 'matching': {
      const parsed = answerSchemas.matching.safeParse(answer);
      if (!parsed.success) return false;
      return Object.entries(spec.answerKey.pairs).every(
        ([leftId, rightId]) => Object.hasOwn(parsed.data, leftId) && parsed.data[leftId] === rightId
      );
    }
  }
}
