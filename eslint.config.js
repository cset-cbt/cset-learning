import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';

export default [
  eslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: { parserOptions: { parser: tsParser } },
    rules: { 'no-undef': 'off', 'no-unused-vars': 'off' }
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: { 'no-undef': 'off', 'no-unused-vars': 'off' }
  },
  { files: ['**/*.d.ts'], rules: { 'no-unused-vars': 'off' } },
  {
    ignores: [
      '.svelte-kit/**',
      'build/**',
      '.wrangler/**',
      'drizzle/**',
      'static/**',
      'worker-configuration.d.ts'
    ]
  }
];
