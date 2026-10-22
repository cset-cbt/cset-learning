# Changelog

All notable changes to CSET Learning are documented here, following Keep a Changelog.

## [Unreleased] - 2026-10-22

### Added
- Project bootstrap: SvelteKit 2 + Svelte 5 + Tailwind 4 on Cloudflare Workers with D1 (`cset-learning-db`) and R2 (`cset-learning-files`).
- Own accounts with Better Auth (email + password, `admin` plugin, D1-backed rate limiting); roles `student`, `instructor`, `admin`.
- Application shell with `cset-ui`: login, register, account settings, Vietnamese and English localization, public `/legal` page.
- Database schema for courses, sections, items, enrollment, progress, lessons, attachments, quizzes and coding exercises (migration `0000`).
- Shared course item access resolvers and the browser Markdown pipeline (markdown-it, highlight.js, KaTeX, DOMPurify).
- Course authoring, section and item outline reordering, and publishing validation.
- Theory lessons with Cloudflare R2 file attachments and sanitized Markdown viewer with KaTeX and syntax highlighting.
- Quiz engine supporting 6 question kinds (single choice, multiple choice, true/false, short answer, numeric, matching) with server-side secret grading and attempt limits.
- In-browser code runner executing Python (Pyodide), C++ (Clang WASM) and Java (TraceJVM) inside isolated Web Workers.
- Administrator portal for user role assignment, password resets, account suspension, and audit logging.
- Full-width responsive layout and unified form control heights across all views.
