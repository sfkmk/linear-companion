# Raycast Extension Best Practices

## 1. Project Structure Conventions
*   **Root Level:** `package.json`, `tsconfig.json`, `raycast.json` (manifest).
*   **Source Directory (`/src`):**
    *   **Entry Points:** Corresponds to commands in `package.json` (e.g., `src/index.tsx`).
    *   **Components:** `src/components/` for reusable UI.
    *   **Hooks:** `src/hooks/` for custom logic.
    *   **Services:** `src/services/` for integrations (e.g., Linear, Finder).
    *   **Utils:** `src/utils/` for helpers.
    *   **Types:** `src/types/` for interfaces.
*   **Assets:** `assets/` for images/icons.

## 2. Error Handling UX
*   **Toast (Preferred):** Use `showToast` with `Style.Failure` for transient errors.
    *   *Best Practice:* Specific messages, not generic.
*   **Detail View:** Use `<Detail />` for complex errors/setup.
*   **Alert:** Use sparingly (irreversible actions).
*   **Empty States:** Use `List.EmptyView`.

## 3. AppleScript Execution
*   **Use `@raycast/utils`:** Prefer `runAppleScript` utility.
*   **Handling Output:** Parse carefully.
*   **Timeouts:** Consider timeouts (default 10s).
*   **Weak Dependencies:** Gracefully handle if the target app (Linear) is not running.

## 4. Performance Guidelines
*   **Optimistic UI:** Update state immediately.
*   **Loading States:** Always use `isLoading`.
*   **Caching:** Use `Cache` or `useCachedPromise` to avoid blank screens.
*   **File System:** Avoid synchronous operations in render loop. Use `usePromise` or `useExec`.
