# AGENTS.md

## Purpose

- This file is the repo contract for humans + coding agents.
- Keep it current when scripts, lint rules, commands, preferences, or architecture change.

## Project Snapshot

- Raycast extension (macOS) that maps the active Linear issue -> local folder.
- Commands:
  - `open-issue-folder` (no-view): happy path opens folder; launches UI only when needed.
  - `query-issue-folder` (view): resolve 0/many matches; can create a folder.
  - `copy-issue-id` (no-view): copies issue ID from the active Linear window title.

## Local Commands (Build / Lint / Dev)

- Install: `npm ci` (preferred; repo has `package-lock.json`) or `npm install`
- Dev (Raycast): `npm run dev` (runs `ray develop`)
- Build: `npm run build` (runs `ray build -e dist`, output in `dist/`)
- Lint: `npm run lint` (runs `ray lint`)
- Fix lint: `npm run fix-lint` (runs `ray lint --fix`)
- Typecheck: `npx tsc --noEmit`
- Format check: `npx prettier . --check`
- Format write: `npx prettier . --write`
- Publish (Raycast Store): `npm run publish`
- Do not: `npm publish` (blocked by `prepublishOnly`)

## Tests (Current + How To Run One Test)

- Current state:
  - Unit tests are configured with Vitest.
  - Default command: `npm run test` (runs `vitest run`).
  - Current suite includes `src/lib/linear.test.ts`.
- Manual smoke testing (still recommended for command UX):
  - Run `npm run dev`
  - Trigger each Raycast command and verify: toasts, empty states, Finder opening, folder creation.
- Vitest usage:
  - Run all: `npx vitest run`
  - Run one file: `npx vitest run path/to/foo.test.ts`
  - Run one test by name: `npx vitest run -t "test name"`
  - Watch mode: `npx vitest`
- Keep tests pure (no AppleScript/Finder calls) unless explicitly writing integration tests.

## Repo Layout (Follow This)

- Command entrypoints: `src/*.tsx` and must match `package.json#commands[].name`.
- UI components: `src/components/` (PascalCase filenames).
- Domain logic: `src/lib/` (no UI; reusable; can use Node APIs).
- Generic helpers: `src/utils/` (pure utilities).
- Docs: `resources/` contains Raycast best-practice notes.

## Generated / Do-Not-Edit Files

- `raycast-env.d.ts` is auto-generated from `package.json` (manifest).
- Do not edit `raycast-env.d.ts` manually; update `package.json` and re-run dev/build.

## Raycast Runtime Constraints (Hard Rules)

- Not a browser:
  - Do not use `window`, `document`, `navigator`, DOM elements, CSS files, or client routers.
- Use Raycast primitives:
  - `List`, `Form`, `ActionPanel`, `Detail`, `showToast`, `Clipboard`, `LocalStorage`, `Cache`, etc.
- Performance:
  - Never block render with synchronous work; use async APIs + `isLoading`.

## Formatting (Enforced)

- Prettier config (`.prettierrc`):
  - Semicolons: on (`semi: true`)
  - Quotes: single (`singleQuote: true`)
  - Line length: `printWidth: 120`
  - Indent: 2 spaces
  - Trailing commas: `es5`

## Imports (Enforced)

- ESLint `import/order` (see `eslint.config.js`):
  - Import statements are alphabetized.
  - Blank lines between import groups (`newlines-between: always`).
- Conventions:
  - Group order: Node builtins -> external packages -> internal relative imports.
  - Avoid unused imports; keep import lists tight.

## TypeScript (Repo Defaults)

- `strict: true` (see `tsconfig.json`); avoid `any`.
- Treat caught errors as `unknown` and narrow:
  - Prefer `error instanceof Error ? error.message : String(error)`
- Prefer the auto-generated Raycast types when possible:
  - `Preferences.*` and `Arguments.*` live in `raycast-env.d.ts`.
  - If you define a local preference type, name it `CommandPreferences` (avoid confusion with global `Preferences`).

## Naming Conventions

- Components: `PascalCase` (e.g., `IssueResolver`)
- Functions/vars: `camelCase` (e.g., `findIssueFolder`)
- Files:
  - Commands: kebab-case matching command name (e.g., `src/open-issue-folder.tsx`)
  - Lib/utils: kebab-case for multi-word modules (e.g., `folder-creator.ts`, `text-utils.ts`)
- Exports:
  - Command entrypoints: `export default function Command()` (async for no-view commands).
  - Shared logic: named exports from `src/lib/*`.

## UI / UX Rules

- Every interactive List item must have an `ActionPanel`.
- Primary action first; use standard shortcuts when adding refresh:
  - Refresh: Cmd+R
- Always provide:
  - Loading states (`isLoading`)
  - Empty states (`List.EmptyView`) with a clear next action
  - Error states via toasts (not console spam)

## Error Handling & User Messaging

- Use `showToast` for failures; keep messages actionable and short.
- Missing required preferences:
  - Show a failure toast with a primary action that calls `openExtensionPreferences()`.
- Never toast or log secrets; redact sensitive values.

## Platform Integration (macOS-specific)

- Linear:
  - Read active window title via AppleScript (`@raycast/utils` `runAppleScript`).
  - If Linear is not running / no window: return `null` and show a friendly toast.
- Filesystem + Finder:
  - Search uses Spotlight `mdfind` with a prefix match on folder name.
  - Avoid shell injection; prefer argument arrays (e.g., `execFile`) if touching command execution.
  - Use async filesystem APIs (`fs/promises`).

## Agent/Editor Rules

- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot instructions found in `.github/copilot-instructions.md`.
- When making changes:
  - Search the codebase first, keep edits minimal, and run `npm run lint` + `npm run build`.
