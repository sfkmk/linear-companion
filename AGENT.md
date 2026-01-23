# Linear Companion - Raycast Extension Agent Guide

## Project Overview
**Linear Companion** is a Raycast extension designed to bridge the gap between the Linear desktop app (macOS) and the local filesystem. Its primary function is to read the currently active Linear issue and instantly open the corresponding local project folder.

## Core Features
1.  **Open Issue Folder:** Extracts the Issue ID (e.g., `ENG-123`) from the Linear window title, searches for a matching folder in a user-defined directory, and opens it in Finder.
2.  **Copy Issue ID:** A utility command to simply extract and copy the Issue ID to the clipboard.

## Architecture

The project follows a modular service-based architecture within the standard Raycast structure.

### Directory Structure
```
/src
  /commands          # (Legacy/unused - commands are now at src root per Raycast convention)
  /services          # Core business logic and system integrations
    linear.ts        # AppleScript integration to read Linear.app state
    finder.ts        # 'mdfind' (Spotlight) wrapper and Finder automation
  /utils             # Shared utilities (currently empty)
  open-issue-folder.tsx # Entry point for "Open Issue Folder" command
  copy-issue-id.tsx     # Entry point for "Copy Issue ID" command
```

### Key Components

#### `src/services/linear.ts`
*   **Purpose:** Interface with the Linear macOS application.
*   **Mechanism:** Uses AppleScript to fetch the title of the frontmost window of process "Linear".
*   **Key Function:** `getLinearWindowTitle()` returns the raw title string.
*   **Key Function:** `extractIssueId(title)` uses Regex (`\b[A-Z]{2,5}-\d{1,5}\b`) to find the ID.

#### `src/services/finder.ts`
*   **Purpose:** File system search and Finder control.
*   **Mechanism:** Uses `mdfind` (macOS Spotlight CLI) for instant recursive search.
*   **Query:** `kMDItemContentType == "public.folder" && kMDItemFSName == "{issueId}"` (Exact name match).
*   **Key Function:** `findIssueFolder(issueId, rootDir)` returns an array of absolute paths.
*   **Key Function:** `openFolderInFinder(path)` uses AppleScript to focus Finder and open the path.

## Development Workflow

### specific commands
*   **Build:** `npm run build`
*   **Dev Loop:** `npm run dev` (Runs the Raycast local development server)
*   **Lint:** `npm run lint` / `npm run fix-lint`

### Important Constraints
1.  **macOS Only:** Relies heavily on AppleScript and Spotlight (`mdfind`).
2.  **Linear App:** Requires the desktop app, not the web version.
3.  **Spotlight Indexing:** The target directory *must* be indexed by Spotlight for `mdfind` to work.

## Best Practices for Future Agents
*   **UI/UX:** Use `showToast` for feedback. Use `Toast.Style.Failure` for errors but keep messages helpful.
*   **Optimistic UI:** Show "Searching..." toast immediately before kicking off the `mdfind` process.
*   **Permissions:** Raycast handles AppleScript permissions, but be aware that the first run might prompt the user.
*   **Path Handling:** Always use absolute paths. The `preferences.searchDirectory` returns an absolute path.

## Future Roadmap (Potential)
*   **Fuzzy Search:** If exact match fails, try partial matching?
*   **Multiple Results:** If multiple folders match `ENG-123`, show a list in Raycast for the user to pick one.
*   **Configurable Regex:** Allow users to define their own project code format if it differs from standard Linear pattern.
