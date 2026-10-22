# AGENTS.md - cset-learning (Online Learning Platform)

Strict operational directives for AI agents operating inside the `@cset/cset-learning` repository (`https://github.com/cset-cbt/cset-learning`).
---

## 1. Core Identity & Architectural Constraints

- **Repository Role**: Online learning platform for CSET: courses, theory lessons (Markdown + file attachments), quizzes (single choice, multiple choice, true/false, short answer, numeric, matching) and coding exercises (Python, C++, Java) that compile and run entirely in the learner's browser. It has its OWN accounts (email + password); it is NOT connected to CSET Auth SSO.
- **Tech Stack**:
  - Framework: SvelteKit 2 + Svelte 5 (Strict Runes Syntax: $props, $state, $derived, $effect, snippet). Do NOT upgrade to SvelteKit 3 (`cset-ui` peers on SvelteKit 2).
  - Svelte 5 Syntax Requirement: Strictly forbid legacy Svelte 4 syntax (`export let data`, `export let form`, `$$props`, `on:click`). All components must use Svelte 5 runes:
    - Page/Layout data: `let { data }: { data: PageData } = $props();`
    - Form actions: `let { data, form }: { data: PageData; form: ActionData } = $props();`
    - Component props: `let { value = $bindable(''), label, onclick }: Props = $props();`
    - Event handlers: `onclick`, `onkeydown`, `onsubmit` (never use `on:click` or other `on:*` legacy directives).
  - Auth: Better Auth (`better-auth`) with email + password and the `admin` plugin, rate limiting stored in D1. Sign-in, sign-up and change-password go through the browser `authClient` so the HTTP rate limiter applies.
  - Styling: Tailwind CSS v4 + `cset-ui` design tokens (`styles.css`)
  - Target Platform: Cloudflare Workers (`@sveltejs/adapter-cloudflare`), Workers Free plan: 10 ms CPU per request. Keep every request cheap; heavy work (Markdown rendering, code execution) happens in the browser.
  - Database: Cloudflare D1 (`cset-learning-db`), managed through Drizzle SQLite ORM
  - Object storage: Cloudflare R2 (`cset-learning-files`) for lesson attachments
  - Code execution: client-side only (Pyodide, clang-wasm, TraceJVM) inside a sandboxed iframe or Worker. No server-side code execution.
  - Typography: Self-hosted Geist Sans, Geist Mono, Geist Pixel (bundled by `cset-ui`)
  - Package Manager: `bun` (strictly use `bun`, `bun run build`, `bun run check`, `bun run test`)
  - License: AGPL-3.0-only (required by the bundled TraceJVM runtime). Keep `LICENSE`, the `/legal` page and the footer source link in sync with the bundled components.

---

## 2. UI & Design System Enforcement (STRICT `cset-ui`)

> **MANDATORY POLICY**: ALL interactive surfaces, layouts, form inputs, dialogs, and controls MUST use `cset-ui`.

### 2.1 Component Usage Rule
- Always import UI primitives directly from `cset-ui`:
  ```svelte
  import {
    Button,
    Card,
    PageHeader,
    Badge,
    Logo,
    ThemeToggle,
    LocaleToggle,
    InputField,
    Select,
    Dialog,
    ConfirmDialog,
    Tabs,
    Toaster,
    toast
  } from 'cset-ui';
  ```
- **Inputs & Selects**: Use `<InputField />` and `<Select />` instead of raw HTML `<input>` or `<select>` tags to ensure uniform sizing, floating focus rings, and proper theme adaptation. `InputField` does not support `bind:value`; read values through `name` + `FormData` or an `oninput` handler.
- **Strictly NO EMOJIS (CRITICAL)**: NEVER use emoji characters in code, markup, buttons, tabs, empty states, or UI components under any circumstances. Emojis look amateurish and break professional developer tool aesthetics. Always use custom vector SVG icons or clean minimalist monospace typography. `scripts/check-rules.ts` enforces this on `src/`.
- **Sizing & Spacing: Use `rem` / `em` Instead of Hardcoded `px`**: Always prefer responsive `rem` units (or Tailwind spacing scales based on `rem`) over hardcoded pixel (`px`) values for font sizes, margins, paddings, line heights, and container dimensions. The only allowed exceptions for `px` are 1px / 2px structural hairline borders (`border: 1px solid ...`), hair dividers, or micro-ticks.
- **Standard Hyphen/Dash Rule (NO EM DASH)**: NEVER use em dash or en dash characters in documentation, code, comments, copy, or commit messages. Always use the standard keyboard dash/hyphen ("-").

### 2.2 Missing Component Protocol
If a required component does not exist in `cset-ui` (known gaps: `CodeEditor`, `MarkdownContent`, `ProgressBar`):
1. **DO NOT** create ad-hoc local UI libraries or inline raw unstyled elements.
2. **Alert Admin & Maintainer**: Log the requirement in your session report:
   ```markdown
   [MISSING COMPONENT ALERT]
   Component: <Name> (e.g. CodeEditor)
   Location Required: cset-learning/src/lib/features/<domain>/components/<name>.svelte
   Context: <Describe the user flow requiring this component>
   Fallback: <State how standard cset-ui primitives will be composed as an interim solution>
   ```
3. Use composition of existing `cset-ui` primitives (`Card`, `Button`, `Badge`, `InputField`) plus a feature-local component.

---

## 3. Internationalization (i18n) Mandate

- Every piece of user-facing text across all routes and layouts **MUST** be localized through `$lib/core/i18n`.
- **Zero Hardcoded Strings**: Hardcoded Vietnamese or English strings in markup or scripts are strictly rejected.
- When introducing or altering text:
  1. Add the key to the owning domain file `src/lib/features/<domain>/i18n-vi.ts` (Vietnamese, source of truth) or `src/lib/core/i18n/core-vi.ts`.
  2. Add the same key to the matching `i18n-en.ts` / `core-en.ts` (typed `Record<keyof typeof vi, string>`, so a missing key fails `bun run check`).
  3. Reference it in Svelte via `{$t('your.key')}`.
  4. Ensure date/time formatting respects the reactive `$locale` (`vi-VN` vs `en-US`).

---

## 4. Data Integrity & Layered Architecture

- **Feature-driven layout**: shared platform code lives in `src/lib/core/` (db, auth, policy, i18n, shell). Domains live in `src/lib/features/<domain>/` with `schema.ts`, `server/` (services and page helpers), `shared/` (pure code usable in the browser and in tests), `components/`, and `i18n-vi.ts` / `i18n-en.ts`.
- **Strict Layered Pattern**:
  - Database Schema: `src/lib/core/db/*.ts` and `src/lib/features/<domain>/schema.ts`
  - Service Layer: `src/lib/features/<domain>/server/*-service.ts` (encapsulate all business logic and D1 queries)
  - Endpoints / Actions: `+page.server.ts` or `+server.ts` (validate with zod `.strict()`, call the service, return JSON/form result)
  - Presentation: `+page.svelte` and feature components (pure UI rendering using `cset-ui`)
- **Authorization**: enforce role and ownership on the server for every load and every action (`requireUser`, `requireStaff`, `requireAdmin`, `resolveManagedItem`, `resolveLearnerItem`). A non-owner gets `404`, never a distinguishing `403`. Never trust client-supplied ids or flags.
- **Quiz secrecy**: quiz answer keys and explanations NEVER leave the server before a quiz attempt is submitted.
- **Practice-grade execution**: code execution is client-side and practice grade only. The server derives pass/fail from the reported outputs; never use it for certification or exams.
- **No Mock Data in Production**: All data must persist in Cloudflare D1 / R2.
- **No raw HTML**: render user Markdown only through `renderMarkdown` (markdown-it with `html: false` + DOMPurify). `{@html}` is allowed only for that sanitized output.

---

## 5. Code Quality & Clean Architecture Standards

- **200-Line File Limit**: No code file should exceed 200 lines. Split modals, filters, and list views into dedicated files under `src/lib/features/<domain>/components/`.
- **Kebab-Case Naming**: All files and directories must use kebab-case (`outline-section.svelte`, `quiz-attempt-service.ts`).
- **TypeScript Strictness**: Explicit types for all database models, form states, and action results. No explicit `any`.
- **Comments**:
  - Add explanatory comments for complex business invariants (e.g. ownership rules, D1 timestamp handling, sandbox boundaries).
  - Ban temporary developer tags (`// TODO`, `// temp fix`).

---

## 6. Verification & Pre-Commit Protocol

Before claiming any task is done, agents **MUST** execute and pass:
1. `bun run check` - Must produce **0 errors and 0 warnings**.
2. `bun run lint`
3. `bun run test` - All unit tests must pass.
4. `bun run build` - Compilation with Cloudflare adapter must pass cleanly.
5. `STRICT_LINE_CAP=1 bun ../scripts/check-rules.ts src` - no emoji, no explicit `any`, no file over 200 lines.

Run test servers on `localhost` / `127.0.0.1` only (`bunx vite dev --host localhost --port 4177`), never on `0.0.0.0`.

---

## 7. Changelog & PR Delivery Workflow

For every implemented feature, bug fix, or visual refactor:
1. **Update Project Changelog**: Append changes to `./CHANGELOG.md`:
   ```markdown
   ## [Unreleased] - YYYY-MM-DD
   ### Added / Changed / Fixed
   - Clear description of backend, schema, and UI changes.
   ```
2. **Git Commit**: Commit with conventional commit convention (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`):
   - Professional, concise message without AI references.
3. **Pull Request Protocol**:
   - Create a feature branch: `git checkout -b feat/<feature-name>`.
   - Push to remote: `git push -u origin feat/<feature-name>`.
   - Submit PR via `gh pr create` with test evidence and a summary of D1 migrations applied.
