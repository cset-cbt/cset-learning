import type { ExerciseLanguageId } from '../schema';

export const EXERCISE_LANGUAGES = ['python', 'cpp', 'java'] as const satisfies readonly ExerciseLanguageId[];
export type ExerciseLanguage = (typeof EXERCISE_LANGUAGES)[number];

export const LANGUAGE_INFO: Record<
  ExerciseLanguage,
  {
    label: string;
    fileName: string;
    editorLanguage: ExerciseLanguage;
    downloadMb: number;
    starter: string;
  }
> = {
  python: {
    label: 'Python 3.14',
    fileName: 'main.py',
    editorLanguage: 'python',
    downloadMb: 13,
    starter: '# Read input with input() and print the answer with print()\n'
  },
  cpp: {
    label: 'C++20',
    fileName: 'main.cpp',
    editorLanguage: 'cpp',
    downloadMb: 29,
    starter: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n'
  },
  java: {
    label: 'Java 23',
    fileName: 'Main.java',
    editorLanguage: 'java',
    downloadMb: 31,
    starter: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}\n'
  }
};

export function isExerciseLanguage(value: string): value is ExerciseLanguage {
  return (EXERCISE_LANGUAGES as readonly string[]).includes(value);
}
