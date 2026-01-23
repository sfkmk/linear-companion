# Linear Companion - Raycast Extension Agent Guide

## Project Overview
**Linear Companion** is a Raycast extension designed to bridge the gap between the Linear desktop app (macOS) and the local filesystem. Its primary function is to read the currently active Linear issue and instantly open the corresponding local project folder.

## Core Features
1.  **Open Issue Folder:** Extracts the Issue ID (e.g., `ENG-123`) from the Linear window title, searches for a matching folder in a user-defined directory, and opens it in Finder.
2.  **Copy Issue ID:** A utility command to simply extract and copy the Issue ID to the clipboard.
3.  **Resolve Issue Folder:** A UI-based workflow to handle cases where 0 or multiple folders are found, allowing users to create new project folders or select from matches.

## Architecture

The project follows a modular architecture to promote code reuse and scalability.

### Directory Structure
```
/src
  /lib               # Domain-specific business logic (e.g., Linear, Filesystem) - NOT 'services'
  /components        # Reusable UI components
  /utils             # Generic helper functions
  open-issue-folder.tsx # Silent entry point for "Open Issue Folder"
  resolve-issue.tsx     # UI entry point for handling ambiguity/creation
  copy-issue-id.tsx     # Entry point for "Copy Issue ID"
```

### Key Components

#### `src/lib/linear.ts`
*   **Purpose:** Interface with the Linear macOS application.
*   **Mechanism:** Uses AppleScript (System Events) to fetch the title of the frontmost window of process "Linear".

#### `src/lib/finder.ts`
*   **Purpose:** File system search (`mdfind`) and Finder automation.
*   **Query:** Prefix match `kMDItemFSName == "{issueId}*"` to support folders named like "ENG-123 Feature Title".

#### `src/lib/folder-creator.ts`
*   **Purpose:** Logic for creating standardized project folders.
*   **Note:** Designed to be reused by any future command (e.g., "Create New Issue") that needs to generate a folder structure.

### Architectural Guidelines (Strict)

1.  **Modular Logic (`src/lib`):**
    *   Place all business logic in `src/lib`.
    *   **Do not** hardcode logic like "Create Folder" into a specific command's UI. It must be a reusable function in `src/lib`.
    *   **Reasoning:** Features like "folder creation" are core capabilities that different entry points (commands) might need. Keeping them separate ensures consistency across the extension.

2.  **Reusable Components (`src/components`):**
    *   Complex UI workflows (like "deciding what to do with an Issue ID") should be encapsulated in components (e.g., `<IssueResolver />`).
    *   **Reasoning:** If we add a "Create Issue" command later, it can reuse `<IssueResolver />` to handle the folder aspect without duplicating UI code.

3.  **Sub-Agents & Task Management:**
    *   **Rule:** Agents acting as project leads must use sub-agents for research, documentation lookup, or parallelizable tasks.
    *   **Rule:** Use `todowrite` extensively to track progress.
    *   **Reasoning:** This keeps the main agent's context focused on decision-making and implementation details while offloading routine information gathering.

## Development Workflow
*   **Build:** `npm run build`
*   **Dev Loop:** `npm run dev`
*   **Lint:** `npm run lint`

## Best Practices
*   **UI/UX:** Silent by default (`no-view`). Only show UI (`view`) when user decision is required (0 or >1 results).
*   **Two-Command Pattern:** Use `launchCommand` to switch from a silent background command to an interactive UI command when needed.
*   **Preferences:** Use standard Raycast preferences for configuration (e.g., `searchDirectory`, `newFolderLocation`). If a required preference is missing, prompt the user with a Toast to open Settings via `openExtensionPreferences()`.
