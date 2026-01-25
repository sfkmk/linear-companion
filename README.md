# Linear Companion

This Raycast extension connects the Linear macOS desktop app with your local filesystem. Its main purpose is to quickly switch contexts by opening the local project folder associated with the Linear issue you are currently viewing.

## Why this exists

When working on multiple issues, manually navigating to the correct local folder for each task can be repetitive. This extension automates that by reading the active window title from Linear, extracting the Issue ID (e.g., `ENG-123`), and finding the matching directory on your machine.

## Features

- **Open Issue Folder**: Detects the active issue in Linear and opens the matching local folder.
- **Copy Issue ID**: Extracts the Issue ID from the current Linear window and copies it to your clipboard.
- **Query Issue Folder**: A manual search interface to find folders by Issue ID. This handles cases where multiple folders might match or when you need to create a new folder for an issue.

## Configuration

You can configure the following settings in Raycast:

- **Projects Root**: The root directory where the extension searches for project folders (defaults to `~`).
- **New Folders Root**: The specific location where new project folders will be created.
- **Folder Naming**: Option to strip emojis from folder names if you prefer a cleaner filesystem structure.

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
