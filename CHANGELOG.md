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
- Redesigned course creation: replaced inline creation card with header "+ Create Course" button and spring-animated modal dialog.
- Restructured course management into 3 focused tabs: Course Content (Outline), Manage Members (Instructors & Students), and Settings (Metadata & Danger Zone).
- Cleaned up course outline: eliminated cluttering inline item rename inputs from the syllabus view, replaced with clean badges, direct item links, and an item editor entry point; kept section rename dialog.
- Implemented course member management: database-backed instructor delegation (`course_instructor` table, migration `0002_busy_skaar.sql`) and student enrollment tracking with live progress bars and unenroll controls.
- Enhanced member addition dialogs: upgraded both Add Instructor and Enroll Students modals to larger size (`lg`), integrated live user search API (`/api/users/search`), single-instructor picker with role delegation, and multi-student batch selection with selected queue preview and individual deselect controls.
- Cloudflare R2 course cover uploads: moved course cover image banner to the top of Settings with high-resolution 16:9 preview, direct R2 bucket file uploads (`/api/courses/[courseId]/cover`) with live client preview, and cover removal controls.
- Dialog-based section addition: replaced the inline outline section form with a clean header "+ Add Section" button and dedicated creation dialog.
- Fixed quiz editor 500 error: relaxed question option identifier validation regex to support flexible formats (such as opt_a, l1, r1) and corrected seed matching pairs.
- Randomized and shuffled quizzes: added configurable question count per attempt (randomly slicing N questions from larger banks), question order shuffling, and answer options order shuffling (migration `0003_windy_zuras.sql`).
- Admin user avatars: rendered user avatars in the administrator user management table (`/admin/users`) alongside names and badges.
