import type { ExerciseLanguageId } from '../schema';

// Data contract between the exercise domain and the course item pages (editor and player).
export interface ExerciseTestCase {
  stdin: string;
  expectedStdout: string;
}

export interface ExerciseEditorData {
  language: ExerciseLanguageId;
  promptMd: string;
  starterCode: string;
  timeLimitMs: number;
  tests: ExerciseTestCase[];
}

// Tests are visible to the browser by design: grading is client-side practice grade.
export interface ExercisePlayerData extends ExerciseEditorData {
  lastSubmission: { sourceCode: string } | null;
}
